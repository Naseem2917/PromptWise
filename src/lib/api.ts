import type { AnalyzeResponse, ImproveResponse, QuestionAnswers, ScoreBreakdown } from '../types'

export type ResponseMode = 'low' | 'medium' | 'high'

// Same origin — Vite dev server proxies /api/* to the Worker locally;
// in production the Cloudflare Worker serves both static assets and the API.
const API_BASE = ''

export async function analyzePrompt(
  prompt: string,
  mode: ResponseMode,
  clarification?: string,
): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // mode is passed for flow/state consistency — Worker ignores it for model selection
    body: JSON.stringify({ prompt, mode, clarification }),
  })

  const json = await res.json() as { success?: boolean; data?: AnalyzeResponse; error?: string }

  if (!res.ok || !json.success) {
    throw new Error(json.error ?? 'Failed to analyze prompt. Please try again.')
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
  const res = await fetch(`${API_BASE}/api/improve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalPrompt, answers, scoreBefore, scoreBreakdown, mode, clarifications }),
  })

  const json = await res.json() as { success?: boolean; data?: ImproveResponse; error?: string }

  if (!res.ok || !json.success) {
    throw new Error(json.error ?? 'Failed to improve prompt. Please try again.')
  }

  return json.data!
}
