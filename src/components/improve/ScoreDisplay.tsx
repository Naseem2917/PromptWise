import { motion } from 'framer-motion'
import type { ScoreBreakdown } from '../../types'
import { IconCheckCircle, IconAlertCircle, IconXCircle, IconArrowRight } from '../ui/Icons'

const ELEMENTS: { key: keyof ScoreBreakdown; label: string; description: string }[] = [
  { key: 'goal', label: 'Goal', description: 'What you want the AI to do' },
  { key: 'context', label: 'Context', description: 'Background information and situation' },
  { key: 'audience', label: "Who It's For", description: 'Who will read or use the answer' },
  { key: 'specificity', label: 'Specific Details', description: 'Exact topics, examples, and scope' },
  { key: 'outputFormat', label: 'Answer Format', description: 'Layout, bullet points, or sections' },
  { key: 'constraints', label: 'Rules & Limits', description: 'Length limits, things to avoid, or rules' },
]

function renderDiagnosticBadge(val: unknown) {
  if (val === true || val === 'full') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-sage-700 dark:text-sage-300 bg-sage-500/15 border border-sage-500/30 px-2 py-0.5 rounded">
        <IconCheckCircle size={13} className="text-sage-600 dark:text-sage-400 shrink-0" />
        <span>Included</span>
      </span>
    )
  }
  if (val === 'partial') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-ochre-700 dark:text-ochre-300 bg-ochre-500/15 border border-ochre-500/30 px-2 py-0.5 rounded">
        <IconAlertCircle size={13} className="text-ochre-600 dark:text-ochre-400 shrink-0" />
        <span>Partly Included</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded">
      <IconXCircle size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
      <span>Missing</span>
    </span>
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="workbench-card p-6 sm:p-7 shadow-sm space-y-6"
    >
      {/* Scoreboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <span className="font-mono text-xs font-semibold text-cobalt-600 dark:text-cobalt-400 uppercase tracking-wider block mb-0.5">
            Prompt Check
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            Prompt Quality Score
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-right max-w-xs">
          See how clear and complete your prompt is.
        </p>
      </div>

      {/* Numerical Comparison Callout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        {/* Initial Score */}
        <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-white dark:bg-slate-900 border border-ochre-500/20">
          <span className="text-[11px] font-mono uppercase tracking-wider text-ochre-700 dark:text-ochre-400 mb-1">
            Original Prompt
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-mono font-bold text-slate-900 dark:text-slate-100">
              {scoreBefore}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 100</span>
          </div>
        </div>

        {/* Delta */}
        <div className="flex flex-col items-center justify-center p-3">
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Score Improvement
          </span>
          <div className="flex items-center gap-1.5">
            <IconArrowRight size={16} className="text-slate-400 hidden sm:inline" />
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-mono font-bold text-sage-700 dark:text-sage-300 bg-sage-500/15 border border-sage-500/30">
              {gain > 0 ? `+${gain} pts` : scoreAfter === 100 ? 'Top Score' : '+0 pts'}
            </span>
          </div>
        </div>

        {/* Calibrated Score */}
        <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-white dark:bg-slate-900 border border-sage-500/30">
          <span className="text-[11px] font-mono uppercase tracking-wider text-sage-700 dark:text-sage-400 mb-1">
            Improved Prompt
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-mono font-bold text-sage-700 dark:text-sage-400">
              {scoreAfter}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 100</span>
          </div>
        </div>
      </div>

      {/* Horizontal Calibrated Progress Track */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500">
          <span>0 — Needs details</span>
          <span>50 — Getting clearer</span>
          <span>100 — Clear and complete</span>
        </div>
        <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden flex">
          {/* Before Segment */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${scoreBefore}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-ochre-500/80 relative z-10"
            title={`Before: ${scoreBefore}`}
          />
          {/* Gain Segment */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, scoreAfter - scoreBefore)}%` }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="h-full bg-sage-500 relative z-10"
            title={`After: ${scoreAfter}`}
          />
        </div>
      </div>

      {/* 6 Structural Dimensions Diagnostic Breakdown */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60 text-xs font-mono text-slate-400 dark:text-slate-500 uppercase">
          <span>What Your Prompt Includes</span>
          <span>Before → After</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {ELEMENTS.map(({ key, label, description }, i) => {
            const before = breakdownBefore[key]
            const after = breakdownAfter[key]
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {label}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
                    {description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {renderDiagnosticBadge(before)}
                  <IconArrowRight size={12} className="text-slate-400 dark:text-slate-600" />
                  {renderDiagnosticBadge(after)}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

