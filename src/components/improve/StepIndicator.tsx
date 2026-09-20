import { motion } from 'framer-motion'

interface StepIndicatorProps {
  /** 0-indexed current step out of totalSteps */
  currentStep: number
  totalSteps: number
  labels?: string[]
}

const DEFAULT_LABELS = ['1. Prompt', '2. Questions', '3. Improved Prompt']
const MOBILE_LABELS = ['1. Prompt', '2. Questions', '3. Improved']

export function StepIndicator({ currentStep, totalSteps, labels = DEFAULT_LABELS }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {/* 1. Progress lines in a single dedicated row - always perfectly level */}
      <div className="flex items-center gap-2 sm:gap-3 mb-2">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const done = i < currentStep
          const active = i === currentStep
          return (
            <div key={i} className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <motion.div
                className={`h-full rounded-full transition-colors duration-300 ${
                  done ? 'bg-sage-600 dark:bg-sage-500' : active ? 'bg-cobalt-600 dark:bg-cobalt-500' : 'bg-transparent'
                }`}
                initial={{ width: 0 }}
                animate={{ width: done ? '100%' : active ? '70%' : '0%' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          )
        })}
      </div>

      {/* 2. Step labels row */}
      <div className="flex items-start gap-2 sm:gap-3">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const done = i < currentStep
          const active = i === currentStep
          return (
            <div key={i} className="flex-1 min-w-0 flex items-center justify-between">
              <span
                className={[
                  'text-[10px] sm:text-[11px] font-mono tracking-wider transition-colors duration-200 uppercase truncate',
                  done
                    ? 'text-sage-700 dark:text-sage-400 font-semibold'
                    : active
                      ? 'text-cobalt-700 dark:text-cobalt-400 font-semibold'
                      : 'text-slate-400 dark:text-slate-500',
                ].join(' ')}
              >
                <span className="sm:hidden">{MOBILE_LABELS[i] ?? labels[i] ?? `Step 0${i + 1}`}</span>
                <span className="hidden sm:inline">{labels[i] ?? `Step 0${i + 1}`}</span>
              </span>
              {done && (
                <span className="hidden sm:inline text-[10px] font-mono text-sage-600 dark:text-sage-400 shrink-0 ml-1">
                  Done
                </span>
              )}
              {active && (
                <span className="hidden sm:inline text-[10px] font-mono text-cobalt-600 dark:text-cobalt-400 shrink-0 ml-1">
                  Current
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

