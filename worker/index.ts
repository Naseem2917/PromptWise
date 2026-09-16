export interface Env {
	GEMINI_API_KEY: string
}

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
}

// ── Model constants ────────────────────────────────────────────────────────────

const MODEL_LITE  = 'gemini-3.5-flash-lite'
const MODEL_MID   = 'gemini-3.6-flash'
const MODEL_HIGH  = 'gemini-3.7-flash'

/**
 * Analyze (follow-up questions) always uses the lightweight chain.
 * This is independent of the user's selected mode.
 */
const ANALYZE_MODELS = [MODEL_LITE, MODEL_MID, MODEL_HIGH]

/**
 * Final improvement model chains, keyed by user-selected mode.
 * Primary model differs; the others serve as immediate fallbacks.
 */
const FINAL_MODELS: Record<string, string[]> = {
	low:    [MODEL_LITE, MODEL_MID, MODEL_HIGH],
	medium: [MODEL_MID,  MODEL_HIGH, MODEL_LITE],
	high:   [MODEL_HIGH, MODEL_MID,  MODEL_LITE],
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Strip markdown code fences that Gemini sometimes wraps around JSON */
function safeParseJSON(raw: string): unknown {
	const stripped = raw
		.replace(/^```(?:json)?\s*/i, '')
		.replace(/\s*```\s*$/, '')
		.trim()
	return JSON.parse(stripped)
}

/**
 * Calculate deterministic score (0 to 100) from 6-point breakdown.
 * Evaluates 3-state elements:
 * - full / true: 1.0 weight (16.7 pts)
 * - partial: 0.5 weight (8.3 pts)
 * - missing / false: 0 weight (0 pts)
 */
function calculateScoreFromBreakdown(breakdown?: Record<string, unknown>): number {
	if (!breakdown || typeof breakdown !== 'object') return 0
	const keys = ['goal', 'context', 'audience', 'specificity', 'outputFormat', 'constraints']
	let weightedSum = 0
	for (const k of keys) {
		const val = breakdown[k]
		if (val === true || val === 'full') {
			weightedSum += 1.0
		} else if (val === 'partial') {
			weightedSum += 0.5
		}
	}
	return Math.round((weightedSum / 6) * 100)
}

/**
 * Returns true if the HTTP status code signals a transient/overload error
 * that warrants trying the next model in the fallback chain.
 * Non-retryable errors (401, 403, 400, etc.) will NOT trigger a model switch.
 */
function isRetryableStatus(status: number): boolean {
	return [429, 500, 502, 503, 504].includes(status)
}

// ── Core Gemini caller (single model, with timeout) ───────────────────────────

const REQUEST_TIMEOUT_MS = 20_000   // 20 s per-model timeout

async function callGemini(
	apiKey: string,
	model: string,
	userPrompt: string,
	systemPrompt: string,
): Promise<string> {
	const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

	const controller = new AbortController()
	const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

	let response: Response
	try {
		response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-goog-api-key': apiKey,          // key in header, NOT in URL query string
			},
			body: JSON.stringify({
				contents: [{ parts: [{ text: userPrompt }] }],
				systemInstruction: { parts: [{ text: systemPrompt }] },
				generationConfig: {
					responseMimeType: 'application/json',
					temperature: 0.1,
				},
			}),
			signal: controller.signal,
		})
	} finally {
		clearTimeout(timer)
	}

	if (!response.ok) {
		const errBody = await response.text().catch(() => response.statusText)
		const err = new Error(`Gemini ${response.status}: ${errBody}`) as Error & { status: number }
		err.status = response.status
		throw err
	}

	const data = await response.json() as {
		candidates: { content: { parts: { text: string }[] } }[]
	}
	return data.candidates[0].content.parts[0].text
}

// ── Multi-model caller with immediate fallback ─────────────────────────────────

interface GeminiResult {
	text: string
	modelUsed: string
	latencyMs: number
}

async function callWithModelList(
	apiKey: string,
	models: string[],
	userPrompt: string,
	systemPrompt: string,
): Promise<GeminiResult> {
	let lastError: Error = new Error('No models available')

	for (const model of models) {
		const start = Date.now()
		try {
			const text = await callGemini(apiKey, model, userPrompt, systemPrompt)
			return { text, modelUsed: model, latencyMs: Date.now() - start }
		} catch (err: unknown) {
			const e = err as Error & { status?: number }
			lastError = e

			// Abort = timeout → try next model immediately
			if (e.name === 'AbortError') {
				console.warn(`[Gemini] ${model} timed out. Trying next model…`)
				continue
			}

			// Retryable server/overload error → try next model immediately
			if (e.status !== undefined && isRetryableStatus(e.status)) {
				console.warn(`[Gemini] ${model} returned ${e.status}. Trying next model…`)
				continue
			}

			// Non-retryable (401 bad key, 400 bad request, etc.) → stop immediately
			console.error(`[Gemini] ${model} returned non-retryable error ${e.status ?? 'unknown'}. Aborting fallback.`)
			throw e
		}
	}

	throw lastError
}

// ── System prompts ─────────────────────────────────────────────────────────────

const ANALYZE_SYSTEM_PROMPT = `You are PromptWise, an intelligent AI literacy assistant that helps students evaluate and master prompt engineering.

FIRST, determine whether the student's input contains a meaningful, actionable intent:
- Meaningful input: Even if brief (e.g. "Python loops", "write resume", "make website", "help me debug SQL"), there is an understandable domain or goal.
- Unclear/vague input: The request is too ambiguous, empty of substance, or lacks a clear objective (e.g. "something for my project", "help me with stuff", "do it").
- Do NOT classify unusual or non-English/Hinglish natural language (e.g. "mouse kaisa hain", "gali") as invalid if intent can be derived.

CASE 1: If the input is too vague or lacks clear actionable intent:
Return status "needs_clarification" and ask ONLY this single question:
{
  "status": "needs_clarification",
  "needsQuestions": true,
  "scoreBefore": 0,
  "scoreBreakdown": {
    "goal": "missing",
    "context": "missing",
    "audience": "missing",
    "specificity": "missing",
    "outputFormat": "missing",
    "constraints": "missing"
  },
  "questions": [
    {
      "id": "clarification",
      "question": "What specific goal would you like to achieve?",
      "type": "text"
    }
  ]
}

CASE 2: If the input is meaningful ("valid"):
Evaluate each of the 6 core elements using the 3-STATE EVIDENCE SYSTEM:
Each element MUST be evaluated as either "full", "partial", or "missing":
- "full": Explicitly and clearly stated by the student.
- "partial": Implied, hinted at, surface-level, or broad/vague (e.g., student mentions simple language implying beginner level, but without explicitly naming the reader; or general topic mentioned but without defined sub-boundaries).
- "missing": Completely absent.

1. goal ("full" | "partial" | "missing"):
   - "full": Clearly states the exact task/action (e.g. "Explain recursion", "Write a cold email", "Summarize an article").
   - "partial": Ambiguous action (e.g. "something with recursion", "python doubt").
   - "missing": No action specified.

2. context ("full" | "partial" | "missing"):
   - "full": Explicitly describes situational background, use case, project details, or environment (e.g., "for my final year CS project", "preparing for a Google interview", "we are deploying on AWS").
   - "partial": Mentions a brief setting without depth (e.g., "for my college", "for an exam").
   - "missing": No background, environment, or use case provided.

3. audience ("full" | "partial" | "missing"):
   - "full": Explicitly specifies target reader/learner persona (e.g., "for a 1st-year BCA beginner", "for busy senior recruiters", "explain to a 10-year-old").
   - "partial": Implied through tone/adjectives without defining the persona (e.g., "in simple language" or "in easy hinglish" implies beginner level, but does not explicitly name the audience persona).
   - "missing": No target reader or learner mentioned or implied.

4. specificity ("full" | "partial" | "missing"):
   - "full": Clearly narrows scope to exact subtopics, functions, libraries, or edge cases (e.g., "singly linked lists traversal in C++", "cold email for an entry-level Python role highlighting REST APIs").
   - "partial": Mentions a broad domain or general concept (e.g., "recursion in data structures" or "Python development") without granular subtopic boundaries.
   - "missing": Bare 1-word topic (e.g. "Python", "resume").

5. outputFormat ("full" | "partial" | "missing"):
   - "full": Explicit structural layout requested (e.g., "comparison table", "bullet points with code snippets", "3 short paragraphs with placeholders").
   - "partial": Vague structure mentioned (e.g. "keep it structured", "step by step").
   - "missing": No format requested.

6. constraints ("full" | "partial" | "missing"):
   - "full": Explicit boundaries, negative rules, word limits, or language/tone constraints (e.g., "in simple hinglish", "under 150 words", "avoid technical jargon").
   - "partial": General tone mentioned (e.g. "make it good", "short").
   - "missing": No boundaries or constraints given.

CRITICAL RULE — TOPIC KEYWORD ISOLATION:
If the user's prompt is asking TO LEARN ABOUT prompt engineering concepts (e.g. "Explain The 6 Core Building Blocks: Goal, Context, Audience, Specificity, Output Format, Constraints"), those words are the SUBJECT MATTER of their study, NOT metadata they provided! You must evaluate whether they provided their OWN audience, their OWN context, their OWN output format. If not, mark them "missing"!

CRITICAL RULE — QUESTION ↔ BREAKDOWN CONSISTENCY:
If you generate a follow-up question asking the student about an element (e.g. asking about audience, context, or format), that corresponding element in scoreBreakdown MUST NOT be "full"! (It should be "missing" or "partial").

Generate 0 to 4 adaptive follow-up questions ONLY for elements that are "missing" or "partial":
- If all needed elements are already "full" or prompt is fully detailed, set needsQuestions: false and questions: [].
- Follow-up questions can be either "options" (mutually exclusive choices, provide 3-4 options) or "text" (open-ended short answer, omit options) depending on what is most helpful.
- QUESTION ORDERING: Always place "options" questions FIRST, and place open-ended "text" questions LAST in the questions array.

Return ONLY valid JSON (no markdown fences, no explanation outside JSON):
{
  "status": "valid",
  "needsQuestions": boolean,
  "scoreBefore": number,
  "scoreBreakdown": {
    "goal": "full | partial | missing",
    "context": "full | partial | missing",
    "audience": "full | partial | missing",
    "specificity": "full | partial | missing",
    "outputFormat": "full | partial | missing",
    "constraints": "full | partial | missing"
  },
  "questions": [
    {
      "id": "string (short snake_case key, e.g. target_topic)",
      "question": "string (friendly, conversational, 1 sentence)",
      "type": "options | text",
      "options": ["string"]
    }
  ]
}`

const IMPROVE_SYSTEM_PROMPT = `You are PromptWise, an AI literacy assistant that helps students write better prompts for Generative AI tools.

Given an original student prompt, any clarifications from verification, and their answers to follow-up questions, generate a significantly improved, detailed, and effective prompt using prompt engineering best practices.

The improved prompt must clearly address all 6 elements where relevant:
1. goal        — Clear objective
2. context     — Relevant background
3. audience    — Who it's for
4. specificity — Specific topic details
5. outputFormat — Expected structure/format
6. constraints — Limitations or requirements

Return ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "improvedPrompt": "string (the complete improved prompt, use newlines for readability)",
  "scoreAfter": number,
  "scoreBreakdown": {
    "goal": "full | partial | missing",
    "context": "full | partial | missing",
    "audience": "full | partial | missing",
    "specificity": "full | partial | missing",
    "outputFormat": "full | partial | missing",
    "constraints": "full | partial | missing"
  },
  "explanation": [
    {
      "label": "string (e.g. Added Target Audience)",
      "detail": "string (e.g. Specified for a beginner B.Sc. IT student to set appropriate depth)"
    }
  ]
}

Rules:
- improvedPrompt must be noticeably more detailed and effective than the original
- scoreAfter must NEVER be lower than scoreBefore. If the original prompt is already optimal (e.g. scoreBefore is 95–100), preserve its score rather than artificially lowering it. If the original prompt has scoreBefore = 100, scoreAfter must be 100.
- Provide 3–5 explanation items — each teaching the student WHY the change matters
- Keep the explanation educational and encouraging in tone`

// ── Main handler ───────────────────────────────────────────────────────────────

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url)

		// CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: CORS_HEADERS })
		}

		// ── GET /api/health ────────────────────────────────────────────────
		if (url.pathname === '/api/health') {
			return Response.json(
				{ success: true, message: 'PromptWise API is working' },
				{ headers: CORS_HEADERS },
			)
		}

		// ── POST /api/analyze ──────────────────────────────────────────────
		// Always uses ANALYZE_MODELS (lite → mid → high) regardless of mode.
		// mode is accepted in the body for flow consistency but ignored here.
		if (url.pathname === '/api/analyze' && request.method === 'POST') {
			try {
				const body = await request.json() as { prompt?: string; clarification?: string; mode?: string }
				const prompt = body?.prompt?.trim()
				const clarification = body?.clarification?.trim()

				if (!prompt) {
					return Response.json(
						{ error: 'Please enter a prompt first.' },
						{ status: 400, headers: CORS_HEADERS },
					)
				}

				const userContent = clarification
					? `Student's original prompt: "${prompt}"\nStudent's clarification: "${clarification}"`
					: `Student's prompt: "${prompt}"`

				const { text, modelUsed, latencyMs } = await callWithModelList(
					env.GEMINI_API_KEY,
					ANALYZE_MODELS,
					userContent,
					ANALYZE_SYSTEM_PROMPT,
				)

				const parsed = safeParseJSON(text) as any
				if (parsed?.questions && Array.isArray(parsed.questions)) {
					parsed.questions.sort((a: any, b: any) => {
						if (a.type === 'text' && b.type !== 'text') return 1
						if (a.type !== 'text' && b.type === 'text') return -1
						return 0
					})

					// Question ↔ Breakdown consistency guard:
					// If a question asks about audience, context, format, etc., that element MUST NOT be full/true!
					if (parsed.scoreBreakdown && typeof parsed.scoreBreakdown === 'object') {
						for (const q of parsed.questions) {
							const qText = `${q.id} ${q.question}`.toLowerCase()
							if (qText.includes('audience') || qText.includes('who is') || qText.includes('target reader')) {
								if (parsed.scoreBreakdown.audience === true || parsed.scoreBreakdown.audience === 'full') {
									parsed.scoreBreakdown.audience = 'missing'
								}
							}
							if (qText.includes('context') || qText.includes('background') || qText.includes('scenario') || qText.includes('use case')) {
								if (parsed.scoreBreakdown.context === true || parsed.scoreBreakdown.context === 'full') {
									parsed.scoreBreakdown.context = 'missing'
								}
							}
							if (qText.includes('format') || qText.includes('layout') || qText.includes('structure')) {
								if (parsed.scoreBreakdown.outputFormat === true || parsed.scoreBreakdown.outputFormat === 'full') {
									parsed.scoreBreakdown.outputFormat = 'missing'
								}
							}
						}
					}
				}

				// Deterministic Score Calculation: Math.round((trueCount / 6) * 100)
				if (parsed?.scoreBreakdown) {
					parsed.scoreBefore = calculateScoreFromBreakdown(parsed.scoreBreakdown)
				}
				console.log(`[analyze] model=${modelUsed} scoreBefore=${parsed?.scoreBefore} latency=${latencyMs}ms`)

				return Response.json({ success: true, data: parsed }, { headers: CORS_HEADERS })
			} catch (err: unknown) {
				const msg = (err as Error).message ?? String(err)
				console.error('Analyze error:', msg)

				let friendlyMsg = 'Could not analyze your prompt. Please try again.'
				if (msg.includes('503') || msg.toLowerCase().includes('high demand') || msg.toLowerCase().includes('unavailable')) {
					friendlyMsg = 'The AI service is currently experiencing very high demand. Please wait a few seconds and try again.'
				} else if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit')) {
					friendlyMsg = 'AI rate limit reached. Please wait a moment before trying again.'
				}

				return Response.json(
					{ error: friendlyMsg, rawError: msg },
					{ status: 500, headers: CORS_HEADERS },
				)
			}
		}

		// ── POST /api/improve ──────────────────────────────────────────────
		// Uses model chain from FINAL_MODELS[mode]. Defaults to "medium".
		if (url.pathname === '/api/improve' && request.method === 'POST') {
			try {
				const body = await request.json() as {
					originalPrompt?: string
					clarifications?: string[]
					answers?: Record<string, string | string[]>
					scoreBefore?: number
					scoreBreakdown?: Record<string, unknown>
					mode?: string
				}
				const { originalPrompt, clarifications, answers, scoreBefore, scoreBreakdown, mode } = body

				if (!originalPrompt?.trim()) {
					return Response.json(
						{ error: 'Original prompt is required.' },
						{ status: 400, headers: CORS_HEADERS },
					)
				}

				// Normalise and validate mode — fall back to "medium" for any unknown value
				const normalisedMode = (mode ?? 'medium').toLowerCase()
				const modelChain = FINAL_MODELS[normalisedMode] ?? FINAL_MODELS['medium']

				const clarificationsText =
					clarifications && clarifications.length > 0
						? `\n\nClarifications provided during verification:\n${clarifications
								.filter(Boolean)
								.map((c) => `- ${c}`)
								.join('\n')}`
						: ''

				const answersText =
					answers && Object.keys(answers).length > 0
						? `\n\nStudent's answers to follow-up questions:\n${Object.entries(answers)
								.filter(([, v]) => v !== '' && (Array.isArray(v) ? v.length > 0 : true))
								.map(([k, v]) => `- ${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
								.join('\n')}`
						: '\n\nNo follow-up questions were needed — the prompt was already detailed enough.'

				const userContent = `Original prompt: "${originalPrompt}"${clarificationsText}${answersText}\n\nOriginal score: ${scoreBefore ?? 'unknown'}\nOriginal breakdown: ${JSON.stringify(scoreBreakdown ?? {})}`

				const { text, modelUsed, latencyMs } = await callWithModelList(
					env.GEMINI_API_KEY,
					modelChain,
					userContent,
					IMPROVE_SYSTEM_PROMPT,
				)

				const parsed = safeParseJSON(text) as any

				// Calculate deterministic scoreAfter directly from scoreBreakdown
				if (parsed?.scoreBreakdown) {
					parsed.scoreAfter = calculateScoreFromBreakdown(parsed.scoreBreakdown)
				}

				// Monotonic safety: improved prompt score must not fall below original score
				if (parsed && typeof parsed.scoreAfter === 'number' && typeof scoreBefore === 'number') {
					if (parsed.scoreAfter < scoreBefore) {
						parsed.scoreAfter = Math.min(100, Math.max(scoreBefore, parsed.scoreAfter))
					}
				}
				console.log(`[improve] mode=${normalisedMode} model=${modelUsed} scoreAfter=${parsed?.scoreAfter} latency=${latencyMs}ms`)

				return Response.json({ success: true, data: parsed }, { headers: CORS_HEADERS })
			} catch (err: unknown) {
				const msg = (err as Error).message ?? String(err)
				console.error('Improve error:', msg)

				let friendlyMsg = 'Could not improve your prompt. Please try again.'
				if (msg.includes('503') || msg.toLowerCase().includes('high demand') || msg.toLowerCase().includes('unavailable')) {
					friendlyMsg = 'The AI service is currently experiencing very high demand. Please wait a few seconds and try again.'
				} else if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit')) {
					friendlyMsg = 'AI rate limit reached. Please wait a moment before trying again.'
				}

				return Response.json(
					{ error: friendlyMsg, rawError: msg },
					{ status: 500, headers: CORS_HEADERS },
				)
			}
		}

		// ── GET /api/quiz ──────────────────────────────────────────────────
		// Generates a fresh set of 6 unique quiz questions using the lite model.
		// Uses ANALYZE_MODELS chain for speed. GET is used so browser can cache
		// per session; no secrets needed in request body.
		if (url.pathname === '/api/quiz' && request.method === 'GET') {
			try {
				const QUIZ_SYSTEM_PROMPT = `You are a senior AI literacy educator creating a quiz for students learning prompt engineering.

Generate exactly 6 unique multiple-choice questions. Each question MUST cover a DIFFERENT topic from this pool:
- Few-Shot Prompting
- Chain of Thought (CoT) reasoning
- Zero-Shot Prompting
- Role / Persona assignment
- Negative Constraints
- Delimiter usage and prompt injection
- Hallucination mitigation
- Temperature and sampling parameters
- Token context windows
- Output format specification (JSON, markdown, lists)
- Grounding and retrieval-augmented prompts
- System prompt vs user prompt distinction
- Prompt chaining / multi-step workflows

Rules:
- Each question must have exactly 4 options (A, B, C, D).
- Exactly ONE option is clearly correct; the others are plausible but wrong.
- correctIdx is the 0-based index of the correct option (0=A, 1=B, 2=C, 3=D).
- Vary which index is correct across questions — do NOT always set correctIdx to 1.
- The explanation must be 1–2 sentences explaining WHY the correct answer is right.
- Questions must be at Intermediate to Advanced level — no trivial or obvious questions.
- Do NOT repeat topics across the 6 questions.

Return ONLY valid JSON — no markdown, no text outside JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctIdx": number,
      "explanation": "string"
    }
  ]
}`

				const { text, modelUsed, latencyMs } = await callWithModelList(
					env.GEMINI_API_KEY,
					ANALYZE_MODELS,
					'Generate 6 unique prompt engineering quiz questions now.',
					QUIZ_SYSTEM_PROMPT,
				)

				const parsed = safeParseJSON(text)
				console.log(`[quiz] model=${modelUsed} latency=${latencyMs}ms`)

				return Response.json({ success: true, data: parsed }, { headers: CORS_HEADERS })
			} catch (err: unknown) {
				const msg = (err as Error).message ?? String(err)
				console.error('Quiz error:', msg)
				return Response.json(
					{ error: `Could not generate quiz questions. Please try again. (${msg})` },
					{ status: 500, headers: CORS_HEADERS },
				)
			}
		}

		return Response.json(
			{ success: false, message: 'API route not found' },
			{ status: 404, headers: CORS_HEADERS },
		)
	},
}