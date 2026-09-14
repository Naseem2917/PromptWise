import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import chatgptLogo from '../../assets/chatgpt.svg'
import geminiLogo from '../../assets/gemini.svg'
import claudeLogo from '../../assets/claude.svg'

interface BeforeAfterProps {
  originalPrompt: string
  improvedPrompt: string
}

export function BeforeAfter({ originalPrompt, improvedPrompt }: BeforeAfterProps) {
  const [copied, setCopied] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(improvedPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback — silently ignore
    }
  }

  const handleOpenChatbot = async (bot: 'chatgpt' | 'gemini' | 'claude') => {
    // 1. Guaranteed Source of Truth: Copy exact formatted text (newlines, bullets, numbering)
    try {
      await navigator.clipboard.writeText(improvedPrompt)
    } catch (err) {
      console.error('Clipboard write error:', err)
    }

    const botNames = {
      chatgpt: 'ChatGPT',
      gemini: 'Gemini',
      claude: 'Claude',
    }

    setToastMsg(`📋 Copied exact prompt! Opening ${botNames[bot]} (paste with Ctrl+V).`)
    setTimeout(() => setToastMsg(null), 4500)

    // 2. Open chatbot in new tab
    if (bot === 'chatgpt') {
      window.open(
        `https://chatgpt.com/?q=${encodeURIComponent(improvedPrompt)}`,
        '_blank',
        'noopener,noreferrer',
      )
    } else if (bot === 'claude') {
      // Opening https://claude.ai/new without ?q= avoids Anthropic's untrusted URL warning banner.
      // User has the exact formatted prompt in their clipboard ready for instant Ctrl+V.
      window.open('https://claude.ai/new', '_blank', 'noopener,noreferrer')
    } else if (bot === 'gemini') {
      window.open('https://gemini.google.com/app', '_blank', 'noopener,noreferrer')
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
          <div className="pt-4 border-t border-indigo-200/50 dark:border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Direct Launch in Chatbot
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                Copies exact formatting & opens
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleOpenChatbot('chatgpt')}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-white/[0.04] border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all shadow-2xs cursor-pointer min-h-[36px]"
                title="Copy & Open in ChatGPT"
              >
                <img src={chatgptLogo} alt="ChatGPT" className="w-4 h-4 object-contain shrink-0" />
                <span>ChatGPT</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenChatbot('gemini')}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-white/[0.04] border border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all shadow-2xs cursor-pointer min-h-[36px]"
                title="Copy & Open in Gemini"
              >
                <img src={geminiLogo} alt="Gemini" className="w-4 h-4 object-contain shrink-0" />
                <span>Gemini</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenChatbot('claude')}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-white/[0.04] border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all shadow-2xs cursor-pointer min-h-[36px]"
                title="Copy & Open in Claude"
              >
                <img src={claudeLogo} alt="Claude" className="w-4 h-4 object-contain shrink-0" />
                <span>Claude</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-medium shadow-lg shadow-indigo-600/20"
          >
            <div className="flex items-center gap-2">
              <span>🚀</span>
              <span>{toastMsg}</span>
            </div>
            <button
              onClick={() => setToastMsg(null)}
              className="opacity-70 hover:opacity-100 text-white text-sm cursor-pointer ml-2"
              aria-label="Dismiss toast"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
