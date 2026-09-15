import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChatbotToolbar } from '../ui/ChatbotToolbar'

interface BeforeAfterProps {
  originalPrompt: string
  improvedPrompt: string
}

export function BeforeAfter({ originalPrompt, improvedPrompt }: BeforeAfterProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(improvedPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback — silently ignore
    }
  }

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Before */}
        <div className="rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50/60 dark:bg-red-500/[0.04] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 shrink-0" />
              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">
                Original Prompt
              </span>
            </div>
            <p className="text-slate-800 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {originalPrompt}
            </p>
          </div>
        </div>

        {/* After */}
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/60 dark:bg-indigo-500/[0.05] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" />
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  Improved Prompt
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 bg-white/80 dark:bg-white/[0.08] hover:bg-indigo-50 dark:hover:bg-white/[0.12] border border-indigo-200 dark:border-white/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer min-h-[36px] flex items-center gap-1 shadow-xs"
                aria-label="Copy improved prompt"
              >
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            <p className="text-slate-900 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-line font-medium">
              {improvedPrompt}
            </p>
          </div>

          {/* Quick Chatbot Launch Toolbar */}
          <ChatbotToolbar
            prompt={improvedPrompt}
            className="pt-4 border-t border-indigo-200/50 dark:border-white/[0.06]"
          />
        </div>
      </motion.div>
    </div>
  )
}
