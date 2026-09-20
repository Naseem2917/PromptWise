import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'info' | 'soon' | 'violet'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/80',
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25',
    warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25',
    info: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/25',
    soon: 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    violet: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/25',
  }

  return (
    <span
      className={[
        'inline-flex items-center gap-1 text-[11px] font-medium font-mono px-2 py-0.5 rounded-md border',
        variants[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
