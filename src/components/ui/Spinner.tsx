type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'

interface SpinnerProps {
  size?: SpinnerSize
  className?: string
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes: Record<SpinnerSize, string> = {
    sm: 'w-4 h-4 border-[1.5px]',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-2',
    xl: 'w-14 h-14 border-[3px]',
  }
  return (
    <div
      className={[
        'rounded-full animate-spin border-indigo-500/20 border-t-indigo-500',
        sizes[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
