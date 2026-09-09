import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { saveFeedback } from '../lib/db'
import { Spinner } from '../components/ui/Spinner'

const CATEGORIES = [
  'General Feedback',
  'Feature Request',
  'Prompt Quality & AI Results',
  'Bug Report',
  'Design & Usability',
] as const

export function Feedback() {
  const { user } = useAuth()
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [rating, setRating] = useState<number>(5)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState(user?.email ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      setError('Please provide some feedback details before submitting.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await saveFeedback({
        userId: user?.uid,
        email: email || user?.email || undefined,
        category,
        rating,
        message: message.trim(),
      })
      setSubmitted(true)
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
  }

  return (
    <div className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
          💬 We Value Your Ideas
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
          Help Us Build PromptWise
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Share feature ideas, report inaccuracies in AI prompts, or tell us what you love.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card rounded-2xl p-6 sm:p-8 shadow-sm"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-2">
                  Feedback Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer min-h-[36px] ${
                        category === c
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                          : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 shadow-xs'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-2">
                  Overall Experience
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-transform hover:scale-110 cursor-pointer ${
                        star <= rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs text-slate-600 dark:text-slate-400 ml-2 font-medium">
                    {rating === 5 ? 'Loved it!' : rating >= 3 ? 'Good' : 'Needs work'}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-2">
                  Your Thoughts or Suggestions *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What worked well? What felt confusing? What features would make PromptWise indispensable to your daily workflow?"
                  rows={5}
                  required
                  className="w-full rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] p-4 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all shadow-xs"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-500 block mt-1">
                  {message.length} characters
                </span>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-2">
                  Your Email (Optional — if you'd like a response)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs min-h-[44px]"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  ⚠️ {error}
                </div>
              )}

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" />
                      Sending to team…
                    </>
                  ) : (
                    '🚀 Send Feedback'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-8 border border-white/[0.08] text-center"
          >
            <div className="text-5xl mb-4">💌</div>
            <h2 className="text-2xl font-black text-slate-100 mb-2">
              Thank You for Your Feedback!
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-8">
              We review every single piece of feedback to make PromptWise smarter, faster, and more delightful for you.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-semibold border border-white/[0.08] transition-colors cursor-pointer"
              >
                Send Another Note
              </button>
              <Link
                to="/improve"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-indigo-600/20"
              >
                Back to Improve →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
