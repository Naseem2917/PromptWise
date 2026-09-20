import type { PromptRecord } from './db'

const SESSION_HISTORY_KEY = 'promptwise_session_history'

export interface SessionPromptItem {
  id: string
  userId: string
  originalPrompt: string
  improvedPrompt: string
  scoreBefore: number
  scoreAfter: number
  saved: boolean
  createdAtMillis: number
}

function toPromptRecord(item: SessionPromptItem): PromptRecord {
  return {
    id: item.id,
    userId: item.userId,
    originalPrompt: item.originalPrompt,
    improvedPrompt: item.improvedPrompt,
    scoreBefore: item.scoreBefore,
    scoreAfter: item.scoreAfter,
    saved: item.saved,
    createdAt: item.createdAtMillis
      ? ({ seconds: Math.floor(item.createdAtMillis / 1000) } as unknown as PromptRecord['createdAt'])
      : null,
  }
}

export function setSessionPrompts(records: PromptRecord[]): void {
  if (typeof window === 'undefined') return
  try {
    const items: SessionPromptItem[] = records.map((p) => {
      const seconds = p.createdAt && typeof p.createdAt === 'object' && 'seconds' in p.createdAt
        ? (p.createdAt as { seconds: number }).seconds
        : Math.floor(Date.now() / 1000)
      return {
        id: p.id,
        userId: p.userId,
        originalPrompt: p.originalPrompt,
        improvedPrompt: p.improvedPrompt,
        scoreBefore: p.scoreBefore,
        scoreAfter: p.scoreAfter,
        saved: p.saved,
        createdAtMillis: seconds * 1000,
      }
    })
    sessionStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(items))
  } catch (e) {
    console.error('Failed to set session prompts:', e)
  }
}

export function getSessionPrompts(): PromptRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = sessionStorage.getItem(SESSION_HISTORY_KEY)
    if (!raw) return []
    const parsed: SessionPromptItem[] = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed
        .sort((a, b) => b.createdAtMillis - a.createdAtMillis)
        .map(toPromptRecord)
    }
  } catch (e) {
    console.error('Failed to read session prompt history:', e)
  }
  return []
}

export function saveSessionPrompt(data: {
  userId?: string
  originalPrompt: string
  improvedPrompt: string
  scoreBefore: number
  scoreAfter: number
  saved?: boolean
}): PromptRecord {
  const newItem: SessionPromptItem = {
    id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    userId: data.userId || 'guest',
    originalPrompt: data.originalPrompt,
    improvedPrompt: data.improvedPrompt,
    scoreBefore: data.scoreBefore,
    scoreAfter: data.scoreAfter,
    saved: Boolean(data.saved),
    createdAtMillis: Date.now(),
  }

  if (typeof window !== 'undefined') {
    try {
      const current = getSessionPrompts()
      const updated: SessionPromptItem[] = [
        newItem,
        ...current.filter((p) => p.id !== newItem.id).map((p) => ({
          id: p.id,
          userId: p.userId,
          originalPrompt: p.originalPrompt,
          improvedPrompt: p.improvedPrompt,
          scoreBefore: p.scoreBefore,
          scoreAfter: p.scoreAfter,
          saved: p.saved,
          createdAtMillis: Date.now(),
        })),
      ]
      sessionStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to save to session prompt history:', e)
    }
  }

  return toPromptRecord(newItem)
}

export function toggleSaveSessionPrompt(id: string, saved: boolean): void {
  if (typeof window === 'undefined') return
  try {
    const raw = sessionStorage.getItem(SESSION_HISTORY_KEY)
    if (!raw) return
    const parsed: SessionPromptItem[] = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      const updated = parsed.map((item) => (item.id === id ? { ...item, saved } : item))
      sessionStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(updated))
    }
  } catch (e) {
    console.error('Failed to update session prompt bookmark:', e)
  }
}

export function deleteSessionPrompt(id: string): void {
  if (typeof window === 'undefined') return
  try {
    const raw = sessionStorage.getItem(SESSION_HISTORY_KEY)
    if (!raw) return
    const parsed: SessionPromptItem[] = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      const updated = parsed.filter((item) => item.id !== id)
      sessionStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(updated))
    }
  } catch (e) {
    console.error('Failed to delete session prompt:', e)
  }
}

export function clearSessionPrompts(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_HISTORY_KEY)
  }
}
