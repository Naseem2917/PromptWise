interface BrandLogoProps {
  className?: string
  size?: number | string
}

export function BrandLogo({ className = 'w-8 h-8', size }: BrandLogoProps) {
  return (
    <img
      src="/Icon.png"
      alt="PromptWise Logo"
      className={`object-contain select-none transition-transform duration-200 drop-shadow-[0_2px_8px_rgba(99,102,241,0.15)] dark:drop-shadow-[0_2px_12px_rgba(99,102,241,0.25)] ${className}`}
      style={size ? { width: size, height: size } : undefined}
      loading="eager"
    />
  )
}
