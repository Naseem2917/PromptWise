import { motion } from 'framer-motion'
import type { ScoreBreakdown } from '../../types'

const ELEMENTS: { key: keyof ScoreBreakdown; label: string }[] = [
  { key: 'goal', label: 'Goal' },
  { key: 'context', label: 'Context' },
  { key: 'audience', label: 'Audience' },
  { key: 'specificity', label: 'Specificity' },
  { key: 'outputFormat', label: 'Output Format' },
  { key: 'constraints', label: 'Constraints' },
]

function renderStatusBadge(val: unknown) {
  if (val === true || val === 'full') {
    return <span className="text-sm w-4 text-center" title="Fully specified (16.7 pts)">✅</span>
  }
  if (val === 'partial') {
    return <span className="text-sm w-4 text-center" title="Partially specified / Needs more detail (8.3 pts)">⚠️</span>
  }
  return <span className="text-sm w-4 text-center" title="Missing (0 pts)">❌</span>
}

interface ScoreRingProps {
  score: number
  label: string
  color: string
  delay?: number
}

function ScoreRing({ score, label, color, delay = 0 }: ScoreRingProps) {
  const r = 40
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            className="stroke-slate-200 dark:stroke-white/10"
            strokeWidth="8"
          />
          <motion.circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: 'easeOut', delay }}
          />
        </svg>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.4 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{score}</span>
        </motion.div>
      </div>
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</span>
    </div>
  )
}

interface ScoreDisplayProps {
  scoreBefore: number
  scoreAfter: number
  breakdownBefore: ScoreBreakdown
  breakdownAfter: ScoreBreakdown
}

export function ScoreDisplay({
  scoreBefore,
  scoreAfter,
  breakdownBefore,
  breakdownAfter,
}: ScoreDisplayProps) {
  const gain = scoreAfter - scoreBefore

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card rounded-2xl p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Prompt Quality Score</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-7">
        Based on the 6 core elements of an effective prompt.
      </p>

      {/* Rings */}
      <div className="flex items-center justify-center gap-6 sm:gap-8 mb-8">
        <ScoreRing score={scoreBefore} label="Before" color="#ef4444" delay={0.2} />

        <div className="flex flex-col items-center gap-1 pb-7">
          <span className="text-slate-400 dark:text-slate-600 text-xl">→</span>
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm text-center px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
          >
            {gain > 0 ? `+${gain} pts` : scoreAfter === 100 ? '★ Top Score' : '+0 pts (Optimal)'}
          </motion.span>
        </div>

        <ScoreRing score={scoreAfter} label="After" color="#6366f1" delay={0.5} />
      </div>

      {/* Breakdown */}
      <div className="space-y-1">
        {ELEMENTS.map(({ key, label }, i) => {
          const before = breakdownBefore[key]
          const after = breakdownAfter[key]
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.06 }}
              className="flex items-center justify-between py-2.5 border-b border-slate-200 dark:border-white/[0.04] last:border-0"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{label}</span>
                {before === 'partial' && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Partial
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {renderStatusBadge(before)}
                <span className="text-slate-400 dark:text-slate-600 text-xs">→</span>
                {renderStatusBadge(after)}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
