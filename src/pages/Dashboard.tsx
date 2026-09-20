import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { getUserPrompts, toggleSavePrompt, deletePrompt, getPracticeCount, getLatestQuizScore } from '../lib/db'
import type { PromptRecord } from '../lib/db'
import { Spinner } from '../components/ui/Spinner'
import { UserAvatar } from '../components/ui/UserAvatar'
import { ChatbotToolbar } from '../components/ui/ChatbotToolbar'
import {
  IconBookmark,
  IconBookmarkFilled,
  IconTrash,
  IconCopy,
  IconCheck,
  IconX,
  IconSparkles,
  IconHistory,
  IconArrowRight,
  IconLock,
  IconLogIn,
} from '../components/ui/Icons'

// ── Stat Metric ───────────────────────────────────────────────────────────────

function StatMetric({
  value,
  label,
  sublabel,
}: {
  value: number | string
  label: string
  sublabel?: string
}) {
  return (
    <div className="workbench-card p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
      <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5 mt-1">
        <p className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 dark:text-slate-100">
          {value}
        </p>
        {sublabel && (
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{sublabel}</span>
        )}
      </div>
    </div>
  )
}

// ── Prompt Detail Modal ────────────────────────────────────────────────────────

function PromptDetailModal({
  prompt,
  onClose,
  onToggleSave,
  onDelete,
}: {
  prompt: PromptRecord
  onClose: () => void
  onToggleSave: (id: string, saved: boolean) => void
  onDelete: (id: string) => Promise<void>
}) {
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const date = prompt.createdAt
    ? new Date((prompt.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
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
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{date}</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-500/10 text-cobalt-700 dark:text-cobalt-300 border border-blue-500/25 font-semibold">
              Score {prompt.scoreBefore} → {prompt.scoreAfter}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggle}
              disabled={saving}
              title={prompt.saved ? 'Remove bookmark' : 'Bookmark prompt'}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {prompt.saved ? (
                <IconBookmarkFilled size={18} className="text-ochre-600 dark:text-ochre-400" />
              ) : (
                <IconBookmark size={18} />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <IconX size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Original Prompt */}
          <div className="rounded-xl bg-ochre-500/[0.04] dark:bg-ochre-500/[0.06] border border-ochre-500/30 p-4 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-ochre-500 shrink-0" />
              <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ochre-700 dark:text-ochre-400">
                Original Prompt
              </p>
            </div>
            <p className="font-mono-code text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed break-words">
              {prompt.originalPrompt}
            </p>
          </div>

          {/* Improved Prompt */}
          <div className="rounded-xl bg-sage-500/[0.04] dark:bg-sage-500/[0.06] border border-sage-500/35 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-500 shrink-0" />
                <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-sage-700 dark:text-sage-400">
                  Improved Prompt
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
              >
                {copied ? (
                  <>
                    <IconCheck size={12} className="text-sage-600 dark:text-sage-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <IconCopy size={12} />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>
            <pre className="font-mono-code text-xs sm:text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950/80 p-3.5 rounded-lg border border-sage-500/25 whitespace-pre-wrap break-words leading-relaxed">
              {prompt.improvedPrompt}
            </pre>
          </div>

          {/* Quick Chatbot Launch Toolbar */}
          <ChatbotToolbar prompt={prompt.improvedPrompt} className="pt-2" />

          {/* Modal Footer with Delete */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={async () => {
                setDeleting(true)
                await onDelete(prompt.id)
                setDeleting(false)
              }}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold text-ochre-700 dark:text-ochre-400 hover:bg-ochre-500/10 border border-ochre-500/25 transition-colors cursor-pointer disabled:opacity-50 min-h-[34px]"
            >
              <IconTrash size={14} />
              <span>{deleting ? 'Deleting…' : 'Delete Prompt'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer min-h-[34px]"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Prompt Record Card ────────────────────────────────────────────────────────

function PromptCard({
  prompt,
  onToggleSave,
  onDelete,
  onClick,
}: {
  prompt: PromptRecord
  onToggleSave: (id: string, saved: boolean) => void
  onDelete: (id: string) => Promise<void>
  onClick: () => void
}) {
  const [saving, setSaving] = useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setSaving(true)
    await toggleSavePrompt(prompt.id, !prompt.saved)
    onToggleSave(prompt.id, !prompt.saved)
    setSaving(false)
  }

  const date = prompt.createdAt
    ? new Date((prompt.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Just now'

  return (
    <div
      className="workbench-card p-5 sm:p-6 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs cursor-pointer group"
      onClick={onClick}
    >
      <div>
        {/* Top bar: date, score, actions */}
        <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{date}</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-500/10 text-cobalt-700 dark:text-cobalt-300 border border-blue-500/25 font-semibold">
              Score {prompt.scoreBefore} → {prompt.scoreAfter}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleToggle}
              disabled={saving}
              title={prompt.saved ? 'Remove bookmark' : 'Bookmark'}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              {prompt.saved ? (
                <IconBookmarkFilled size={16} className="text-ochre-600 dark:text-ochre-400" />
              ) : (
                <IconBookmark size={16} />
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(prompt.id)
              }}
              title="Delete prompt"
              className="p-1.5 rounded-md text-slate-400 hover:text-ochre-600 dark:hover:text-ochre-400 transition-colors cursor-pointer"
            >
              <IconTrash size={16} />
            </button>
          </div>
        </div>

        {/* Draft text preview */}
        <p className="font-mono-code text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium line-clamp-2 break-words mb-2.5">
          "{prompt.originalPrompt}"
        </p>

        {/* Improved preview */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 p-3 rounded-xl">
          <p className="font-mono-code text-xs text-slate-600 dark:text-slate-400 line-clamp-2 break-words leading-relaxed">
            {prompt.improvedPrompt}
          </p>
        </div>
      </div>

      <div className="pt-3 flex items-center justify-end text-[11px] font-mono text-cobalt-600 dark:text-cobalt-400 group-hover:underline">
        <span>View details →</span>
      </div>
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
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
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
    toggleSavePrompt(id, saved).catch(console.error)
    setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, saved } : p)))
    setExpandedPrompt((prev) => (prev?.id === id ? { ...prev, saved } : prev))
  }, [])

  const handleDeletePrompt = useCallback(
    async (id: string) => {
      if (!user) return
      const confirmed = window.confirm(
        'Are you sure you want to delete this prompt from your history?',
      )
      if (!confirmed) return
      try {
        await deletePrompt(id, user.uid)
        setPrompts((prev) => prev.filter((p) => p.id !== id))
        setExpandedPrompt((prev) => (prev?.id === id ? null : prev))
      } catch (err) {
        console.error('Failed to delete prompt:', err)
        alert('Failed to delete prompt. Please try again.')
      }
    },
    [user],
  )

  if (!user) {
    return (
      <div className="flex-1 max-w-xl mx-auto px-4 sm:px-6 py-20 text-center space-y-4 w-full">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-cobalt-600 dark:text-cobalt-400 mx-auto">
          <IconLock size={22} />
        </div>
        <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Sign In to Access Your Workspace
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
          Your improved prompt history, saved prompts, and quiz scores are securely synchronized when signed in.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/signin"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs sm:text-sm font-semibold transition-colors shadow-xs inline-flex items-center justify-center gap-2 min-h-[42px]"
          >
            <IconLogIn size={15} />
            <span>Sign In to PromptWise</span>
          </Link>
          <Link
            to="/improve"
            className="group/btn w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-mono text-xs sm:text-sm font-semibold transition-colors shadow-2xs inline-flex items-center justify-center gap-1.5 min-h-[42px]"
          >
            <span>Try Prompt Improvement</span>
            <IconArrowRight size={13} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    )
  }

  const saved = prompts.filter((p) => p.saved)

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-center gap-4">
          <UserAvatar
            photoURL={user.photoURL}
            name={user.displayName}
            email={user.email}
            sizeClassName="w-12 h-12"
            textClassName="text-base font-bold font-mono"
            roundedClassName="rounded-xl"
            className="border border-slate-200 dark:border-slate-800 shadow-2xs"
          />
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-cobalt-600 dark:text-cobalt-400 block mb-0.5">
              Personal Workspace
            </span>
            <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              {user.displayName?.split(' ')[0] || 'User'}'s Dashboard
            </h1>
          </div>
        </div>

        <Link
          to="/improve"
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5 min-h-[36px]"
        >
          <IconSparkles size={14} />
          <span>Improve a Prompt</span>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10"
      >
        <StatMetric value={prompts.length} label="Total Improved" sublabel="prompts" />
        <StatMetric value={practiceCount} label="Exercises" sublabel="finished" />
        <StatMetric
          value={quizScore !== null ? `${quizScore}%` : '—'}
          label="Quiz Score"
          sublabel="latest"
        />
        <StatMetric value={saved.length} label="Saved" sublabel="prompts" />
      </motion.div>

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && prompts.length === 0 && (
        <div className="workbench-card text-center py-16 px-4 shadow-2xs space-y-3 max-w-lg mx-auto">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <IconHistory size={20} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No saved prompts yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
            Improve your first prompt to see your before-and-after history, score improvements, and export options here.
          </p>
          <div className="pt-2">
            <Link
              to="/improve"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold transition-colors shadow-xs"
            >
              <IconSparkles size={13} />
              <span>Improve a Prompt</span>
            </Link>
          </div>
        </div>
      )}

      {!loading && prompts.length > 0 && (
        <div className="space-y-10">
          {/* Saved Prompts */}
          {saved.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <IconBookmarkFilled size={16} className="text-ochre-600 dark:text-ochre-400" />
                <h2 className="font-serif-title text-xl font-bold text-slate-900 dark:text-slate-100">
                  Saved Prompts ({saved.length})
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {saved.slice(0, 4).map((p) => (
                  <PromptCard
                    key={p.id}
                    prompt={p}
                    onToggleSave={handleToggleSave}
                    onDelete={handleDeletePrompt}
                    onClick={() => setExpandedPrompt(p)}
                  />
                ))}
              </div>
            </motion.section>
          )}

          {/* Recent Prompts */}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IconHistory size={16} className="text-cobalt-600 dark:text-cobalt-400" />
                <h2 className="font-serif-title text-xl font-bold text-slate-900 dark:text-slate-100">
                  Recent Prompts
                </h2>
              </div>
              <Link
                to="/history"
                className="group/btn text-xs font-mono font-medium text-cobalt-600 dark:text-cobalt-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Full History ({prompts.length})</span>
                <IconArrowRight size={12} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {prompts.slice(0, 6).map((p) => (
                <PromptCard
                  key={p.id}
                  prompt={p}
                  onToggleSave={handleToggleSave}
                  onDelete={handleDeletePrompt}
                  onClick={() => setExpandedPrompt(p)}
                />
              ))}
            </div>
          </motion.section>
        </div>
      )}

      {/* Prompt Detail Modal */}
      <AnimatePresence>
        {expandedPrompt && (
          <PromptDetailModal
            prompt={expandedPrompt}
            onClose={() => setExpandedPrompt(null)}
            onToggleSave={handleToggleSave}
            onDelete={handleDeletePrompt}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
