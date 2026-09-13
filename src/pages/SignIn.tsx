import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { signInWithGoogle } from '../lib/auth'
import { BrandLogo } from '../components/ui/BrandLogo'
import { Spinner } from '../components/ui/Spinner'

const BENEFITS = [
  {
    icon: '✨',
    title: 'Auto-Save Prompt History',
    desc: 'Every improved prompt is automatically saved to your personal history.',
  },
  {
    icon: '🔖',
    title: 'Bookmark Your Best Prompts',
    desc: 'Pin the prompts that worked great and revisit them anytime.',
  },
  {
    icon: '🧠',
    title: 'Track Quiz & Practice Scores',
    desc: 'See your prompt engineering skill improve over time with tracked scores.',
  },
  {
    icon: '📊',
    title: 'Personal Dashboard',
    desc: 'A beautiful dashboard showing your stats, activity, and saved prompts.',
  },
]

export function SignIn() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if already signed in
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  const handleSignIn = async () => {
    setSigningIn(true)
    setError(null)
    try {
      await signInWithGoogle()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error('Sign in failed:', err)
      setError('Sign in failed. Please try again.')
      setSigningIn(false)
    }
  }

  // While Firebase is checking auth state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    )
  }

  // Already signed in → redirect handled by useEffect, show nothing
  if (user) return null

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BrandLogo className="w-14 h-14" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
            Unlock the full<br />
            <span className="text-indigo-600 dark:text-indigo-400">PromptWise</span> experience
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Sign in with Google to save your progress and access all features.
          </p>
        </div>

        {/* Benefit Cards */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {BENEFITS.map((b) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-2xl p-4 shadow-sm"
            >
              <span className="text-2xl block mb-2">{b.icon}</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">{b.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Sign In Button */}
        <button
          onClick={handleSignIn}
          disabled={signingIn}
          className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-60 text-white font-semibold px-6 py-3.5 rounded-2xl transition-all duration-200 shadow-xl shadow-indigo-500/30 cursor-pointer min-h-[52px]"
        >
          {signingIn ? (
            <>
              <Spinner size="sm" />
              <span>Signing in…</span>
            </>
          ) : (
            <>
              {/* Google "G" icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Skip */}
        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/improve')}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            Continue without signing in →
          </button>
        </div>
      </motion.div>
    </div>
  )
}
