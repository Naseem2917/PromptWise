import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { saveFeedback } from '../lib/db'
import { Spinner } from '../components/ui/Spinner'
import {
  IconStar,
  IconSend,
  IconCheckCircle,
  IconAlertCircle,
  IconArrowRight,
  IconRotateCcw,
} from '../components/ui/Icons'

const CATEGORIES = [
  'General Feedback',
  'Feature Request',
  'Prompt Quality & AI Results',
  'Bug Report',
  'Design & Usability',
] as const

const FEEDBACK_DRAFT_KEY = 'promptwise_feedback_draft'

interface FeedbackDraft {
  category: string
  rating: number
  message: string
  email: string
}

export function Feedback() {
  const { user } = useAuth()
  const [category, setCategory] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem(FEEDBACK_DRAFT_KEY)
        if (raw) {
          const draft: FeedbackDraft = JSON.parse(raw)
          if (draft.category && CATEGORIES.includes(draft.category as (typeof CATEGORIES)[number])) {
            return draft.category
          }
        }
      } catch {
        // ignore
      }
    }
    return CATEGORIES[0]
  })

  const [rating, setRating] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem(FEEDBACK_DRAFT_KEY)
        if (raw) {
          const draft: FeedbackDraft = JSON.parse(raw)
          if (typeof draft.rating === 'number' && draft.rating >= 1 && draft.rating <= 5) {
            return draft.rating
          }
        }
      } catch {
        // ignore
      }
    }
    return 5
  })

  const [message, setMessage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem(FEEDBACK_DRAFT_KEY)
        if (raw) {
          const draft: FeedbackDraft = JSON.parse(raw)
          if (typeof draft.message === 'string') {
            return draft.message
          }
        }
      } catch {
        // ignore
      }
    }
    return ''
  })

  const [email, setEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem(FEEDBACK_DRAFT_KEY)
        if (raw) {
          const draft: FeedbackDraft = JSON.parse(raw)
          if (typeof draft.email === 'string') {
            return draft.email
          }
        }
      } catch {
        // ignore
      }
    }
    return user?.email ?? ''
  })

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const emailContainerRef = useRef<HTMLDivElement>(null)

  // Save draft to session memory as user types
  useEffect(() => {
    if (submitted) return
    try {
      const draft: FeedbackDraft = { category, rating, message, email }
      sessionStorage.setItem(FEEDBACK_DRAFT_KEY, JSON.stringify(draft))
    } catch {
      // ignore
    }
  }, [category, rating, message, email, submitted])

  // Auto-dismiss after 5s or when user clicks outside / presses Escape
  useEffect(() => {
    if (!emailError) return

    const timer = setTimeout(() => {
      setEmailError(null)
    }, 5000)

    const handleClickOutside = (event: MouseEvent) => {
      if (emailContainerRef.current && !emailContainerRef.current.contains(event.target as Node)) {
        setEmailError(null)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setEmailError(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [emailError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError(null)
    setError(null)

    if (!message.trim()) {
      setError('Please provide feedback details before submitting.')
      return
    }

    const trimmedEmail = email.trim()
    if (trimmedEmail) {
      if (!trimmedEmail.includes('@')) {
        setEmailError(`Please include an '@' in the email address. '${trimmedEmail}' is missing an '@'.`)
        emailInputRef.current?.focus()
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(trimmedEmail)) {
        setEmailError('Please enter a valid email address (e.g. name@example.com).')
        emailInputRef.current?.focus()
        return
      }
    }

    setSubmitting(true)

    try {
      await saveFeedback({
        userId: user?.uid,
        email: trimmedEmail || user?.email || undefined,
        category,
        rating,
        message: message.trim(),
      })
      setSubmitted(true)
      try {
        sessionStorage.removeItem(FEEDBACK_DRAFT_KEY)
      } catch {
        // ignore
      }
    } catch (err: unknown) {
      console.error(err)
      setError((err as Error).message ?? 'Failed to submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setMessage('')
    setRating(5)
    setCategory(CATEGORIES[0])
    setSubmitted(false)
    setError(null)
    setEmailError(null)
    try {
      sessionStorage.removeItem(FEEDBACK_DRAFT_KEY)
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-center mb-8 sm:mb-10"
      >
        <span className="inline-block font-mono text-xs font-semibold uppercase tracking-wider text-cobalt-600 dark:text-cobalt-400 mb-2">
          Feedback &amp; Suggestions
        </span>
        <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2.5">
          Share Your Experience
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
          Help us improve PromptWise, suggest new features, or share how it helped your learning.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="workbench-card p-6 sm:p-8 shadow-2xs"
          >
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Category */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2.5">
                  Feedback Topic
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => {
                    const isSelected = category === c
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer min-h-[34px] ${
                          isSelected
                            ? 'bg-blue-600 dark:bg-blue-600 text-white font-semibold shadow-xs border border-blue-700 dark:border-blue-500 ring-2 ring-blue-500/25'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white shadow-2xs'
                        }`}
                      >
                        {c}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Overall Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 text-ochre-500 hover:scale-110 transition-transform cursor-pointer"
                      aria-label={`Rate ${star} out of 5 stars`}
                    >
                      <IconStar
                        size={22}
                        fill={star <= rating ? 'currentColor' : 'none'}
                        className={star <= rating ? 'text-ochre-500' : 'text-slate-300 dark:text-slate-700'}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400 ml-2 font-medium">
                    {rating === 5
                      ? '5/5 — Highly Effective'
                      : rating === 4
                        ? '4/5 — Very Useful'
                        : rating === 3
                          ? '3/5 — Adequate'
                          : rating === 2
                            ? '2/5 — Needs Polish'
                            : '1/5 — Needs Rework'}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Your Feedback *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you think: What worked well? How can we make PromptWise easier or more useful for you?"
                  rows={5}
                  required
                  className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-cobalt-600 focus:ring-2 focus:ring-cobalt-500/20 resize-none transition-all shadow-2xs font-sans leading-relaxed"
                />
                <div className="flex justify-end mt-1">
                  <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                    {message.length} characters
                  </span>
                </div>
              </div>

              {/* Email with Floating Validation Tooltip */}
              <div ref={emailContainerRef} className="relative">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Contact Email (Optional)
                </label>
                <input
                  ref={emailInputRef}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (emailError) setEmailError(null)
                  }}
                  placeholder="student@institution.edu"
                  className={`w-full rounded-xl bg-white dark:bg-slate-900 border px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all shadow-2xs min-h-[42px] ${
                    emailError
                      ? 'border-amber-500 dark:border-amber-500 focus:border-amber-500 ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-800 focus:border-cobalt-600 focus:ring-2 focus:ring-cobalt-500/20'
                  }`}
                />

                {/* Custom Floating Validation Tooltip */}
                <AnimatePresence>
                  {emailError && (
                    <motion.div
                      role="alert"
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute left-2 sm:left-4 top-[calc(100%+6px)] z-30 max-w-sm sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/90 rounded-xl px-3.5 py-2.5 shadow-xl flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-100"
                    >
                      {/* Arrow indicator pointing up at the input */}
                      <div className="absolute -top-1.5 left-5 w-3 h-3 bg-white dark:bg-slate-900 border-t border-l border-slate-200/90 dark:border-slate-700/90 rotate-45 transform" />

                      {/* Alert Icon Badge */}
                      <div className="relative z-10 w-4 h-4 rounded bg-amber-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 shadow-xs">
                        !
                      </div>

                      {/* Error Message Text */}
                      <span className="relative z-10 font-sans leading-snug">
                        {emailError}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3.5 rounded-xl bg-ochre-500/[0.08] border border-ochre-500/30 text-ochre-900 dark:text-ochre-200 text-xs flex items-center gap-2">
                  <IconAlertCircle size={15} className="text-ochre-600 dark:text-ochre-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-mono text-xs sm:text-sm font-semibold transition-colors cursor-pointer inline-flex items-center gap-2 shadow-xs min-h-[42px]"
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" />
                      <span>Sending…</span>
                    </>
                  ) : (
                    <>
                      <IconSend size={14} />
                      <span>Send Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          /* Success Screen */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="workbench-card p-8 sm:p-10 text-center shadow-2xs space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-sage-500/10 border border-sage-500/25 text-sage-600 dark:text-sage-400 flex items-center justify-center mx-auto">
              <IconCheckCircle size={24} />
            </div>
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-sage-700 dark:text-sage-400 block mb-1">
                Feedback Received
              </span>
              <h2 className="font-serif-title text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Thank You for Your Feedback
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                Your feedback helps us make PromptWise clearer and more helpful for all students.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer min-h-[38px] inline-flex items-center gap-1.5 shadow-2xs"
              >
                <IconRotateCcw size={13} />
                <span>Send Another Note</span>
              </button>
              <Link
                to="/improve"
                className="group/btn px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold transition-colors shadow-xs min-h-[38px] inline-flex items-center gap-1.5"
              >
                <span>Back to Improve</span>
                <IconArrowRight size={13} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
