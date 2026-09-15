import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { getAllFeedback, deleteFeedback } from '../lib/db'
import type { AdminFeedbackRecord } from '../lib/db'
import { Spinner } from '../components/ui/Spinner'
import { Timestamp } from 'firebase/firestore'

// ── Constants ─────────────────────────────────────────────────────────────────

const ADMIN_EMAIL = 'khannaseem1704@gmail.com'

const FEEDBACK_CATEGORIES = [
  'All',
  'Prompt Quality & AI Results',
  'General Feedback',
  'Feature Request',
  'Bug Report',
  'Design & Usability',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(ts: Timestamp | null): string {
  if (!ts) return '—'
  return new Date(ts.seconds * 1000).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function RatingBadge({ rating }: { rating?: 'up' | 'down' | number | string }) {
  if (rating === 'up') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
        👍 Helpful (Yes)
      </span>
    )
  }
  if (rating === 'down') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25">
        👎 Needs Improvement (No)
      </span>
    )
  }
  const n = typeof rating === 'number' ? rating : parseInt(String(rating ?? '0'), 10)
  if (!n || isNaN(n)) return <span className="text-slate-400 text-xs">—</span>
  return (
    <span className="text-amber-400 text-sm font-medium tracking-wide">
      {'★'.repeat(Math.min(n, 5))}{'☆'.repeat(Math.max(0, 5 - n))}
    </span>
  )
}

function CategoryBadge({ category }: { category?: string }) {
  if (!category) return null
  const colors: Record<string, string> = {
    'Bug Report': 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
    'Feature Request': 'bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-500/20',
    'Prompt Quality & AI Results': 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
    'Design & Usability': 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    'General Feedback': 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10',
  }
  return (
    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${colors[category] ?? colors['General Feedback']}`}>
      {category}
    </span>
  )
}

// ── Admin Panel ───────────────────────────────────────────────────────────────

export function Admin() {
  const { user, loading: authLoading } = useAuth()

  // Feedback data state (strictly feedback only for privacy)
  const [feedback, setFeedback] = useState<AdminFeedbackRecord[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState<string | null>(null)

  // Filter
  const [categoryFilter, setCategoryFilter] = useState('All')

  // Multi-delete selection state
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isMultiDeleting, setIsMultiDeleting] = useState(false)

  const isAdmin = !authLoading && !!user && user.email === ADMIN_EMAIL

  // Load feedback once confirmed as admin
  useEffect(() => {
    if (!isAdmin) return
    setDataLoading(true)
    setDataError(null)
    getAllFeedback()
      .then((fb) => setFeedback(fb))
      .catch((e) => setDataError((e as Error).message))
      .finally(() => setDataLoading(false))
  }, [isAdmin])

  const handleDeleteFeedback = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to permanently delete this feedback?')
    if (!confirmed) return
    try {
      await deleteFeedback(id)
      setFeedback((prev) => prev.filter((f) => f.id !== id))
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    } catch (err) {
      console.error('Failed to delete feedback:', err)
      alert('Failed to delete feedback. Please try again.')
    }
  }

  const toggleSelectFeedback = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = (visibleIds: string[]) => {
    if (visibleIds.every((id) => selectedIds.has(id))) {
      // Deselect all visible
      setSelectedIds((prev) => {
        const next = new Set(prev)
        visibleIds.forEach((id) => next.delete(id))
        return next
      })
    } else {
      // Select all visible
      setSelectedIds((prev) => {
        const next = new Set(prev)
        visibleIds.forEach((id) => next.add(id))
        return next
      })
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    const count = selectedIds.size
    const confirmed = window.confirm(`Are you sure you want to permanently delete ${count} selected feedback ${count === 1 ? 'entry' : 'entries'}?`)
    if (!confirmed) return

    setIsMultiDeleting(true)
    try {
      await Promise.all(Array.from(selectedIds).map((id) => deleteFeedback(id)))
      setFeedback((prev) => prev.filter((f) => !selectedIds.has(f.id)))
      setSelectedIds(new Set())
    } catch (err) {
      console.error('Failed to delete selected feedbacks:', err)
      alert('Failed to delete some feedbacks. Please try again.')
    } finally {
      setIsMultiDeleting(false)
    }
  }

  // ── Auth loading ──────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    )
  }

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center pt-24 text-center px-4">
        <div>
          <p className="text-4xl mb-4">🔐</p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-2">Please sign in</h2>
          <p className="text-slate-500 dark:text-slate-400">Admin access requires authentication.</p>
        </div>
      </div>
    )
  }

  // ── Wrong email ───────────────────────────────────────────────────────────
  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex-1 flex items-center justify-center pt-24 text-center px-4">
        <div>
          <p className="text-4xl mb-4">🚫</p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-2">Access Denied</h2>
          <p className="text-slate-500 dark:text-slate-400">This page is restricted to the PromptWise administrator.</p>
        </div>
      </div>
    )
  }

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalCount = feedback.length
  const positiveVotes = feedback.filter(
    (f) => f.rating === 'up' || (typeof f.rating === 'number' && f.rating >= 4)
  ).length
  const negativeVotes = feedback.filter(
    (f) => f.rating === 'down' || (typeof f.rating === 'number' && f.rating <= 2)
  ).length

  const starFeedbacks = feedback.filter(
    (f) => typeof f.rating === 'number' || (!isNaN(parseInt(String(f.rating), 10)) && f.rating !== 'up' && f.rating !== 'down')
  )
  const avgRating = starFeedbacks.length > 0
    ? (starFeedbacks.reduce((sum, f) => sum + (typeof f.rating === 'number' ? f.rating : parseInt(String(f.rating), 10) || 0), 0) / starFeedbacks.length).toFixed(1)
    : null

  const filteredFeedback = categoryFilter === 'All'
    ? feedback
    : feedback.filter((f) => f.category === categoryFilter)

  // ── Admin Panel UI ────────────────────────────────────────────────────────
  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
          🔐 Admin Feedback Center
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">User Feedback & Insights</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Strictly user feedback data · Signed in as <span className="font-semibold text-slate-700 dark:text-slate-300">{user.email}</span>
        </p>
      </motion.div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '💬', label: 'Total Feedback', value: totalCount, color: 'text-slate-900 dark:text-white' },
          { icon: '👍', label: 'Helpful Votes', value: positiveVotes, color: 'text-emerald-600 dark:text-emerald-400' },
          { icon: '👎', label: 'Needs Improvement', value: negativeVotes, color: 'text-red-600 dark:text-red-400' },
          { icon: '⭐', label: 'Avg Star Rating', value: avgRating ? `${avgRating} / 5` : '—', color: 'text-amber-500' },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category filter chips & Bulk Action Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div className="flex flex-wrap gap-2">
          {FEEDBACK_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer font-medium min-h-[32px] ${
                categoryFilter === cat
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:border-indigo-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {filteredFeedback.length > 0 && (
            <button
              onClick={() => {
                if (selectMode) {
                  setSelectMode(false)
                  setSelectedIds(new Set())
                } else {
                  setSelectMode(true)
                }
              }}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectMode
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                  : 'bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <span>{selectMode ? '✕ Cancel' : '☑️ Select'}</span>
            </button>
          )}

          {selectMode && filteredFeedback.length > 0 && (
            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filteredFeedback.length > 0 && filteredFeedback.every((f) => selectedIds.has(f.id))}
                onChange={() => toggleSelectAll(filteredFeedback.map((f) => f.id))}
                className="w-3.5 h-3.5 rounded accent-indigo-600 cursor-pointer"
              />
              <span>Select All</span>
            </label>
          )}

          {selectMode && selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={isMultiDeleting}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>🗑️</span>
              <span>{isMultiDeleting ? 'Deleting…' : `Delete Selected (${selectedIds.size})`}</span>
            </button>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredFeedback.length}</span> responses
          </p>
        </div>
      </div>

      {/* Data loading / error */}
      {dataLoading && (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      )}
      {dataError && (
        <div className="glass-card rounded-2xl p-6 text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-slate-700 dark:text-slate-300 font-semibold mb-1">Failed to load feedback</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{dataError}</p>
        </div>
      )}

      {/* Feedback Feed */}
      {!dataLoading && !dataError && (
        filteredFeedback.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">No feedback found in this category.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedback.map((f) => {
              const isSelected = selectedIds.has(f.id)
              return (
                <div key={f.id} className={`glass-card rounded-2xl p-5 shadow-sm border transition-colors ${isSelected ? 'border-indigo-500/50 bg-indigo-500/[0.03]' : 'border-slate-200/80 dark:border-white/[0.06]'}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      {selectMode && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectFeedback(f.id)}
                          className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                          title="Select this feedback"
                        />
                      )}
                      <RatingBadge rating={f.rating} />
                      <CategoryBadge category={f.category} />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-400">{formatDate(f.createdAt)}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteFeedback(f.id)}
                        className="text-sm text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10"
                        title="Delete feedback entry"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                {/* Feedback comment / message */}
                {f.message && (
                  <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed mb-3 font-medium">
                    "{f.message}"
                  </p>
                )}

                {/* Prompt Context Box */}
                {(f.originalPrompt || f.improvedPrompt) && (
                  <div className="space-y-3 mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                    {f.originalPrompt && (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            User Prompt
                          </p>
                          <button
                            onClick={() => navigator.clipboard.writeText(f.originalPrompt || '')}
                            className="text-[11px] text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer font-medium"
                          >
                            📋 Copy
                          </button>
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap break-words leading-relaxed select-text">
                          {f.originalPrompt}
                        </p>
                      </div>
                    )}
                    {f.improvedPrompt && (
                      <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/[0.05] border border-indigo-200/60 dark:border-indigo-500/10">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            Improved Output Shown
                          </p>
                          <button
                            onClick={() => navigator.clipboard.writeText(f.improvedPrompt || '')}
                            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium"
                          >
                            📋 Copy
                          </button>
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap break-words leading-relaxed select-text max-h-[500px] overflow-y-auto">
                          {f.improvedPrompt}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {f.email && (
                  <div className="mt-3 pt-2 text-xs text-slate-400 border-t border-slate-100 dark:border-white/[0.04]">
                    Author: <a href={`mailto:${f.email}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{f.email}</a>
                  </div>
                )}
              </div>
            )
          })}
          </div>
        )
      )}
    </div>
  )
}
