import { useState } from 'react'
import { motion } from 'framer-motion'
import { saveFeedback } from '../../lib/db'
import { IconCheck, IconCheckCircle, IconX } from '../ui/Icons'

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
        className="text-center py-5 text-slate-500 text-sm flex items-center justify-center gap-2"
      >
        <IconCheckCircle size={16} className="text-sage-600 dark:text-sage-400" />
        <span>Thanks for your feedback! It helps improve PromptWise.</span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="flex flex-col items-center gap-4 py-5"
    >
      <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium">
        Was this improved prompt helpful?
      </p>

      <div className="flex items-center gap-3">
        {(['up', 'down'] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => handleSelectRating(r)}
            className={[
              'px-4 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer min-h-[40px] flex items-center gap-2',
              rating === r
                ? r === 'up'
                  ? 'border-sage-500 bg-sage-500/15 text-sage-700 dark:text-sage-300 font-semibold'
                  : 'border-red-500 bg-red-500/15 text-red-600 dark:text-red-400 font-semibold'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200 shadow-2xs',
            ].join(' ')}
          >
            {r === 'up' ? (
              <>
                <IconCheck size={14} className={rating === 'up' ? 'text-sage-600' : 'text-slate-400'} />
                <span>Helpful</span>
              </>
            ) : (
              <>
                <IconX size={14} className={rating === 'down' ? 'text-red-500' : 'text-slate-400'} />
                <span>Needs Work</span>
              </>
            )}
          </button>
        ))}
      </div>

      {rating && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 w-full max-w-sm mt-1"
        >
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What could we improve? (optional)"
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-xs sm:text-sm outline-none focus:border-cobalt-600 focus:ring-2 focus:ring-cobalt-500/20 shadow-2xs min-h-[40px] transition-all"
          />
          <button
            type="button"
            onClick={handleSubmitComment}
            className="text-xs font-mono font-medium text-cobalt-600 dark:text-cobalt-400 hover:text-cobalt-700 dark:hover:text-cobalt-300 transition-colors cursor-pointer min-h-[36px] flex items-center justify-center"
          >
            Submit feedback →
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

