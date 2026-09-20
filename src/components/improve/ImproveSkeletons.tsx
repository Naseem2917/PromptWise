import { motion } from 'framer-motion'
import { IconSparkles } from '../ui/Icons'

/**
 * Skeleton loader displayed when Gemini AI is analyzing the prompt
 * and generating adaptive follow-up questions (Stage A -> Stage B).
 */
export function AnalyzeSkeleton({ prompt }: { prompt?: string }) {
  return (
    <motion.div
      key="analyze-skeleton"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-3xl mx-auto space-y-6"
    >
      {/* Top Status Badge & Heading */}
      <div className="text-center space-y-2 mb-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cobalt-500/10 border border-cobalt-500/25 text-cobalt-700 dark:text-cobalt-300 text-xs font-mono font-medium tracking-wide">
          <IconSparkles size={14} className="animate-spin" />
          <span>Checking your prompt with AI…</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
          Finding ways to make your prompt clearer and more specific
        </p>
      </div>

      {/* User prompt preview banner */}
      {prompt && (
        <div className="px-5 py-3.5 rounded-xl bg-ochre-500/[0.04] dark:bg-ochre-500/[0.06] border border-ochre-500/25 shadow-2xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-ochre-500" />
            <p className="text-[11px] font-mono text-ochre-700 dark:text-ochre-400 font-medium uppercase tracking-wider">
              Your Original Prompt
            </p>
          </div>
          <p className="font-mono-code text-xs sm:text-sm text-slate-800 dark:text-slate-200 line-clamp-2">{prompt}</p>
        </div>
      )}

      {/* Question Card Skeleton */}
      <div className="workbench-card p-6 sm:p-7 shadow-sm space-y-5">
        {/* Step indicator placeholder */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="w-36 h-4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="w-20 h-4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>

        {/* Question Title Skeleton */}
        <div className="space-y-2">
          <div className="w-4/5 h-6 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="w-2/3 h-6 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>

        {/* Option Pills Skeletons */}
        <div className="space-y-2.5 pt-2">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 px-4 flex items-center justify-between animate-pulse"
              style={{ animationDelay: `${idx * 120}ms` }}
            >
              <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" style={{ width: `${45 + idx * 15}%` }} />
              <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
            </div>
          ))}
        </div>

        {/* Bottom Buttons Skeleton */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800">
          <div className="w-16 h-9 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="w-28 h-9 rounded-lg bg-cobalt-500/20 animate-pulse" />
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Skeleton loader displayed when Gemini AI is crafting the final enhanced prompt.
 */
export function ImproveSkeleton({ originalPrompt }: { originalPrompt?: string }) {
  return (
    <motion.div
      key="improve-skeleton"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-3xl mx-auto space-y-6"
    >
      {/* 1. Results Header Mirror */}
      <div className="text-center mb-4 space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage-500/15 border border-sage-500/30 text-sage-700 dark:text-sage-300 text-xs font-mono font-medium animate-pulse">
          <IconSparkles size={14} className="animate-spin text-sage-600 dark:text-sage-400 shrink-0" />
          <span>Writing your improved prompt…</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          Refining Your Prompt
        </h2>
      </div>

      {/* 2. Before / After Mirror (2-Column Grid matching BeforeAfter.tsx) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Original Prompt (Ochre) */}
        <div className="rounded-xl border border-ochre-500/30 bg-ochre-500/[0.04] dark:bg-ochre-500/[0.06] p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-ochre-500/20">
              <span className="w-2 h-2 rounded-full bg-ochre-500 shrink-0" />
              <span className="font-mono text-xs font-semibold text-ochre-700 dark:text-ochre-400 uppercase tracking-wider">
                Your Original Prompt
              </span>
            </div>
            {originalPrompt ? (
              <p className="font-mono-code text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {originalPrompt}
              </p>
            ) : (
              <div className="space-y-2 animate-pulse">
                <div className="w-3/4 h-3.5 rounded bg-ochre-500/10" />
                <div className="w-1/2 h-3.5 rounded bg-ochre-500/10" />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Improved Prompt Shimmer (Sage) */}
        <div className="rounded-xl border border-sage-500/35 bg-sage-500/[0.04] dark:bg-sage-500/[0.06] p-4 sm:p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-sage-500/20">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sage-500 shrink-0 animate-pulse" />
              <span className="font-mono text-xs font-semibold text-sage-700 dark:text-sage-400 uppercase tracking-wider">
                Improved Prompt
              </span>
            </div>
            <div className="w-16 h-6 rounded bg-sage-500/15 animate-pulse" />
          </div>

          {/* Realistic shimmering lines */}
          <div className="space-y-2.5 pt-1">
            <div className="w-11/12 h-3.5 rounded bg-sage-500/20 animate-pulse" />
            <div className="w-full h-3.5 rounded bg-sage-500/15 animate-pulse" />
            <div className="w-4/5 h-3.5 rounded bg-sage-500/20 animate-pulse" />
            <div className="w-3/4 h-3.5 rounded bg-sage-500/15 animate-pulse" />
            <div className="w-5/6 h-3.5 rounded bg-sage-500/15 animate-pulse" />
          </div>
        </div>
      </div>

      {/* 3. Diagnostic Scoreboard Skeleton Mirror */}
      <div className="workbench-card p-5 shadow-2xs animate-pulse space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="w-36 h-4 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="w-24 h-4 rounded bg-sage-500/20" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="w-20 h-3 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="w-12 h-4 rounded bg-cobalt-500/20" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

