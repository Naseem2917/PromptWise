import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { getUserPrompts, toggleSavePrompt, getPracticeCount, getLatestQuizScore } from '../lib/db'
import type { PromptRecord } from '../lib/db'
import { Spinner } from '../components/ui/Spinner'
import { UserAvatar } from '../components/ui/UserAvatar'
import { cx } from '../lib/theme'

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ value, label, icon }: { value: number | string; label: string; icon: string }) {
  return (
    <div className="glass-card rounded-2xl p-6 flex items-center gap-4 shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-2xl shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{value}</p>
        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{label}</p>
      </div>
    </div>
  )
}

// ── Prompt Detail Modal ────────────────────────────────────────────────────────

function PromptDetailModal({
  prompt,
  onClose,
  onToggleSave,
}: {
  prompt: PromptRecord
  onClose: () => void
  onToggleSave: (id: string, saved: boolean) => void
}) {
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)

  const date = prompt.createdAt
    ? new Date((prompt.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : 'Just now'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.improvedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggle = async () => {
    setSaving(true)
    await toggleSavePrompt(prompt.id, !prompt.saved)
    onToggleSave(prompt.id, !prompt.saved)
    setSaving(false)
  }

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">{date}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/15 font-medium">
              {prompt.scoreBefore} → {prompt.scoreAfter}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggle}
              disabled={saving}
              title={prompt.saved ? 'Remove bookmark' : 'Bookmark'}
              className="text-lg cursor-pointer disabled:opacity-50 transition-transform hover:scale-110"
            >
              {prompt.saved ? '🔖' : '📌'}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Original Prompt */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Original Prompt
            </p>
            <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed break-words">
              {prompt.originalPrompt}
            </p>
          </div>

          {/* Improved Prompt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Improved Prompt
              </p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/20 transition-colors cursor-pointer font-medium"
              >
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            <pre className="text-slate-700 dark:text-slate-300 text-xs font-mono bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] p-4 rounded-xl whitespace-pre-wrap break-words leading-relaxed">
              {prompt.improvedPrompt}
            </pre>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Prompt Card ───────────────────────────────────────────────────────────────

function PromptCard({
  prompt,
  onToggleSave,
  onClick,
}: {
  prompt: PromptRecord
  onToggleSave: (id: string, saved: boolean) => void
  onClick: () => void
}) {
  const [saving, setSaving] = useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation() // don't open modal when clicking bookmark
    setSaving(true)
    await toggleSavePrompt(prompt.id, !prompt.saved)
    onToggleSave(prompt.id, !prompt.saved)
    setSaving(false)
  }

  const date = prompt.createdAt
    ? new Date((prompt.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : 'Just now'

  return (
    <div
      className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/30 transition-all shadow-sm cursor-pointer hover:shadow-md"
      onClick={onClick}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">{date}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/15 font-medium">
              {prompt.scoreBefore} → {prompt.scoreAfter}
            </span>
          </div>
          <button
            onClick={handleToggle}
            disabled={saving}
            title={prompt.saved ? 'Remove bookmark' : 'Bookmark'}
            className="text-lg cursor-pointer disabled:opacity-50 transition-transform duration-200 hover:scale-110 shrink-0"
          >
            {prompt.saved ? '🔖' : '📌'}
          </button>
        </div>
        {/* Original prompt — 2 line clamp */}
        <p className="text-slate-800 dark:text-slate-200 text-sm font-medium line-clamp-2 break-words mb-2">
          {prompt.originalPrompt}
        </p>
        {/* Improved prompt preview — 3 line clamp */}
        <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] p-3 rounded-xl">
          <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-3 break-words font-mono leading-relaxed">
            {prompt.improvedPrompt}
          </p>
        </div>
      </div>
      {/* Click hint */}
      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-right">Click to expand →</p>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function Dashboard() {
  const { user } = useAuth()
  const [prompts, setPrompts] = useState<PromptRecord[]>([])
  const [practiceCount, setPracticeCount] = useState<number>(0)
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedPrompt, setExpandedPrompt] = useState<PromptRecord | null>(null)

  useEffect(() => {
    if (!user) return
    Promise.all([
      getUserPrompts(user.uid),
      getPracticeCount(user.uid),
      getLatestQuizScore(user.uid),
    ])
      .then(([userPrompts, pCount, qScore]) => {
        setPrompts(userPrompts)
        setPracticeCount(pCount)
        setQuizScore(qScore)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  const handleToggleSave = useCallback((id: string, saved: boolean) => {
    setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, saved } : p)))
    // Also update modal if open
    setExpandedPrompt((prev) => prev?.id === id ? { ...prev, saved } : prev)
  }, [])

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center pt-24">
        <div className="text-center">
          <p className="text-4xl mb-4">🔐</p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-2">Sign in to view your Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400">Your prompt history and stats will appear here.</p>
        </div>
      </div>
    )
  }

  const saved = prompts.filter((p) => p.saved)

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
      <div>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-10"
        >
          <UserAvatar
            photoURL={user.photoURL}
            name={user.displayName}
            email={user.email}
            sizeClassName="w-14 h-14"
            textClassName="text-lg font-bold"
            roundedClassName="rounded-2xl"
            className="border-2 border-indigo-500/30 shadow-md shadow-indigo-500/10"
          />
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Welcome back, {user.displayName?.split(' ')[0]}! 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Here's your PromptWise progress</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10"
        >
          <StatCard value={prompts.length} label="Prompts Improved" icon="✨" />
          <StatCard value={practiceCount} label="Practice Completed" icon="🏋️" />
          <StatCard value={quizScore !== null ? `${quizScore}%` : '—'} label="Quiz Score" icon="🧠" />
          <StatCard value={saved.length} label="Saved Prompts" icon="🔖" />
        </motion.div>

        {loading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {!loading && prompts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📝</p>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No prompts yet</h3>
            <p className="text-slate-500 mb-6">Start improving your first prompt!</p>
            <Link
              to="/improve"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
            >
              ✨ Improve a Prompt
            </Link>
          </div>
        )}

        {!loading && prompts.length > 0 && (
          <>
            {/* Saved Prompts */}
            {saved.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-10"
              >
                <h2 className={`${cx.sectionHeading} mb-4`}>🔖 Saved Prompts</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {saved.slice(0, 4).map((p) => (
                    <PromptCard
                      key={p.id}
                      prompt={p}
                      onToggleSave={handleToggleSave}
                      onClick={() => setExpandedPrompt(p)}
                    />
                  ))}
                </div>
              </motion.section>
            )}

            {/* Recent Prompts */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className={cx.sectionHeading}>🕐 Recent Prompts</h2>
                <Link to="/history" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                  View all →
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {prompts.slice(0, 6).map((p) => (
                  <PromptCard
                    key={p.id}
                    prompt={p}
                    onToggleSave={handleToggleSave}
                    onClick={() => setExpandedPrompt(p)}
                  />
                ))}
              </div>
            </motion.section>
          </>
        )}
      </div>

      {/* Prompt Detail Modal */}
      <AnimatePresence>
        {expandedPrompt && (
          <PromptDetailModal
            prompt={expandedPrompt}
            onClose={() => setExpandedPrompt(null)}
            onToggleSave={handleToggleSave}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
