import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/Button'
import { IconZap, IconScale, IconSparkles } from '../ui/Icons'
import type { ResponseMode } from '../../lib/api'

// ── Mode config ────────────────────────────────────────────────────────────────

const MODES: { value: ResponseMode; icon: typeof IconZap; label: string; desc: string }[] = [
  { value: 'low', icon: IconZap, label: 'Quick', desc: 'Faster response' },
  { value: 'medium', icon: IconScale, label: 'Balanced', desc: 'Good balance of speed and detail' },
  { value: 'high', icon: IconSparkles, label: 'Detailed', desc: 'More detailed suggestions' },
]

interface PromptInputProps {
  onSubmit: (prompt: string, mode: ResponseMode) => void
  isLoading?: boolean
  error?: string | null
  defaultValue?: string
  defaultMode?: ResponseMode
  onClearError?: () => void
}

export function PromptInput({
  onSubmit,
  isLoading = false,
  error,
  defaultValue = '',
  defaultMode = 'medium',
  onClearError,
}: PromptInputProps) {
  const [value, setValue] = useState(defaultValue)
  const [mode, setMode] = useState<ResponseMode>(defaultMode)
  const [localError, setLocalError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const activeError = localError || error || null

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  useEffect(() => {
    setMode(defaultMode)
  }, [defaultMode])

  // Auto-dismiss after 5s or when user clicks outside / presses Escape
  useEffect(() => {
    if (!activeError) return

    const timer = setTimeout(() => {
      setLocalError(null)
      onClearError?.()
    }, 5000)

    const handleClickOutside = (event: MouseEvent) => {
      if (canvasRef.current && !canvasRef.current.contains(event.target as Node)) {
        setLocalError(null)
        onClearError?.()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLocalError(null)
        onClearError?.()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeError, onClearError])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed) {
      setLocalError('Please enter your prompt before continuing.')
      textareaRef.current?.focus()
      return
    }
    if (!isLoading) {
      setLocalError(null)
      onClearError?.()
      onSubmit(trimmed, mode)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-3xl mx-auto"
    >
      {/* Workbench Drafting Canvas Container */}
      <div ref={canvasRef} className="relative">
        <div
          className={`workbench-card overflow-hidden shadow-sm transition-all duration-150 ${
            activeError
              ? 'border-amber-500/80 dark:border-amber-500/70 ring-2 ring-amber-500/20'
              : ''
          }`}
        >
          {/* Canvas Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ochre-500" />
              <span className="font-mono font-medium tracking-wider uppercase text-[11px]">
                YOUR PROMPT
              </span>
            </div>
            <div className="flex items-center gap-3">
              {value.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setValue('')
                    setLocalError(null)
                    onClearError?.()
                  }}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer text-xs"
                >
                  Clear
                </button>
              )}
              <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                {value.length} char{value.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="p-4 sm:p-5">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                if (activeError) {
                  setLocalError(null)
                  onClearError?.()
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit()
              }}
              placeholder={'What would you like to ask AI?\n\nExample: "Explain Python for high school students" or "Write a research outline on renewable energy"'}
              rows={6}
              disabled={isLoading}
              className="w-full bg-transparent font-mono-code text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 resize-none outline-none leading-relaxed disabled:opacity-50"
              style={{ minHeight: '160px' }}
            />
          </div>

          {/* Canvas Footer bar */}
          <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
            <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300">Ctrl + Enter</kbd> to check your prompt</span>
            <span className="sm:hidden font-mono text-[11px]">Your prompt</span>
          </div>
        </div>

        {/* Anchored Floating Validation Tooltip (HTML5 Validation Style) */}
        <AnimatePresence>
          {activeError && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute left-3 sm:left-6 top-[calc(100%+6px)] z-30 max-w-sm sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/90 rounded-xl px-3.5 py-2.5 shadow-xl flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-100"
            >
              {/* Arrow indicator pointing up at the drafting canvas */}
              <div className="absolute -top-1.5 left-5 w-3 h-3 bg-white dark:bg-slate-900 border-t border-l border-slate-200/90 dark:border-slate-700/90 rotate-45 transform" />

              {/* Alert Icon Badge */}
              <div className="relative z-10 w-4 h-4 rounded bg-amber-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 shadow-xs">
                !
              </div>

              {/* Error Message Text */}
              <span className="relative z-10 font-sans leading-snug">
                {activeError}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Response Mode Selector ─────────────────────────────────────────── */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            HOW MUCH HELP DO YOU WANT?
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {MODES.map((m) => {
            const isSelected = mode === m.value
            const Icon = m.icon
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                disabled={isLoading}
                className={[
                  'flex flex-col items-center justify-center text-center p-3 rounded-xl border transition-all duration-150 cursor-pointer min-h-[64px] select-none',
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-xs font-semibold'
                    : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200',
                ].join(' ')}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={15} className={isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} />
                  <span className="text-xs sm:text-sm font-semibold">{m.label}</span>
                </div>
                <span className={[
                  'text-[10px] sm:text-[11px] font-normal leading-none',
                  isSelected ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-slate-400 dark:text-slate-500',
                ].join(' ')}>
                  {m.desc}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex justify-center">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full sm:w-auto px-8"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Checking your prompt…</span>
            </>
          ) : (
            <>
              <IconSparkles size={16} />
              <span>Improve Prompt</span>
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}

