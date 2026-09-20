import { motion } from 'framer-motion'

interface StepIndicatorProps {
  /** 0-indexed current step out of totalSteps */
  currentStep: number
  totalSteps: number
  labels?: string[]
}

const DEFAULT_LABELS = ['1. Prompt', '2. Questions', '3. Improved Prompt']

export function StepIndicator({ currentStep, totalSteps, labels = DEFAULT_LABELS }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center gap-3">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const done = i < currentStep
          const active = i === currentStep
          return (
            <div key={i} className="flex-1 flex flex-col gap-2">
              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full transition-colors duration-300 ${
                    done ? 'bg-sage-600 dark:bg-sage-500' : active ? 'bg-cobalt-600 dark:bg-cobalt-500' : 'bg-transparent'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: done ? '100%' : active ? '70%' : '0%' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={[
                    'text-[11px] font-mono tracking-wider transition-colors duration-200 uppercase',
                    done
                      ? 'text-sage-700 dark:text-sage-400 font-semibold'
                      : active
                        ? 'text-cobalt-700 dark:text-cobalt-400 font-semibold'
                        : 'text-slate-400 dark:text-slate-500',
                  ].join(' ')}
                >
                  {labels[i] ?? `Step 0${i + 1}`}
                </span>
                {done && (
                  <span className="text-[10px] font-mono text-sage-600 dark:text-sage-400">Done</span>
                )}
                {active && (
                  <span className="text-[10px] font-mono text-cobalt-600 dark:text-cobalt-400">Current</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

