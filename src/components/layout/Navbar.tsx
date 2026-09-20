import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { signOut } from '../../lib/auth'
import { ThemeToggle } from '../ui/ThemeToggle'
import { BrandLogo } from '../ui/BrandLogo'
import { UserAvatar } from '../ui/UserAvatar'
import {
  IconMessageSquare,
  IconGraduationCap,
  IconShield,
  IconLayoutDashboard,
  IconHistory,
  IconLogOut,
  IconLogIn,
  IconChevronDown,
  IconMoreVertical,
} from '../ui/Icons'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Improve', to: '/improve' },
  { label: 'Learn', to: '/learn' },
  { label: 'Examples', to: '/examples' },
  { label: 'Quiz', to: '/quiz' },
]

export function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Auto-close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!dropdownOpen) return

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [dropdownOpen])

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false)
  }, [pathname])

  const handleSignIn = () => {
    navigate('/signin')
  }

  const handleSignOut = async () => {
    setDropdownOpen(false)
    await signOut()
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="fixed top-0 inset-x-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <BrandLogo className="w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-105 transition-transform duration-200" />
            <span className="font-serif-title font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg tracking-tight">
              Prompt<span className="text-[#165efc] dark:text-[#50a2ff]">Wise</span>
            </span>
          </Link>
        </div>

        {/* Primary Desktop Navigation Bar (Editorial Workbench Pills) */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 shadow-2xs">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all select-none ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold shadow-2xs border border-slate-200/80 dark:border-slate-700/80'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-800/40'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Section: Feedback, Theme Toggle, Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick Feedback Link (Desktop) */}
          <Link
            to="/feedback"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:border-slate-800 transition-colors"
            title="Student Feedback Form"
          >
            <IconMessageSquare size={14} />
            <span>Feedback</span>
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Guest Auth & More Options */}
          {!loading && !user && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSignIn}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-mono font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 shadow-2xs cursor-pointer min-h-[34px]"
              >
                <IconLogIn size={14} />
                <span>Sign in</span>
              </button>

              {/* Guest Menu Popover */}
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center"
                  aria-label="More navigation options"
                  title="More Options"
                >
                  <IconMoreVertical size={16} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-11 w-56 bg-white dark:bg-slate-900 rounded-xl py-1.5 shadow-xl border border-slate-200 dark:border-slate-800"
                    >
                      <Link
                        to="/about"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 font-mono transition-colors"
                      >
                        <IconGraduationCap size={15} className="text-slate-400" />
                        <span>About PromptWise</span>
                      </Link>
                      <Link
                        to="/learn#responsible-ai"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 font-mono transition-colors"
                      >
                        <IconShield size={15} className="text-slate-400" />
                        <span>Responsible AI</span>
                      </Link>
                      <Link
                        to="/feedback"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 font-mono transition-colors"
                      >
                        <IconMessageSquare size={15} className="text-slate-400" />
                        <span>Send Feedback</span>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Signed-in User Menu */}
          {!loading && user && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                aria-expanded={dropdownOpen}
              >
                <UserAvatar
                  photoURL={user.photoURL}
                  name={user.displayName}
                  email={user.email}
                  sizeClassName="w-6 h-6 sm:w-7 sm:h-7"
                  roundedClassName="rounded-md"
                  className="border border-blue-500/30"
                />
                <span className="hidden sm:inline-block text-xs font-mono font-medium text-slate-800 dark:text-slate-200 max-w-[90px] truncate">
                  {user.displayName?.split(' ')[0]}
                </span>
                <IconChevronDown
                  size={13}
                  className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-11 w-64 bg-white dark:bg-slate-900 rounded-xl py-2 shadow-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800"
                  >
                    <div className="px-3 py-2 flex items-center gap-3">
                      <UserAvatar
                        photoURL={user.photoURL}
                        name={user.displayName}
                        email={user.email}
                        sizeClassName="w-8 h-8"
                        roundedClassName="rounded-md"
                        className="border border-blue-500/30"
                      />
                      <div className="overflow-hidden min-w-0 flex-1">
                        <p className="text-slate-900 dark:text-slate-100 text-xs font-semibold font-mono truncate">
                          {user.displayName || 'Student'}
                        </p>
                        <p className="text-slate-400 text-[11px] font-mono truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 font-mono transition-colors"
                      >
                        <IconLayoutDashboard size={14} className="text-slate-400" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/history"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 font-mono transition-colors"
                      >
                        <IconHistory size={14} className="text-slate-400" />
                        <span>Prompt History</span>
                      </Link>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/about"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 font-mono transition-colors"
                      >
                        <IconGraduationCap size={14} className="text-slate-400" />
                        <span>About PromptWise</span>
                      </Link>
                      <Link
                        to="/learn#responsible-ai"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 font-mono transition-colors"
                      >
                        <IconShield size={14} className="text-slate-400" />
                        <span>Responsible AI</span>
                      </Link>
                      <Link
                        to="/feedback"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 font-mono transition-colors"
                      >
                        <IconMessageSquare size={14} className="text-slate-400" />
                        <span>Send Feedback</span>
                      </Link>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/[0.08] font-mono transition-colors cursor-pointer"
                      >
                        <IconLogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  )
}
