import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'info' | 'soon' | 'violet'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-white/[0.06] text-slate-400',
    success: 'bg-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/20 text-amber-400',
    info: 'bg-indigo-500/20 text-indigo-400',
    soon: 'bg-violet-500/15 text-violet-400 border border-violet-500/20',
    violet: 'bg-violet-500/20 text-violet-300',
  }

  return (
    <span
      className={[
        'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full',
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
