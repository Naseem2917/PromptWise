import { motion } from 'framer-motion'

interface StepIndicatorProps {
  /** 0-indexed current step out of totalSteps */
  currentStep: number
  totalSteps: number
  labels?: string[]
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const done = i < currentStep
          const active = i === currentStep
          return (
            <div key={i} className="flex-1 flex flex-col gap-1.5">
              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  initial={{ width: 0 }}
                  animate={{ width: done ? '100%' : active ? '60%' : '0%' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              {labels?.[i] && (
                <span
                  className={[
                    'text-[10px] font-medium transition-colors duration-200',
                    done || active ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-400 dark:text-slate-500',
                  ].join(' ')}
                >
                  {labels[i]}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
