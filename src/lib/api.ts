import type { AnalyzeResponse, ImproveResponse, QuestionAnswers, ScoreBreakdown } from '../types'

export type ResponseMode = 'low' | 'medium' | 'high'

// Same origin — Vite dev server proxies /api/* to the Worker locally;
// in production the Cloudflare Worker serves both static assets and the API.
const API_BASE = ''

function formatFriendlyError(rawError: string, fallbackMessage: string): string {
  // Always log raw error details to developer console
  console.error('[PromptWise API Error Details]:', rawError)

  const lower = rawError.toLowerCase()

  // 503 / High demand / capacity errors
  if (lower.includes('503') || lower.includes('high demand') || lower.includes('unavailable') || lower.includes('capacity')) {
    return 'The AI service is currently experiencing very high demand. Please wait a few seconds and try again.'
  }

  // 429 / Rate limit errors
  if (lower.includes('429') || lower.includes('quota') || lower.includes('rate limit') || lower.includes('resource_exhausted')) {
    return 'Rate limit reached. Please wait a moment before trying again.'
  }

  // Network / Connection issues
  if (lower.includes('abort') || lower.includes('timeout') || lower.includes('failed to fetch') || lower.includes('network')) {
    return 'Connection timed out or network issue. Please check your internet and try again.'
  }

  // Generic clean fallback without raw JSON dumps
  return fallbackMessage
}

export async function analyzePrompt(
  prompt: string,
  mode: ResponseMode,
  clarification?: string,
): Promise<AnalyzeResponse> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // mode is passed for flow/state consistency — Worker ignores it for model selection
      body: JSON.stringify({ prompt, mode, clarification }),
    })
  } catch (err: unknown) {
    const raw = (err as Error)?.message ?? String(err)
    throw new Error(formatFriendlyError(raw, 'Unable to connect to the server. Please check your connection and try again.'))
  }

  const json = await res.json() as { success?: boolean; data?: AnalyzeResponse; error?: string }

  if (!res.ok || !json.success) {
    const raw = json.error ?? `Server error (${res.status})`
    throw new Error(formatFriendlyError(raw, 'Could not analyze your prompt right now. Please try again in a moment.'))
  }

  return json.data!
}

export async function improvePrompt(
  originalPrompt: string,
  answers: QuestionAnswers,
  scoreBefore: number,
  scoreBreakdown: ScoreBreakdown,
  mode: ResponseMode,
  clarifications?: string[],
): Promise<ImproveResponse> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/improve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalPrompt, answers, scoreBefore, scoreBreakdown, mode, clarifications }),
    })
  } catch (err: unknown) {
    const raw = (err as Error)?.message ?? String(err)
    throw new Error(formatFriendlyError(raw, 'Unable to connect to the server. Please check your connection and try again.'))
  }

  const json = await res.json() as { success?: boolean; data?: ImproveResponse; error?: string }

  if (!res.ok || !json.success) {
    const raw = json.error ?? `Server error (${res.status})`
    throw new Error(formatFriendlyError(raw, 'Could not improve your prompt right now. Please try again in a moment.'))
  }

  return json.data!
}
