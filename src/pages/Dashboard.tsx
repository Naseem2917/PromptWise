import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { getUserPrompts, toggleSavePrompt, getPracticeCount, getLatestQuizScore } from '../lib/db'
import type { PromptRecord } from '../lib/db'
import { Spinner } from '../components/ui/Spinner'
import { Card } from '../components/ui/Card'

function StatCard({ value, label, icon }: { value: number | string; label: string; icon: string }) {
  return (
    <Card className="flex items-center gap-4 shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-2xl shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{value}</p>
        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{label}</p>
      </div>
    </Card>
  )
}

function PromptCard({
  prompt,
  onToggleSave,
}: {
  prompt: PromptRecord
  onToggleSave: (id: string, saved: boolean) => void
}) {
  const [saving, setSaving] = useState(false)

  const handleToggle = async () => {
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
    <Card className="flex flex-col justify-between hover:border-indigo-500/30 transition-colors shadow-sm">
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
            className="text-lg cursor-pointer disabled:opacity-50 transition-transform duration-200 hover:scale-110"
          >
            {prompt.saved ? '🔖' : '📌'}
          </button>
        </div>
        <p className="text-slate-800 dark:text-slate-200 text-sm font-medium line-clamp-2 mb-2">{prompt.originalPrompt}</p>
        <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-3 font-mono bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] p-2.5 rounded-lg">
          {prompt.improvedPrompt}
        </p>
      </div>
    </Card>
  )
}

export function Dashboard() {
  const { user } = useAuth()
  const [prompts, setPrompts] = useState<PromptRecord[]>([])
  const [practiceCount, setPracticeCount] = useState<number>(0)
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

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

  const handleToggleSave = (id: string, saved: boolean) => {
    setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, saved } : p)))
  }

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
          <img
            src={user.photoURL ?? ''}
            alt={user.displayName ?? ''}
            className="w-14 h-14 rounded-2xl border-2 border-indigo-500/30"
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
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No prompts yet</h3>
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
                <h2 className="text-lg font-bold text-slate-200 mb-4">🔖 Saved Prompts</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {saved.slice(0, 4).map((p) => (
                    <PromptCard key={p.id} prompt={p} onToggleSave={handleToggleSave} />
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
                <h2 className="text-lg font-bold text-slate-200">🕐 Recent Prompts</h2>
                <Link to="/history" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                  View all →
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {prompts.slice(0, 6).map((p) => (
                  <PromptCard key={p.id} prompt={p} onToggleSave={handleToggleSave} />
                ))}
              </div>
            </motion.section>
          </>
        )}
      </div>
    </div>
  )
}
