import { useState } from 'react'
import { motion } from 'framer-motion'
import { saveFeedback } from '../../lib/db'

interface FeedbackWidgetProps {
  promptId?: string
  userId?: string
  originalPrompt?: string
  improvedPrompt?: string
}

export function FeedbackWidget({
  promptId,
  userId,
  originalPrompt,
  improvedPrompt,
}: FeedbackWidgetProps) {
  const [rating, setRating] = useState<'up' | 'down' | null>(null)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSelectRating = (r: 'up' | 'down') => {
    setRating(r)
    saveFeedback({
      userId,
      promptId,
      rating: r,
      category: 'Prompt Quality & AI Results',
      message: r === 'up' ? 'Helpful (👍 Yes)' : 'Not helpful (👎 No)',
      originalPrompt,
      improvedPrompt,
    }).catch(console.error)
  }

  const handleSubmitComment = async () => {
    if (rating) {
      await saveFeedback({
        userId,
        promptId,
        rating,
        category: 'Prompt Quality & AI Results',
        message: comment.trim()
          ? `${rating === 'up' ? '👍 Yes' : '👎 No'}: ${comment.trim()}`
          : (rating === 'up' ? 'Helpful (👍 Yes)' : 'Not helpful (👎 No)'),
        originalPrompt,
        improvedPrompt,
      }).catch(console.error)
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-5 text-slate-500 text-sm"
      >
        ✅ Thanks for your feedback! It helps us improve PromptWise.
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9 }}
      className="flex flex-col items-center gap-4 py-6"
    >
      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Was this improvement helpful?</p>

      <div className="flex items-center gap-3">
        {(['up', 'down'] as const).map((r) => (
          <button
            key={r}
            onClick={() => handleSelectRating(r)}
            className={[
              'px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer min-h-[44px] flex items-center justify-center',
              rating === r
                ? r === 'up'
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'border-red-500 bg-red-500/20 text-red-600 dark:text-red-400 font-semibold'
                : 'border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-slate-300 shadow-xs',
            ].join(' ')}
          >
            {r === 'up' ? '👍 Yes' : '👎 No'}
          </button>
        ))}
      </div>

      {rating && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 w-full max-w-sm"
        >
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What could we improve? (optional)"
            className="w-full bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xs min-h-[44px] transition-all"
          />
          <button
            onClick={handleSubmitComment}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer font-medium min-h-[44px] flex items-center justify-center"
          >
            Submit feedback →
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
