/**
 * Lightweight and conservative local garbage detector.
 * 
 * Rules:
 * - Rejects empty/whitespace-only input.
 * - Rejects symbol/punctuation-only input.
 * - Rejects single character repeated 3+ times (e.g. "xxxxx", "aaaa").
 * - Rejects 2-character pattern repeated 3+ times (e.g. "ababab", "asdasd").
 * - Rejects obvious keyboard-row sequential smashes (e.g. "asdfgh", "qwertyuiop", "zxcvbn").
 * 
 * Intentionally does NOT use syllable/word-shape rules so technical acronyms
 * (SQL, HTML, CSS, API, MERN, GPT, AI, IoT) and short words (hi, why, Python, resume)
 * are NEVER blocked and safely reach Gemini.
 */

const KEYBOARD_ROWS = [
  'qwertyuiop',
  'poiuytrewq',
  'asdfghjkl',
  'lkjhgfdsa',
  'zxcvbnm',
  'mnbvcxz',
  '1234567890',
  '0987654321',
]

// Common exact gibberish smashes
const BLATANT_SMASHES = new Set([
  'xxxxx',
  'asdfgh',
  'ahsohf',
  'qwertyuiop',
  'qwert',
  'asdfg',
  'zxcvb',
])

export function isObviousGarbage(text: string): boolean {
  if (!text) return true
  const trimmed = text.trim()
  if (trimmed.length === 0) return true

  // 1. Symbol-only (no letters or numbers across any language script)
  const hasLetterOrNumber = /[\p{L}\p{N}]/u.test(trimmed)
  if (!hasLetterOrNumber) return true

  const lower = trimmed.toLowerCase().replace(/\s+/g, '')

  // 2. Known blatant smashes
  if (BLATANT_SMASHES.has(lower)) return true

  // 3. Single character repeated 3+ times without variety (e.g., "xxxx", "1111", "aaa")
  if (/^(\S)\1{2,}$/u.test(lower)) return true

  // 4. Two-character pattern repeated 3+ times (e.g., "ababab", "asdasd")
  if (/^(\S{2})\1{2,}$/u.test(lower)) return true

  // 5. Exact keyboard-row sequential smashes (length >= 5)
  if (lower.length >= 5) {
    for (const row of KEYBOARD_ROWS) {
      if (row.includes(lower)) return true
    }
  }

  // All other inputs (e.g. "hi", "why", "SQL", "MERN", "Python", "make website") pass through
  return false
}
