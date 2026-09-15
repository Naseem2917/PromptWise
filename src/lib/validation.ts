/**
 * Smart, conservative local prompt validator.
 * 
 * Rules:
 * 1. Rejects empty, whitespace-only, or symbol-only input.
 * 2. Rejects single-word inputs (e.g. "python", "resume", "marketing") - requires at least 2 words.
 * 3. Rejects total trimmed length < 5 characters (e.g. "a b", "hi ok").
 * 4. Rejects single character repeated 3+ times in any word (e.g. "xxxx", "aaaa", "1111").
 * 5. Rejects 2-character pattern repeated 3+ times (e.g. "ababab", "asdasd").
 * 6. Rejects keyboard-row sequential smashes (e.g. "asdfgh", "qwertyuiop").
 * 7. Rejects repetitive duplicate words (e.g. "test test test", "code code").
 * 8. Rejects single-letter spam (e.g. "a b c d").
 * 
 * All legitimate multi-word prompts (e.g. "write python", "hire a bookkeeper", "explain react", "sql query")
 * safely pass through to Gemini AI.
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

export function isObviousGarbage(text: string): boolean {
  if (!text) return true
  const trimmed = text.trim()
  if (trimmed.length < 5) return true

  // 1. Symbol-only check (must contain letters or numbers across any language script)
  const hasLetterOrNumber = /[\p{L}\p{N}]/u.test(trimmed)
  if (!hasLetterOrNumber) return true

  // 2. Word count check: prompts must have at least 2 words (a single word is a keyword, not an actionable prompt)
  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length < 2) return true

  // 3. Single-letter spam (e.g. "a b c d") where all words are single characters
  if (words.every((w) => w.length === 1)) return true

  // 4. Repeated identical words spam (e.g. "test test", "python python python")
  const lowerWords = words.map((w) => w.toLowerCase())
  const uniqueWords = new Set(lowerWords)
  if (uniqueWords.size === 1) return true

  // 5. Per-word character repetition check (e.g. "xxxx", "11111", "aaaaa")
  for (const word of lowerWords) {
    if (/^(\S)\1{2,}$/u.test(word)) return true
    if (/^(\S{2})\1{2,}$/u.test(word)) return true
  }

  // 6. Keyboard-row sequential smashes
  const fullLower = lowerWords.join('')
  if (fullLower.length >= 5) {
    for (const row of KEYBOARD_ROWS) {
      if (row.includes(fullLower)) return true
    }
  }

  for (const word of lowerWords) {
    if (word.length >= 5) {
      for (const row of KEYBOARD_ROWS) {
        if (row.includes(word)) return true
      }
    }
  }

  // All legitimate multi-word prompts safely pass to Gemini
  return false
}

/**
 * Local validator for follow-up question answers (Stage B).
 * 
 * Rules:
 * - Allows single-word answers (e.g. "TYBSCIT", "Python", "Beginner", "Table", "JSON", "3").
 * - Rejects empty/whitespace or symbol-only answers (e.g. "???", "---").
 * - Rejects obvious smashes (e.g. "asdfgh", "qwertyuiop") or repeated characters (e.g. "xxxx").
 */
export function isObviousGarbageAnswer(text: string): boolean {
  if (!text) return true
  const trimmed = text.trim()
  if (trimmed.length === 0) return true

  // 1. Symbol-only check (must contain at least one letter or number)
  const hasLetterOrNumber = /[\p{L}\p{N}]/u.test(trimmed)
  if (!hasLetterOrNumber) return true

  const lower = trimmed.toLowerCase().replace(/\s+/g, '')

  // 2. Single character repeated 3+ times without variety (e.g. "xxxx", "1111", "aaa")
  if (/^(\S)\1{2,}$/u.test(lower)) return true

  // 3. Two-character pattern repeated 3+ times (e.g. "ababab", "asdasd")
  if (/^(\S{2})\1{2,}$/u.test(lower)) return true

  // 4. Exact keyboard-row sequential smashes (length >= 5)
  if (lower.length >= 5) {
    for (const row of KEYBOARD_ROWS) {
      if (row.includes(lower)) return true
    }
  }

  return false
}
