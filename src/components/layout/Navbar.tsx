import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { signOut } from '../../lib/auth'
import { ThemeToggle } from '../ui/ThemeToggle'
import { BrandLogo } from '../ui/BrandLogo'
import { UserAvatar } from '../ui/UserAvatar'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Improve', to: '/improve' },
  { label: 'Learn', to: '/learn' },
  { label: 'Examples', to: '/examples' },
  { label: 'Practice', to: '/practice' },
  { label: 'Quiz', to: '/quiz' },
]

export function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignIn = () => {
    navigate('/signin')
  }

  const handleSignOut = async () => {
    setDropdownOpen(false)
    await signOut()
  }

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 inset-x-0 z-50 border-b border-slate-200/80 dark:border-white/[0.06] bg-white/85 dark:bg-[#080812]/85 backdrop-blur-xl transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0 group">
          <BrandLogo className="w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-105 transition-transform duration-200" />
          <span className="font-bold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">
            {/* Only show "PW" on ultra-narrow screens (< 350px) where space is genuinely scarce */}
            <span className="inline min-[350px]:hidden">
              P<span className="text-indigo-600 dark:text-indigo-400">W</span>
            </span>
            {/* Show full "PromptWise" whenever there is room (>= 350px) */}
            <span className="hidden min-[350px]:inline">
              Prompt<span className="text-indigo-600 dark:text-indigo-400">Wise</span>
            </span>
          </span>
        </Link>

        {/* Nav links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors ${
                pathname === link.to
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Area: Theme Toggle + Feedback + Auth + Mobile Hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <Link
            to="/feedback"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10"
            title="Send Feedback"
          >
            <span>💬</span>
            <span className="hidden lg:inline">Feedback</span>
          </Link>

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {!loading && !user && (
            <button
              onClick={handleSignIn}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs sm:text-sm font-semibold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all duration-200 shadow-sm cursor-pointer min-h-[36px] sm:min-h-[44px] shrink-0"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Sign in</span>
            </button>
          )}

          {!loading && user && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 cursor-pointer p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
                aria-expanded={dropdownOpen}
              >
                <UserAvatar
                  photoURL={user.photoURL}
                  name={user.displayName}
                  email={user.email}
                  sizeClassName="w-7 h-7 sm:w-8 sm:h-8"
                  roundedClassName="rounded-full"
                  className="border-2 border-indigo-500/40"
                />
                <span className="hidden sm:block text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium max-w-[80px] sm:max-w-[100px] truncate">
                  {user.displayName?.split(' ')[0]}
                </span>
                <svg className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-56 bg-white dark:bg-[#131B2E] rounded-2xl py-2 shadow-2xl shadow-black/20 dark:shadow-black/60 border border-slate-200 dark:border-white/[0.08]"
                  >
                    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 dark:border-white/[0.06] mb-1">
                      <UserAvatar
                        photoURL={user.photoURL}
                        name={user.displayName}
                        email={user.email}
                        sizeClassName="w-9 h-9"
                        roundedClassName="rounded-full"
                        className="border border-indigo-500/30"
                      />
                      <div className="overflow-hidden min-w-0 flex-1">
                        <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold truncate">{user.displayName || 'User'}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors"
                    >
                      📊 Dashboard
                    </Link>
                    <Link
                      to="/history"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors"
                    >
                      🕐 My Prompts
                    </Link>
                    <Link
                      to="/responsible-ai"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors"
                    >
                      🌱 Responsible AI
                    </Link>
                    <Link
                      to="/about"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors"
                    >
                      🎓 About CEP
                    </Link>
                    <Link
                      to="/feedback"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors"
                    >
                      💬 Feedback
                    </Link>
                    <div className="border-t border-slate-100 dark:border-white/[0.06] mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/[0.06] transition-colors cursor-pointer"
                      >
                        ← Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10"
            aria-label="Toggle navigation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#090914] px-4 py-4 space-y-1 shadow-xl max-h-[80vh] overflow-y-auto"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                  pathname === link.to
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                >
                  📊 Dashboard
                </Link>
                <Link
                  to="/history"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                >
                  🕐 Prompt History
                </Link>
              </>
            )}
            <Link
              to="/responsible-ai"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
            >
              🌱 Responsible AI
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
            >
              🎓 About CEP
            </Link>
            <Link
              to="/feedback"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
            >
              💬 Feedback
            </Link>
            {!user && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleSignIn()
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-xl shadow-xs cursor-pointer"
                >
                  Sign in with Google
                </button>
              </div>
            )}
            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between px-3 py-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Theme</span>
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
