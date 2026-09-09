import { motion } from 'framer-motion'
import type { ExplanationItem } from '../../types'

export function ExplanationPanel({ items }: { items: ExplanationItem[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card rounded-2xl p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">What Changed &amp; Why</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-7">
        Understanding these changes helps you write better prompts independently.
      </p>

      <div className="space-y-5">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="flex gap-4"
          >
            {/* Number bubble */}
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">{i + 1}</span>
            </div>

            {/* Content */}
            <div>
              <p className="text-slate-900 dark:text-slate-200 font-semibold text-sm">{item.label}</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5 leading-relaxed">{item.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
