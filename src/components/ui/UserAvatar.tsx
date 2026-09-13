import { useState } from 'react'

interface UserAvatarProps {
  photoURL?: string | null
  name?: string | null
  email?: string | null
  className?: string
  sizeClassName?: string
  textClassName?: string
  roundedClassName?: string
}

// 8 vibrant, modern gradient color palettes for avatar backgrounds
const AVATAR_GRADIENTS = [
  'from-violet-600 to-indigo-600 text-white',
  'from-emerald-500 to-teal-600 text-white',
  'from-blue-600 to-cyan-600 text-white',
  'from-rose-500 to-pink-600 text-white',
  'from-amber-500 to-orange-600 text-white',
  'from-indigo-600 to-sky-600 text-white',
  'from-fuchsia-600 to-purple-600 text-white',
  'from-teal-500 to-emerald-600 text-white',
]

/**
 * Deterministically pick an avatar gradient based on string hash so a user's
 * background color remains stable across page refreshes.
 */
function getAvatarGradient(seed: string): string {
  if (!seed) return AVATAR_GRADIENTS[0]
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length
  return AVATAR_GRADIENTS[index]
}

/**
 * Extracts first & last name initials.
 * e.g., "Naseem Khan" -> "NK"
 * e.g., "Naseem" -> "N"
 * e.g., null -> falls back to email e.g. "khannaseem1704@gmail.com" -> "K"
 */
export function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    if (parts.length === 1 && parts[0].length > 0) {
      return parts[0][0].toUpperCase()
    }
  }
  if (email && email.trim()) {
    return email.trim()[0].toUpperCase()
  }
  return 'U'
}

export function UserAvatar({
  photoURL,
  name,
  email,
  className = '',
  sizeClassName = 'w-8 h-8',
  textClassName = 'text-xs font-bold',
  roundedClassName = 'rounded-full',
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false)

  const seed = name || email || 'user'
  const gradient = getAvatarGradient(seed)
  const initials = getInitials(name, email)

  // If photoURL exists and has not failed to load, render the image
  if (photoURL && !imageError) {
    return (
      <img
        src={photoURL}
        alt={name || 'User Avatar'}
        onError={() => setImageError(true)}
        className={`${sizeClassName} ${roundedClassName} object-cover select-none shrink-0 ${className}`}
        loading="lazy"
      />
    )
  }

  // Fallback avatar with initial letters and vibrant background gradient
  return (
    <div
      className={`${sizeClassName} ${roundedClassName} bg-gradient-to-br ${gradient} flex items-center justify-center select-none shrink-0 shadow-xs tracking-wider ${textClassName} ${className}`}
      title={name || email || 'User'}
      aria-label={name || email || 'User'}
    >
      <span>{initials}</span>
    </div>
  )
}
