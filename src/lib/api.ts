import type { AnalyzeResponse, ImproveResponse, QuestionAnswers, ScoreBreakdown } from '../types'

// Same origin — Vite dev server proxies /api/* to the Worker locally;
// in production the Cloudflare Worker serves both static assets and the API.
const API_BASE = ''

export async function analyzePrompt(prompt: string): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
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
): Promise<ImproveResponse> {
  const res = await fetch(`${API_BASE}/api/improve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalPrompt, answers, scoreBefore, scoreBreakdown }),
  })

  const json = await res.json() as { success?: boolean; data?: ImproveResponse; error?: string }

  if (!res.ok || !json.success) {
    throw new Error(json.error ?? 'Failed to improve prompt. Please try again.')
  }

  return json.data!
}
