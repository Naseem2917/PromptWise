import type { SVGProps } from 'react'

export interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string
  size?: number | string
}

const defaultProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function IconHome({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
    </svg>
  )
}

export function IconSparkles({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
      <path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z" />
    </svg>
  )
}

export function IconBrain({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 122.88 115.23"
      fill="currentColor"
      stroke="none"
      aria-hidden
      className={className}
      {...props}
    >
      <path d="M60.89,8.37c2.99-4.67,6.96-7.16,11.12-8.03c3.95-0.82,8-0.11,11.49,1.65c3.44,1.74,6.39,4.52,8.2,7.88 c0.68,1.26,1.21,2.6,1.55,3.98c2.03-0.04,4.1,0.31,6.11,0.99c3.82,1.29,7.49,3.82,10.33,7.17c2.85,3.37,4.88,7.62,5.4,12.33 c0.24,2.17,0.15,4.43-0.32,6.74c2.09,1.87,3.83,3.98,5.14,6.23c2.03,3.47,3.09,7.32,2.98,11.23c-0.11,3.94-1.41,7.88-4.09,11.51 c-1.69,2.29-3.92,4.44-6.73,6.37c0.26,6.02-1.52,11.42-4.4,15.6c-3.26,4.72-7.98,7.92-12.88,8.78c-1.08,4.19-3.86,7.88-7.45,10.45 c-4.54,3.25-10.46,4.78-15.87,3.3c-3.99-1.09-7.62-3.73-10.11-8.38c-3.03,5.11-7.19,7.81-11.55,8.72 c-5.23,1.09-10.64-0.52-14.72-3.7c-3.26-2.54-5.71-6.11-6.59-10.16c-1.71-0.07-3.44-0.41-5.13-0.98c-3.73-1.26-7.32-3.7-10.13-6.95 c-2.82-3.25-4.87-7.34-5.51-11.89c-0.33-2.37-0.28-4.85,0.24-7.4c-1.83-1.66-3.4-3.53-4.65-5.56C1.14,64.78-0.05,60.86,0,56.83 c0.05-4.06,1.34-8.18,4.14-12c1.63-2.22,3.78-4.34,6.5-6.28c-0.03-0.74-0.03-1.48-0.01-2.21c0.22-5.93,2.4-11.14,5.59-15.03 c3.3-4.03,7.72-6.67,12.26-7.31l0.02,0c0.16-0.67,0.35-1.32,0.59-1.96c1.46-3.97,4.47-7.34,8.16-9.49 c3.71-2.16,8.17-3.11,12.51-2.21C53.93,1.2,57.9,3.7,60.89,8.37L60.89,8.37z M93.02,21.89c-0.66,2.18-1.84,4.37-3.64,6.5 c-1.37,1.63-3.8,1.84-5.43,0.47c-1.63-1.37-1.84-3.8-0.47-5.43c2.9-3.45,2.93-7.07,1.4-9.9c-1.06-1.96-2.81-3.6-4.87-4.64 c-2.01-1.01-4.28-1.44-6.44-0.99c-2.88,0.6-5.67,2.83-7.6,7.36c0.03,0.2,0.05,0.41,0.05,0.62v79.69c0.06,0.19,0.11,0.4,0.15,0.6 c1.11,6.75,4.03,10,7.31,10.9c3.03,0.83,6.52-0.14,9.3-2.14c2.73-1.96,4.68-4.82,4.7-7.83c0.03-3.43-2.49-7.31-9.23-10.75 c-1.91-0.97-2.66-3.31-1.69-5.22c0.97-1.91,3.31-2.66,5.22-1.69c7.44,3.8,11.36,8.46,12.8,13.17c2.39-0.78,4.71-2.6,6.47-5.14 c2.21-3.19,3.46-7.48,2.86-12.3c-0.35-1.65,0.37-3.41,1.9-4.3c2.92-1.71,5.07-3.6,6.53-5.59c1.66-2.24,2.46-4.62,2.53-6.96 c0.07-2.36-0.61-4.74-1.91-6.96c-1.19-2.03-2.87-3.9-4.98-5.48c-1.47-0.98-2.17-2.87-1.57-4.62c0.71-2.1,0.9-4.14,0.69-6.06 c-0.33-3.02-1.67-5.77-3.54-8c-1.89-2.24-4.31-3.92-6.78-4.75C95.5,22.01,94.22,21.81,93.02,21.89L93.02,21.89z M28.85,93.03 c1.54-4.84,5.6-9.67,13.26-13.58c1.91-0.97,4.24-0.22,5.22,1.69c0.97,1.91,0.22,4.24-1.69,5.22c-7.1,3.63-9.77,7.79-9.77,11.42 c0,2.83,1.61,5.48,3.96,7.31c2.38,1.85,5.46,2.81,8.36,2.21c3.62-0.75,7.11-4.1,8.92-11.39V19.22C55.3,11.98,51.81,8.65,48.2,7.9 c-2.38-0.5-4.91,0.07-7.07,1.33c-2.18,1.27-3.94,3.22-4.77,5.47c-1.11,3-0.45,6.69,3.3,10.16c1.56,1.45,1.66,3.88,0.21,5.44 c-1.45,1.56-3.88,1.66-5.44,0.21c-2.92-2.7-4.72-5.57-5.62-8.43c-2.3,0.55-4.57,2.07-6.4,4.3c-2.15,2.62-3.62,6.16-3.77,10.23 c-0.04,1.08,0.02,2.22,0.18,3.39l-0.01,0c0.21,1.52-0.47,3.09-1.86,3.95c-2.81,1.73-4.89,3.63-6.34,5.61 c-1.76,2.4-2.57,4.92-2.6,7.35c-0.03,2.47,0.73,4.92,2.09,7.13c1.15,1.87,2.73,3.57,4.65,5c1.44,0.99,2.12,2.85,1.53,4.59 c-0.76,2.25-0.93,4.44-0.64,6.47c0.41,2.93,1.77,5.6,3.63,7.75c1.87,2.16,4.23,3.77,6.65,4.59C26.9,92.8,27.89,92.99,28.85,93.03 L28.85,93.03z M29.73,38.54c1.52-1.49,3.96-1.47,5.46,0.05c1.49,1.52,1.47,3.96-0.05,5.46c-3.31,3.26-5.04,7.46-5.22,11.76 c-0.18,4.43,1.26,8.98,4.28,12.73c1.34,1.66,1.07,4.09-0.59,5.43c-1.66,1.34-4.09,1.07-5.43-0.59c-4.23-5.24-6.24-11.62-5.98-17.87 C22.47,49.29,24.96,43.23,29.73,38.54L29.73,38.54z M84.51,42.25c-1.73-1.25-2.11-3.67-0.86-5.4c1.25-1.73,3.67-2.12,5.4-0.86 c0.77,0.56,1.5,1.15,2.18,1.77c5.03,4.54,7.78,10.53,8.28,16.73c0.5,6.14-1.21,12.48-5.08,17.8c-0.57,0.78-1.18,1.54-1.84,2.27 c-1.43,1.59-3.87,1.72-5.46,0.29c-1.59-1.43-1.72-3.87-0.29-5.46c0.48-0.53,0.92-1.08,1.33-1.64c2.76-3.8,3.98-8.3,3.63-12.66 c-0.35-4.29-2.25-8.44-5.74-11.58C85.57,43.07,85.06,42.65,84.51,42.25L84.51,42.25z" />
    </svg>
  )
}

export function IconBookOpen({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

export function IconLightbulb({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z" />
    </svg>
  )
}

export function IconHelpCircle({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

export function IconLayoutDashboard({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  )
}

export function IconHistory({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
}

export function IconGraduationCap({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  )
}

export function IconShield({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

export function IconMessageSquare({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export function IconLogOut({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export function IconLogIn({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  )
}

export function IconUser({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export function IconZap({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

export function IconScale({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <path d="M16 16l3-8 3 8a3 3 0 0 1-6 0M2 16l3-8 3 8a3 3 0 0 1-6 0" />
      <path d="M7 21h10M12 3v18M3 7h18" />
    </svg>
  )
}

export function IconCopy({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

export function IconCheck({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function IconCheckCircle({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

export function IconAlertCircle({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

export function IconXCircle({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

export function IconX({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function IconBookmark({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export function IconBookmarkFilled({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={1.75} className={className} aria-hidden={true} {...props}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export function IconTrash({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

export function IconSun({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

export function IconMoon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function IconChevronDown({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export function IconChevronRight({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export function IconArrowRight({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export function IconArrowLeft({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

export function IconMoreVertical({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  )
}

export function IconExternalLink({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

export function IconFileText({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

export function IconTerminal({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  )
}

export function IconEdit({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

export function IconRotateCcw({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  )
}

export function IconLock({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export function IconSearch({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
export function IconAward({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  )
}

export function IconRefreshCw({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )
}

export function IconStar({
  size = 20,
  className = '',
  fill = 'none',
  ...props
}: IconProps & { fill?: string }) {
  return (
    <svg
      width={size}
      height={size}
      {...defaultProps}
      fill={fill}
      className={className}
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export function IconSend({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

export function IconMenu({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} className={className} {...props}>
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

