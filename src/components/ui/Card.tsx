import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  glow?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

export function Card({ children, className = '', glow = false, padding = 'md' }: CardProps) {
  const paddings: Record<string, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
  return (
    <div
      className={[
        'glass-card rounded-2xl',
        paddings[padding],
        glow ? 'shadow-xl shadow-indigo-500/10' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
