import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'

interface PromptInputProps {
  onSubmit: (prompt: string) => void
  isLoading?: boolean
  error?: string | null
  defaultValue?: string
}

export function PromptInput({ onSubmit, isLoading = false, error, defaultValue = '' }: PromptInputProps) {
  const [value, setValue] = useState(defaultValue)

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (trimmed && !isLoading) onSubmit(trimmed)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit()
          }}
          placeholder={'What would you like to ask AI?\n\nExample: "Explain Python" or "Write a presentation on climate change"'}
          rows={6}
          disabled={isLoading}
          className="w-full rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] px-5 py-4 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-base resize-none outline-none transition-all duration-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:focus:bg-white/[0.06] disabled:opacity-50"
          style={{ minHeight: '152px' }}
        />

        {/* Character hint */}
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-slate-500 dark:text-slate-500 text-xs">
            {value.length > 0
              ? `${value.length} character${value.length === 1 ? '' : 's'}`
              : 'Ctrl + Enter to submit'}
          </span>
          {value.length > 0 && (
            <button
              onClick={() => setValue('')}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 text-xs transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          ⚠️ {error}
        </motion.div>
      )}

      <div className="mt-5 flex justify-center">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Analyzing your prompt…
            </>
          ) : (
            '✨ Improve My Prompt'
          )}
        </Button>
      </div>
    </motion.div>
  )
}
