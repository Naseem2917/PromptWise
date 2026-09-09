import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Question } from '../../types'
import { Button } from '../ui/Button'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  onAnswer: (id: string, answer: string | string[]) => void
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
}: QuestionCardProps) {
  const [singleSelected, setSingleSelected] = useState<string>('')
  const [multiSelected, setMultiSelected] = useState<string[]>([])
  const [textValue, setTextValue] = useState('')
  const [toggled, setToggled] = useState(false)

  const isLast = questionNumber === totalQuestions

  const canProceed =
    question.type === 'text'
      ? textValue.trim().length > 0
      : question.type === 'toggle'
        ? true
        : question.type === 'multi_choice'
          ? multiSelected.length > 0
          : singleSelected.length > 0

  const handleSubmit = () => {
    if (question.type === 'text') {
      onAnswer(question.id, textValue.trim())
    } else if (question.type === 'toggle') {
      onAnswer(question.id, toggled ? 'Yes' : 'No')
    } else if (question.type === 'multi_choice') {
      onAnswer(question.id, multiSelected)
    } else {
      onAnswer(question.id, singleSelected)
    }
  }

  const toggleMulti = (option: string) => {
    setMultiSelected((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
    )
  }

  const optionBase =
    'text-left w-full px-5 py-3.5 rounded-xl border transition-all duration-200 cursor-pointer min-h-[44px] flex items-center'
  const optionIdle =
    'border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] text-slate-800 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/[0.05] shadow-xs'
  const optionActive =
    'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/30 font-semibold'

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-2xl mx-auto"
      >
        {/* Counter */}
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
          Question {questionNumber} of {totalQuestions}
        </p>

        {/* Question */}
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-7">{question.question}</h3>

        {/* ── Single Choice ───────────────────────────────────────────── */}
        {question.type === 'single_choice' && (
          <div className="grid gap-3">
            {question.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => setSingleSelected(opt)}
                className={[optionBase, singleSelected === opt ? optionActive : optionIdle].join(' ')}
              >
                <span className="font-medium">{opt}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── Multi Choice ────────────────────────────────────────────── */}
        {question.type === 'multi_choice' && (
          <div className="grid gap-3">
            {question.options?.map((opt) => {
              const sel = multiSelected.includes(opt)
              return (
                <button
                  key={opt}
                  onClick={() => toggleMulti(opt)}
                  className={[
                    optionBase,
                    'flex items-center gap-3',
                    sel ? optionActive : optionIdle,
                  ].join(' ')}
                >
                  <span
                    className={[
                      'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-200',
                      sel ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600',
                    ].join(' ')}
                  >
                    {sel && <span className="text-white text-[10px] font-bold leading-none">✓</span>}
                  </span>
                  <span className="font-medium">{opt}</span>
                </button>
              )
            })}
            {multiSelected.length > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{multiSelected.length} selected</p>
            )}
          </div>
        )}

        {/* ── Text ────────────────────────────────────────────────────── */}
        {question.type === 'text' && (
          <input
            type="text"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && canProceed && handleSubmit()}
            placeholder="Type your answer…"
            autoFocus
            className="w-full bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] rounded-xl px-4 py-3.5 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 min-h-[44px] shadow-xs"
          />
        )}

        {/* ── Toggle ──────────────────────────────────────────────────── */}
        {question.type === 'toggle' && (
          <button
            onClick={() => setToggled(!toggled)}
            className="flex items-center gap-4 cursor-pointer min-h-[44px]"
            aria-pressed={toggled}
          >
            <div
              className={[
                'relative w-14 h-7 rounded-full transition-colors duration-300',
                toggled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-white/[0.1]',
              ].join(' ')}
            >
              <motion.div
                className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm"
                animate={{ x: toggled ? 28 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            </div>
            <span className="text-slate-800 dark:text-slate-300 font-medium">{toggled ? 'Yes' : 'No'}</span>
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mt-8">
          <Button onClick={handleSubmit} disabled={!canProceed}>
            {isLast ? '✨ Generate Improved Prompt' : 'Next →'}
          </Button>
          <Button variant="ghost" onClick={() => onAnswer(question.id, '')}>
            Skip
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
