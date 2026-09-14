import { motion } from 'framer-motion'

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
      transition={{ duration: 0.3 }}
      className="w-full space-y-6"
    >
      {/* Top Status Badge & Heading */}
      <div className="text-center space-y-2 mb-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          <span>Analyzing prompt with Gemini AI…</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Checking intent and preparing adaptive follow-up questions
        </p>
      </div>

      {/* User prompt preview banner */}
      {prompt && (
        <div className="px-5 py-3.5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] shadow-xs">
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-1 font-medium uppercase tracking-wider">
            Your prompt
          </p>
          <p className="text-slate-800 dark:text-slate-200 text-sm line-clamp-2">{prompt}</p>
        </div>
      )}

      {/* Question Card Skeleton */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/[0.08] shadow-lg shadow-black/[0.02] dark:shadow-black/20 space-y-6">
        {/* Step pill skeleton */}
        <div className="flex items-center justify-between">
          <div className="w-28 h-5 rounded-full bg-slate-200 dark:bg-white/[0.06] animate-pulse" />
          <div className="w-16 h-4 rounded-md bg-slate-200 dark:bg-white/[0.06] animate-pulse" />
        </div>

        {/* Question Title Skeleton (2 lines) */}
        <div className="space-y-2.5">
          <div className="w-3/4 h-7 rounded-lg bg-slate-200 dark:bg-white/[0.08] animate-pulse" />
          <div className="w-1/2 h-7 rounded-lg bg-slate-200 dark:bg-white/[0.08] animate-pulse" />
        </div>

        {/* Option Pills Skeletons (3 placeholder choices) */}
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="w-full h-14 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.02] px-4 flex items-center justify-between animate-pulse"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-white/[0.12] shrink-0" />
                <div
                  className="h-4 rounded-md bg-slate-200 dark:bg-white/[0.08]"
                  style={{ width: `${55 + (idx * 15)}%` }}
                />
              </div>
              <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-white/[0.06]" />
            </div>
          ))}
        </div>

        {/* Bottom Buttons Skeleton */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/[0.06]">
          <div className="w-20 h-10 rounded-xl bg-slate-200 dark:bg-white/[0.06] animate-pulse" />
          <div className="w-32 h-10 rounded-xl bg-indigo-500/20 dark:bg-indigo-500/30 animate-pulse" />
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Skeleton loader displayed when Gemini AI is crafting the final enhanced prompt.
 * Perfectly mirrors the actual Results screen (Header badge, Actions bar, and
 * side-by-side Original Prompt vs Improved Prompt cards).
 */
export function ImproveSkeleton({ originalPrompt }: { originalPrompt?: string }) {
  return (
    <motion.div
      key="improve-skeleton"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-6"
    >
      {/* 1. Results Header Mirror */}
      <div className="text-center mb-4 space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-sm font-semibold animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span>Generating improved prompt with Gemini AI…</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Here's your improved prompt
        </h2>
      </div>

      {/* 2. Actions Bar Mirror */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] shadow-xs animate-pulse">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="w-4 h-4 rounded bg-slate-200 dark:bg-white/[0.1] inline-block" />
          <span className="h-3 w-40 rounded bg-slate-200 dark:bg-white/[0.08] inline-block" />
        </div>
        <div className="w-28 h-8 rounded-lg bg-slate-200 dark:bg-white/[0.08]" />
      </div>

      {/* 3. Before / After Mirror (2-Column Grid matching BeforeAfter.tsx) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Original Prompt */}
        <div className="rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50/60 dark:bg-red-500/[0.04] p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 shrink-0" />
            <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">
              Original Prompt
            </span>
          </div>
          {originalPrompt ? (
            <p className="text-slate-800 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {originalPrompt}
            </p>
          ) : (
            <div className="space-y-2 animate-pulse">
              <div className="w-3/4 h-4 rounded bg-red-200/60 dark:bg-red-500/10" />
              <div className="w-1/2 h-4 rounded bg-red-200/60 dark:bg-red-500/10" />
            </div>
          )}
        </div>

        {/* Right Column: Improved Prompt (Shimmering Skeleton) */}
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/60 dark:bg-indigo-500/[0.05] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0 animate-ping" />
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Improved Prompt
              </span>
            </div>
            {/* Copy Button Skeleton */}
            <div className="w-16 h-7 rounded-lg bg-indigo-200/60 dark:bg-white/[0.08] animate-pulse" />
          </div>

          {/* Realistic shimmering lines of improved prompt content */}
          <div className="space-y-3 pt-1">
            <div className="w-11/12 h-4 rounded-md bg-indigo-200/60 dark:bg-white/[0.08] animate-pulse" />
            <div className="w-full h-4 rounded-md bg-indigo-200/50 dark:bg-white/[0.07] animate-pulse" />
            <div className="w-4/5 h-4 rounded-md bg-indigo-200/60 dark:bg-white/[0.08] animate-pulse" />

            <div className="pt-2 space-y-2">
              <div className="w-2/3 h-3.5 rounded bg-indigo-300/60 dark:bg-indigo-400/20 animate-pulse" />
              <div className="w-full h-3.5 rounded bg-indigo-200/40 dark:bg-white/[0.06] animate-pulse" />
              <div className="w-5/6 h-3.5 rounded bg-indigo-200/40 dark:bg-white/[0.06] animate-pulse" />
              <div className="w-3/4 h-3.5 rounded bg-indigo-200/40 dark:bg-white/[0.06] animate-pulse" />
            </div>

            <div className="pt-2 space-y-2">
              <div className="w-1/2 h-3.5 rounded bg-indigo-300/60 dark:bg-indigo-400/20 animate-pulse" />
              <div className="w-full h-3.5 rounded bg-indigo-200/40 dark:bg-white/[0.06] animate-pulse" />
              <div className="w-4/5 h-3.5 rounded bg-indigo-200/40 dark:bg-white/[0.06] animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Score Breakdown Cards Skeleton Mirror */}
      <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-white/[0.08] shadow-sm animate-pulse space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="w-32 h-4 rounded bg-slate-200 dark:bg-white/[0.08]" />
          <div className="w-24 h-4 rounded bg-emerald-500/20" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] space-y-2">
              <div className="w-16 h-3 rounded bg-slate-200 dark:bg-white/[0.06]" />
              <div className="w-10 h-5 rounded bg-indigo-500/20" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
