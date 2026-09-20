import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { signInWithGoogle } from '../lib/auth'
import { BrandLogo } from '../components/ui/BrandLogo'
import { Spinner } from '../components/ui/Spinner'
import {
  IconHistory,
  IconBookmarkFilled,
  IconAward,
  IconSparkles,
  IconAlertCircle,
  IconArrowRight,
} from '../components/ui/Icons'

interface Benefit {
  icon: typeof IconHistory
  title: string
  desc: string
}

const BENEFITS: Benefit[] = [
  {
    icon: IconHistory,
    title: 'Persistent History',
    desc: 'Every improved prompt and refinement turn is safely archived for later reference.',
  },
  {
    icon: IconBookmarkFilled,
    title: 'Saved Prompts',
    desc: 'Save your best improved prompts for quick reference anytime.',
  },
  {
    icon: IconAward,
    title: 'Quiz Progress',
    desc: 'Track your quiz scores and see how your prompting skills improve over time.',
  },
  {
    icon: IconSparkles,
    title: 'Personal Workspace',
    desc: 'Access your full prompt history, quick exports, and saved prompts from anywhere.',
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
      setError('Google authentication was interrupted. Please try again.')
      setSigningIn(false)
    }
  }

  // While Firebase is checking auth state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Spinner size="xl" />
      </div>
    )
  }

  // Already signed in → redirect handled by useEffect, show nothing
  if (user) return null

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BrandLogo className="w-12 h-12" />
          </div>
          <span className="inline-block font-mono text-xs font-semibold uppercase tracking-wider text-cobalt-600 dark:text-cobalt-400 mb-1.5">
            PromptWise Account
          </span>
          <h1 className="font-serif-title text-2xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
            Access Your Workspace
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
            Sign in with Google to synchronize your prompt history, save improved prompts, and track quiz scores.
          </p>
        </div>

        {/* Benefit Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {BENEFITS.map((b) => {
            const Icon = b.icon
            return (
              <div
                key={b.title}
                className="workbench-card p-4 shadow-2xs space-y-1.5 flex flex-col justify-between"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-cobalt-600 dark:text-cobalt-400 flex items-center justify-center shrink-0 mb-1">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {b.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                    {b.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-ochre-500/[0.08] border border-ochre-500/30 text-ochre-900 dark:text-ochre-200 text-xs sm:text-sm flex items-center gap-2">
            <IconAlertCircle size={16} className="text-ochre-600 dark:text-ochre-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Sign In Action */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleSignIn}
            disabled={signingIn}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-60 text-white font-mono text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-xl transition-all duration-150 shadow-xs cursor-pointer min-h-[48px]"
          >
            {signingIn ? (
              <>
                <Spinner size="sm" />
                <span>Authenticating with Google…</span>
              </>
            ) : (
              <>
                {/* Official Google G SVG */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Anonymous Skip Option */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => navigate('/improve')}
              className="text-xs font-mono text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <span>Continue without signing in</span>
              <IconArrowRight size={12} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
