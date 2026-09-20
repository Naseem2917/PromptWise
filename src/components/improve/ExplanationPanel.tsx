import { motion } from 'framer-motion'
import type { ExplanationItem } from '../../types'

export function ExplanationPanel({ items }: { items: ExplanationItem[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="workbench-card p-6 sm:p-7 shadow-sm"
    >
      <div className="pb-4 mb-5 border-b border-slate-200/80 dark:border-slate-800">
        <span className="font-mono text-xs font-semibold text-cobalt-600 dark:text-cobalt-400 uppercase tracking-wider block mb-0.5">
          Educational Rationale
        </span>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          What Changed &amp; Why It Matters
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Understanding these systematic improvements helps you write more effective prompts independently.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.08 }}
            className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/70"
          >
            {/* Monospace Number Badge */}
            <div className="w-7 h-7 rounded-lg bg-cobalt-500/10 dark:bg-cobalt-500/15 border border-cobalt-500/25 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-cobalt-700 dark:text-cobalt-400 text-xs font-mono font-bold">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 dark:text-slate-100 font-semibold text-sm mb-1">
                {item.label}
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                {item.detail}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

