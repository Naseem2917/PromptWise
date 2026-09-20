import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Question } from '../../types'
import { Button } from '../ui/Button'
import { IconArrowLeft, IconArrowRight, IconSparkles, IconEdit, IconCheck } from '../ui/Icons'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  onAnswer: (id: string, answer: string | string[]) => void
  onBack?: () => void
  hideSkip?: boolean
  submitButtonText?: string
  initialValue?: string
  existingAnswer?: string | string[]
  error?: string | null
  onClearError?: () => void
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onBack,
  hideSkip = false,
  submitButtonText,
  initialValue,
  existingAnswer,
  error,
  onClearError,
}: QuestionCardProps) {
  const [singleSelected, setSingleSelected] = useState<string>('')
  const [multiSelected, setMultiSelected] = useState<string[]>([])
  const [textValue, setTextValue] = useState(initialValue ?? '')
  const [otherText, setOtherText] = useState('')
  const [toggled, setToggled] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Auto-dismiss after 5s or when user clicks outside / presses Escape
  useEffect(() => {
    if (!error) return

    const timer = setTimeout(() => {
      onClearError?.()
    }, 5000)

    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClearError?.()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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
  }, [error, onClearError])

  // Restore existing answer when navigating back/forth between questions
  useEffect(() => {
    if (existingAnswer !== undefined && existingAnswer !== '') {
      if (question.type === 'text') {
        setTextValue(typeof existingAnswer === 'string' ? existingAnswer : existingAnswer.join(' '))
      } else if (question.type === 'toggle') {
        setToggled(existingAnswer === 'Yes')
      } else if (question.type === 'single_choice' && typeof existingAnswer === 'string') {
        if (question.options?.includes(existingAnswer)) {
          setSingleSelected(existingAnswer)
          setOtherText('')
        } else {
          setSingleSelected('__other__')
          setOtherText(existingAnswer)
        }
      } else if (question.type === 'multi_choice') {
        const arr = Array.isArray(existingAnswer) ? existingAnswer : [existingAnswer]
        const standardOptions = arr.filter((opt) => question.options?.includes(opt))
        const customOther = arr.find((opt) => !question.options?.includes(opt))
        if (customOther) {
          setMultiSelected([...standardOptions, '__other__'])
          setOtherText(customOther)
        } else {
          setMultiSelected(standardOptions)
          setOtherText('')
        }
      }
    } else {
      setSingleSelected('')
      setMultiSelected([])
      setTextValue(initialValue ?? '')
      setOtherText('')
      setToggled(false)
    }
  }, [question.id, existingAnswer, question.type, initialValue])

  // Auto-select text only on initial question open / cycle start
  useEffect(() => {
    if (question.type === 'text') {
      if (initialValue !== undefined && existingAnswer === undefined) {
        setTextValue(initialValue)
      }
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.select()
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [question.id, initialValue, question.type, existingAnswer])

  const isLast = questionNumber === totalQuestions

  // Case-insensitive check to avoid duplicate "Other" if AI already generated it
  const hasAiOther = Boolean(
    question.options?.some((opt) => opt.trim().toLowerCase() === 'other'),
  )

  const isOtherSingle = singleSelected === '__other__'
  const isOtherMulti = multiSelected.includes('__other__')

  const canProceed =
    question.type === 'text'
      ? textValue.trim().length > 0
      : question.type === 'toggle'
        ? true
        : question.type === 'multi_choice'
          ? isOtherMulti
            ? otherText.trim().length > 0
            : multiSelected.length > 0
          : isOtherSingle
            ? otherText.trim().length > 0
            : singleSelected.length > 0

  const handleSubmit = () => {
    if (question.type === 'text') {
      onAnswer(question.id, textValue.trim())
    } else if (question.type === 'toggle') {
      onAnswer(question.id, toggled ? 'Yes' : 'No')
    } else if (question.type === 'multi_choice') {
      const selectedWithoutOtherMarker = multiSelected.filter((opt) => opt !== '__other__')
      if (isOtherMulti && otherText.trim()) {
        selectedWithoutOtherMarker.push(otherText.trim())
      }
      onAnswer(question.id, selectedWithoutOtherMarker)
    } else {
      if (isOtherSingle) {
        onAnswer(question.id, otherText.trim())
      } else {
        onAnswer(question.id, singleSelected)
      }
    }
  }

  const toggleMulti = (option: string) => {
    setMultiSelected((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
    )
  }

  const optionBase =
    'text-left w-full px-4 py-3.5 rounded-xl border transition-all duration-150 cursor-pointer min-h-[48px] flex items-center justify-between text-sm'
  const optionIdle =
    'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-800 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 shadow-xs'
  const optionActive =
    'border-cobalt-600 bg-cobalt-500/10 dark:bg-cobalt-500/15 text-cobalt-700 dark:text-cobalt-300 ring-1 ring-cobalt-500/30 font-medium shadow-xs'

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={cardRef}
        key={question.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-2xl mx-auto workbench-card p-6 sm:p-7 shadow-sm"
      >
        {/* Header Metadata */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <span className="font-mono text-xs font-semibold text-cobalt-600 dark:text-cobalt-400 uppercase tracking-wider">
            Question {questionNumber} of {totalQuestions}
          </span>
          {(question.type === 'single_choice' || question.type === 'options') && (
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
              Choose one
            </span>
          )}
          {question.type === 'multi_choice' && (
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
              Choose multiple
            </span>
          )}
        </div>

        {/* Question Title */}
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 leading-snug">
          {question.question}
        </h3>

        {/* ── Single Choice / Options ──────────────────────────────────── */}
        {(question.type === 'single_choice' || question.type === 'options') && (
          <div className="grid gap-2.5">
            {question.options?.map((opt) => {
              const isSel = singleSelected === opt
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSingleSelected(opt)}
                  className={[optionBase, isSel ? optionActive : optionIdle].join(' ')}
                >
                  <span className="leading-relaxed">{opt}</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-3 transition-colors ${
                    isSel ? 'border-cobalt-600 bg-cobalt-600' : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {isSel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              )
            })}

            {/* Custom "Other" option if not already provided by AI */}
            {!hasAiOther && (
              <div className="space-y-2 mt-1">
                <button
                  type="button"
                  onClick={() => setSingleSelected('__other__')}
                  className={[
                    optionBase,
                    isOtherSingle ? optionActive : optionIdle,
                  ].join(' ')}
                >
                  <span className="flex items-center gap-2">
                    <IconEdit size={15} className="text-slate-400" />
                    <span>Other custom requirement…</span>
                  </span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-3 transition-colors ${
                    isOtherSingle ? 'border-cobalt-600 bg-cobalt-600' : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {isOtherSingle && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>

                {isOtherSingle && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-1"
                  >
                    <input
                      type="text"
                      value={otherText}
                      onChange={(e) => setOtherText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && canProceed && handleSubmit()}
                      placeholder="Specify your exact requirement…"
                      autoFocus
                      className="w-full bg-white dark:bg-slate-900 border border-cobalt-500/50 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none ring-2 ring-cobalt-500/20 text-sm"
                    />
                  </motion.div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Multi Choice ────────────────────────────────────────────── */}
        {question.type === 'multi_choice' && (
          <div className="grid gap-2.5">
            {question.options?.map((opt) => {
              const sel = multiSelected.includes(opt)
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleMulti(opt)}
                  className={[
                    optionBase,
                    sel ? optionActive : optionIdle,
                  ].join(' ')}
                >
                  <span className="leading-relaxed">{opt}</span>
                  <div
                    className={[
                      'w-4 h-4 rounded border flex items-center justify-center shrink-0 ml-3 transition-colors',
                      sel ? 'border-cobalt-600 bg-cobalt-600 text-white' : 'border-slate-300 dark:border-slate-600',
                    ].join(' ')}
                  >
                    {sel && <IconCheck size={12} className="stroke-[2.5]" />}
                  </div>
                </button>
              )
            })}

            {/* Custom "Other" checkbox if not already provided by AI */}
            {!hasAiOther && (
              <div className="space-y-2 mt-1">
                <button
                  type="button"
                  onClick={() => toggleMulti('__other__')}
                  className={[
                    optionBase,
                    isOtherMulti ? optionActive : optionIdle,
                  ].join(' ')}
                >
                  <span className="flex items-center gap-2">
                    <IconEdit size={15} className="text-slate-400" />
                    <span>Other custom option…</span>
                  </span>
                  <div
                    className={[
                      'w-4 h-4 rounded border flex items-center justify-center shrink-0 ml-3 transition-colors',
                      isOtherMulti ? 'border-cobalt-600 bg-cobalt-600 text-white' : 'border-slate-300 dark:border-slate-600',
                    ].join(' ')}
                  >
                    {isOtherMulti && <IconCheck size={12} className="stroke-[2.5]" />}
                  </div>
                </button>

                {isOtherMulti && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-1"
                  >
                    <input
                      type="text"
                      value={otherText}
                      onChange={(e) => setOtherText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && canProceed && handleSubmit()}
                      placeholder="Specify your custom answer…"
                      autoFocus
                      className="w-full bg-white dark:bg-slate-900 border border-cobalt-500/50 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none ring-2 ring-cobalt-500/20 text-sm"
                    />
                  </motion.div>
                )}
              </div>
            )}

            {multiSelected.length > 0 && (
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">{multiSelected.length} choice{multiSelected.length > 1 ? 's' : ''} selected</p>
            )}
          </div>
        )}

        {/* Options Error Tooltip (for single/multi choice or toggle) */}
        {question.type !== 'text' && (
          <AnimatePresence>
            {error && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="mt-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/90 rounded-xl px-3.5 py-2.5 shadow-md flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-100"
              >
                <div className="w-4 h-4 rounded bg-amber-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 shadow-xs">
                  !
                </div>
                <span className="font-sans leading-snug">
                  {error}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ── Text ────────────────────────────────────────────────────── */}
        {question.type === 'text' && (
          <div className="space-y-2">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={textValue}
                onChange={(e) => {
                  setTextValue(e.target.value)
                  if (error) onClearError?.()
                }}
                onKeyDown={(e) => e.key === 'Enter' && canProceed && handleSubmit()}
                placeholder="Type your response…"
                autoFocus
                className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all duration-150 min-h-[48px] text-sm ${
                  error
                    ? 'border-amber-500 dark:border-amber-500 focus:border-amber-500 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 focus:border-cobalt-600 focus:ring-2 focus:ring-cobalt-500/20'
                }`}
              />

              {/* Anchored Floating Tooltip directly under the text box */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute left-2 sm:left-4 top-[calc(100%+6px)] z-30 max-w-sm sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/90 rounded-xl px-3.5 py-2.5 shadow-xl flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-100"
                  >
                    {/* Arrow indicator pointing up at the text input */}
                    <div className="absolute -top-1.5 left-5 w-3 h-3 bg-white dark:bg-slate-900 border-t border-l border-slate-200/90 dark:border-slate-700/90 rotate-45 transform" />

                    {/* Alert Icon Badge */}
                    <div className="relative z-10 w-4 h-4 rounded bg-amber-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 shadow-xs">
                      !
                    </div>

                    {/* Error Message Text */}
                    <span className="relative z-10 font-sans leading-snug">
                      {error}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500">Press Enter to continue</p>
          </div>
        )}

        {/* ── Toggle ──────────────────────────────────────────────────── */}
        {question.type === 'toggle' && (
          <div className="py-2">
            <button
              type="button"
              onClick={() => setToggled(!toggled)}
              className="flex items-center gap-4 cursor-pointer min-h-[48px] select-none"
              aria-pressed={toggled}
            >
              <div
                className={[
                  'relative w-13 h-7 rounded-full transition-colors duration-200',
                  toggled ? 'bg-cobalt-600' : 'bg-slate-300 dark:bg-slate-700',
                ].join(' ')}
              >
                <motion.div
                  className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-xs"
                  animate={{ x: toggled ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              </div>
              <span className="text-slate-800 dark:text-slate-200 font-medium text-sm">
                {toggled ? 'Yes — Include in prompt' : 'No — Leave out'}
              </span>
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 mt-8 pt-5 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {onBack && (
              <Button
                variant="secondary"
                onClick={onBack}
                className="group/btn inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              >
                <IconArrowLeft size={14} className="transition-transform duration-200 group-hover/btn:-translate-x-1" />
                <span>Back</span>
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!canProceed}
              className="group/btn inline-flex items-center gap-1.5 text-xs cursor-pointer"
            >
              {submitButtonText ? (
                <>
                  <span>{submitButtonText.replace(/→|←/g, '').trim()}</span>
                  <IconArrowRight size={14} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
                </>
              ) : isLast ? (
                <>
                  <IconSparkles size={14} />
                  <span>Improve Prompt</span>
                </>
              ) : (
                <>
                  <span>Next Question</span>
                  <IconArrowRight size={14} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
                </>
              )}
            </Button>
          </div>
          {!hideSkip && (
            <Button
              variant="ghost"
              onClick={() => onAnswer(question.id, '')}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-mono"
            >
              Skip
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

