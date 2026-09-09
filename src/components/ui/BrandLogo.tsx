interface BrandLogoProps {
  className?: string
  size?: number | string
}

export function BrandLogo({ className = 'w-8 h-8', size }: BrandLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="PromptWise Logo"
      className={`rounded-xl object-contain shadow-md shadow-indigo-500/20 select-none ${className}`}
      style={size ? { width: size, height: size } : undefined}
      loading="eager"
      onError={(e) => {
        const target = e.currentTarget
        if (!target.src.endsWith('/logo.jpg')) {
          target.src = '/logo.jpg'
        }
      }}
    />
  )
}
