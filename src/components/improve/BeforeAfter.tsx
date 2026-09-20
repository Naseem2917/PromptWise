import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChatbotToolbar } from '../ui/ChatbotToolbar'
import { IconCopy, IconCheck } from '../ui/Icons'

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
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Left: Initial Draft (Ochre Semantic Palette) */}
        <div className="rounded-xl border border-ochre-500/30 bg-ochre-500/[0.04] dark:bg-ochre-500/[0.06] overflow-hidden flex flex-col justify-between shadow-2xs">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-ochre-500/20 bg-ochre-500/[0.06] dark:bg-ochre-500/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-ochre-500 shrink-0" />
                <span className="font-mono text-xs font-semibold text-ochre-700 dark:text-ochre-400 uppercase tracking-wider">
                  YOUR ORIGINAL PROMPT
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ochre-500/15 text-ochre-700 dark:text-ochre-300 font-medium">
                Not Yet Checked
              </span>
            </div>

            {/* Prompt Content */}
            <div className="p-4 sm:p-5">
              <p className="font-mono-code text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-ochre-500/20">
                {originalPrompt}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Refined Specification (Sage Semantic Palette) */}
        <div className="rounded-xl border border-sage-500/35 bg-sage-500/[0.04] dark:bg-sage-500/[0.06] overflow-hidden flex flex-col justify-between shadow-2xs">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-sage-500/20 bg-sage-500/[0.06] dark:bg-sage-500/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sage-500 shrink-0" />
                <span className="font-mono text-xs font-semibold text-sage-700 dark:text-sage-400 uppercase tracking-wider">
                  IMPROVED PROMPT
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-mono font-medium text-sage-700 dark:text-sage-300 bg-white/90 dark:bg-slate-900/90 hover:bg-sage-50 dark:hover:bg-sage-950/40 border border-sage-500/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer min-h-[32px] flex items-center gap-1.5 shadow-2xs"
                aria-label="Copy improved prompt"
              >
                {copied ? (
                  <>
                    <IconCheck size={13} className="text-sage-600 dark:text-sage-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <IconCopy size={13} />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>

            {/* Prompt Content */}
            <div className="p-4 sm:p-5">
              <p className="font-mono-code text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap selection:bg-sage-500/20">
                {improvedPrompt}
              </p>
            </div>
          </div>

          {/* Quick Chatbot Launch Toolbar */}
          <div className="p-4 border-t border-sage-500/20 bg-sage-500/[0.02]">
            <ChatbotToolbar
              prompt={improvedPrompt}
              compact
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

