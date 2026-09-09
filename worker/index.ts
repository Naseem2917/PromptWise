export interface Env {
	GEMINI_API_KEY: string
}

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
}

const PRIMARY_MODEL = 'gemini-3.6-flash'

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Strip markdown code fences that Gemini sometimes wraps around JSON */
function safeParseJSON(raw: string): unknown {
	const stripped = raw
		.replace(/^```(?:json)?\s*/i, '')
		.replace(/\s*```\s*$/, '')
		.trim()
	return JSON.parse(stripped)
}

// ── Gemini helpers ────────────────────────────────────────────────────────────

async function callGemini(
	apiKey: string,
	model: string,
	userPrompt: string,
	systemPrompt: string,
): Promise<string> {
	const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
	const response = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			contents: [{ parts: [{ text: userPrompt }] }],
			systemInstruction: { parts: [{ text: systemPrompt }] },
		}),
	})

	if (!response.ok) {
		// Read actual Gemini error body for proper debugging
		const errBody = await response.text()
		throw new Error(`Gemini ${response.status}: ${errBody}`)
	}

	const data = await response.json() as { candidates: { content: { parts: { text: string }[] } }[] }
	return data.candidates[0].content.parts[0].text
}

async function callGeminiWithFallback(
	apiKey: string,
	userPrompt: string,
	systemPrompt: string,
	attempt = 1,
): Promise<string> {
	try {
		return await callGemini(apiKey, PRIMARY_MODEL, userPrompt, systemPrompt)
	} catch (e: unknown) {
		const msg = (e as Error).message ?? ''
		// Retry up to 3 times on 503 (temporary overload)
		if (msg.includes('503') && attempt < 3) {
			await new Promise(r => setTimeout(r, 1000 * attempt))
			return callGeminiWithFallback(apiKey, userPrompt, systemPrompt, attempt + 1)
		}
		throw e
	}
}

// ── System prompts ────────────────────────────────────────────────────────────

const ANALYZE_SYSTEM_PROMPT = `You are PromptWise, an AI literacy assistant that helps students write better prompts for Generative AI tools.

Analyze the student's prompt and evaluate it against these 6 elements:
1. goal        — Does it clearly state what the user wants?
2. context     — Does it provide relevant background information?
3. audience    — Does it specify who the content is for?
4. specificity — Is it specific enough about the topic?
5. outputFormat — Does it specify how the output should look?
6. constraints — Does it include limitations or requirements?

Score: each present element = approximately 16-17 points (max 100).

Identify the 1-4 MOST IMPORTANT missing elements for this specific prompt type and generate smart, friendly follow-up questions for those only.
Do NOT ask about every missing element — be selective and intelligent.
If the prompt already contains all necessary information, return no questions.

Return ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "needsQuestions": boolean,
  "scoreBefore": number,
  "scoreBreakdown": {
    "goal": boolean,
    "context": boolean,
    "audience": boolean,
    "specificity": boolean,
    "outputFormat": boolean,
    "constraints": boolean
  },
  "questions": [
    {
      "id": "string (short snake_case key, e.g. audience)",
      "question": "string (friendly, conversational, 1 sentence)",
      "type": "single_choice | multi_choice | text | toggle",
      "options": ["string"]
    }
  ]
}

Question type guide:
- single_choice  : mutually exclusive options — provide 3-4 options
- multi_choice   : select all that apply — provide 3-6 options
- text           : open-ended short answer — do NOT include options
- toggle         : simple yes/no — do NOT include options

Maximum 4 questions. Minimum 0 questions.`

const IMPROVE_SYSTEM_PROMPT = `You are PromptWise, an AI literacy assistant that helps students write better prompts for Generative AI tools.

Given an original student prompt and their answers to follow-up questions, generate a significantly improved, detailed, and effective prompt using prompt engineering best practices.

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
    "goal": boolean,
    "context": boolean,
    "audience": boolean,
    "specificity": boolean,
    "outputFormat": boolean,
    "constraints": boolean
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
- scoreAfter is typically 75–95 for a well-improved prompt
- Provide 3–5 explanation items — each teaching the student WHY the change matters
- Keep the explanation educational and encouraging in tone`

// ── Main handler ──────────────────────────────────────────────────────────────

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url)

		// CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: CORS_HEADERS })
		}

		// ── GET /api/health ──────────────────────────────────────────────────
		if (url.pathname === '/api/health') {
			return Response.json(
				{ success: true, message: 'PromptWise API is working' },
				{ headers: CORS_HEADERS },
			)
		}

		// ── POST /api/analyze ────────────────────────────────────────────────
		if (url.pathname === '/api/analyze' && request.method === 'POST') {
			try {
				const body = await request.json() as { prompt?: string }
				const prompt = body?.prompt?.trim()

				if (!prompt) {
					return Response.json(
						{ error: 'Please enter a prompt first.' },
						{ status: 400, headers: CORS_HEADERS },
					)
				}

				const result = await callGeminiWithFallback(
					env.GEMINI_API_KEY,
					`Student's prompt: "${prompt}"`,
					ANALYZE_SYSTEM_PROMPT,
				)
				const parsed = safeParseJSON(result)

				return Response.json({ success: true, data: parsed }, { headers: CORS_HEADERS })
			} catch (err: unknown) {
				const msg = (err as Error).message ?? String(err)
				console.error('Analyze error:', msg)
				return Response.json(
					{ error: `Analyze failed: ${msg}` },
					{ status: 500, headers: CORS_HEADERS },
				)
			}
		}

		// ── POST /api/improve ────────────────────────────────────────────────
		if (url.pathname === '/api/improve' && request.method === 'POST') {
			try {
				const body = await request.json() as {
					originalPrompt?: string
					answers?: Record<string, string | string[]>
					scoreBefore?: number
					scoreBreakdown?: Record<string, boolean>
				}
				const { originalPrompt, answers, scoreBefore, scoreBreakdown } = body

				if (!originalPrompt?.trim()) {
					return Response.json(
						{ error: 'Original prompt is required.' },
						{ status: 400, headers: CORS_HEADERS },
					)
				}

				const answersText =
					answers && Object.keys(answers).length > 0
						? `\n\nStudent's answers to follow-up questions:\n${Object.entries(answers)
								.filter(([, v]) => v !== '' && (Array.isArray(v) ? v.length > 0 : true))
								.map(([k, v]) => `- ${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
								.join('\n')}`
						: '\n\nNo follow-up questions were needed — the prompt was already detailed enough.'

				const userContent = `Original prompt: "${originalPrompt}"${answersText}\n\nOriginal score: ${scoreBefore ?? 'unknown'}\nOriginal breakdown: ${JSON.stringify(scoreBreakdown ?? {})}`

				const result = await callGeminiWithFallback(
					env.GEMINI_API_KEY,
					userContent,
					IMPROVE_SYSTEM_PROMPT,
				)
				const parsed = safeParseJSON(result)

				return Response.json({ success: true, data: parsed }, { headers: CORS_HEADERS })
			} catch (err: unknown) {
				const msg = (err as Error).message ?? String(err)
				console.error('Improve error:', msg)
				return Response.json(
					{ error: `Improve failed: ${msg}` },
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