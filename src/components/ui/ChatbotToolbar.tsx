import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import chatgptLogo from '../../assets/chatgpt.svg'
import geminiLogo from '../../assets/gemini.svg'
import claudeLogo from '../../assets/claude.svg'

interface ChatbotToolbarProps {
  prompt: string
  className?: string
  showLabel?: boolean
  compact?: boolean
}

export function ChatbotToolbar({
  prompt,
  className = '',
  showLabel = true,
  compact = false,
}: ChatbotToolbarProps) {
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const handleOpenChatbot = async (bot: 'chatgpt' | 'gemini' | 'claude') => {
    // Guaranteed clipboard copy as backup
    try {
      await navigator.clipboard.writeText(prompt)
    } catch (err) {
      console.error('Clipboard copy error:', err)
    }

    const botNames = {
      chatgpt: 'ChatGPT',
      gemini: 'Gemini',
      claude: 'Claude',
    }

    if (bot === 'gemini') {
      setToastMsg(`📋 Copied exact prompt! Opening Gemini (paste with Ctrl+V).`)
    } else {
      setToastMsg(`📋 Copied exact prompt! Opening ${botNames[bot]}.`)
    }
    setTimeout(() => setToastMsg(null), 4000)

    if (bot === 'chatgpt') {
      window.open(
        `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
        '_blank',
        'noopener,noreferrer',
      )
    } else if (bot === 'claude') {
      // Direct auto pre-fill with ?q= as requested; prompt is also in clipboard as fallback
      window.open(
        `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
        '_blank',
        'noopener,noreferrer',
      )
    } else if (bot === 'gemini') {
      window.open('https://gemini.google.com/app', '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Direct Launch in Chatbot
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            Pre-fills & copies formatting
          </span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleOpenChatbot('chatgpt')
          }}
          className={`flex items-center justify-center gap-1.5 rounded-xl font-semibold bg-white dark:bg-white/[0.04] border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all shadow-2xs cursor-pointer ${
            compact ? 'px-2 py-1.5 text-[11px] min-h-[30px]' : 'px-3 py-2 text-xs min-h-[36px]'
          }`}
          title="Open & Pre-fill in ChatGPT"
        >
          <img src={chatgptLogo} alt="ChatGPT" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain shrink-0" />
          <span>ChatGPT</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleOpenChatbot('gemini')
          }}
          className={`flex items-center justify-center gap-1.5 rounded-xl font-semibold bg-white dark:bg-white/[0.04] border border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all shadow-2xs cursor-pointer ${
            compact ? 'px-2 py-1.5 text-[11px] min-h-[30px]' : 'px-3 py-2 text-xs min-h-[36px]'
          }`}
          title="Copy & Open in Gemini"
        >
          <img src={geminiLogo} alt="Gemini" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain shrink-0" />
          <span>Gemini</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleOpenChatbot('claude')
          }}
          className={`flex items-center justify-center gap-1.5 rounded-xl font-semibold bg-white dark:bg-white/[0.04] border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all shadow-2xs cursor-pointer ${
            compact ? 'px-2 py-1.5 text-[11px] min-h-[30px]' : 'px-3 py-2 text-xs min-h-[36px]'
          }`}
          title="Open & Pre-fill in Claude"
        >
          <img src={claudeLogo} alt="Claude" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain shrink-0" />
          <span>Claude</span>
        </button>
      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium shadow-lg shadow-indigo-600/20"
          >
            <div className="flex items-center gap-1.5 truncate">
              <span>🚀</span>
              <span className="truncate">{toastMsg}</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setToastMsg(null)
              }}
              className="opacity-70 hover:opacity-100 text-white text-sm cursor-pointer ml-1 shrink-0"
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
