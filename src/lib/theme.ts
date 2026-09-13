/**
 * Reusable Tailwind class string constants for consistent light/dark theming.
 * Import only where it reduces repetition across multiple elements.
 */
export const cx = {
  /** e.g. section titles like "🔖 Saved Prompts" */
  sectionHeading: 'text-lg font-bold text-slate-800 dark:text-slate-200',
  /** Standard body paragraph text */
  bodyText: 'text-slate-700 dark:text-slate-300',
  /** Muted / secondary text */
  mutedText: 'text-slate-500 dark:text-slate-400',
  /** Inner card / sub-section (used inside glass-card) */
  subCard: 'p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]',
  /** Heading inside a sub-card */
  subHeading: 'text-sm font-bold text-slate-800 dark:text-slate-200',
  /** Small text inside a sub-card */
  subText: 'text-xs text-slate-500 dark:text-slate-400',
  /** Inline code label */
  inlineCode: 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded font-medium',
} as const
