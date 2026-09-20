import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { getAllFeedback, deleteFeedback } from '../lib/db'
import type { AdminFeedbackRecord } from '../lib/db'
import { Spinner } from '../components/ui/Spinner'
import { Timestamp } from 'firebase/firestore'
import {
  IconLock,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconTrash,
  IconCopy,
  IconStar,
  IconCheckCircle,
  IconMessageSquare,
  IconShield,
  IconHistory,
} from '../components/ui/Icons'

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
      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-sage-500/15 text-sage-700 dark:text-sage-300 border border-sage-500/30">
        <IconCheck size={12} className="text-sage-600 dark:text-sage-400" />
        <span>Helpful</span>
      </span>
    )
  }
  if (rating === 'down') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-ochre-500/15 text-ochre-700 dark:text-ochre-300 border border-ochre-500/30">
        <IconX size={12} className="text-ochre-600 dark:text-ochre-400" />
        <span>Needs Work</span>
      </span>
    )
  }
  const n = typeof rating === 'number' ? rating : parseInt(String(rating ?? '0'), 10)
  if (!n || isNaN(n)) return <span className="text-slate-400 text-xs font-mono">—</span>
  return (
    <span className="text-amber-500 text-xs font-mono font-medium tracking-wide flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStar
          key={i}
          size={13}
          fill={i < n ? 'currentColor' : 'none'}
          className={i < n ? 'text-amber-500' : 'text-slate-300 dark:text-slate-700'}
        />
      ))}
    </span>
  )
}

function CategoryBadge({ category }: { category?: string }) {
  if (!category) return null
  const colors: Record<string, string> = {
    'Bug Report': 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/25',
    'Feature Request': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25',
    'Prompt Quality & AI Results': 'bg-cobalt-500/10 text-cobalt-700 dark:text-cobalt-400 border-cobalt-500/25',
    'Design & Usability': 'bg-ochre-500/10 text-ochre-700 dark:text-ochre-400 border-ochre-500/25',
    'General Feedback': 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  }
  return (
    <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${colors[category] ?? colors['General Feedback']}`}>
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
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const isAdmin = !authLoading && !!user && user.email === ADMIN_EMAIL

  // Load feedback once confirmed as admin
  useEffect(() => {
    if (!isAdmin) return
    let isMounted = true
    setDataLoading(true)
    setDataError(null)
    getAllFeedback()
      .then((fb) => {
        if (isMounted) setFeedback(fb)
      })
      .catch((e) => {
        if (isMounted) setDataError((e as Error).message)
      })
      .finally(() => {
        if (isMounted) setDataLoading(false)
      })
    return () => {
      isMounted = false
    }
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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  // ── Auth loading ──────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Spinner size="xl" />
      </div>
    )
  }

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center pt-24 text-center px-4">
        <div className="workbench-card p-8 rounded-2xl max-w-md shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-cobalt-600 dark:text-cobalt-400 flex items-center justify-center mx-auto mb-2">
            <IconLock size={22} />
          </div>
          <h2 className="text-2xl font-serif-title font-bold text-slate-900 dark:text-slate-100">Please Sign In</h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Admin access requires administrator authentication.</p>
        </div>
      </div>
    )
  }

  // ── Wrong email ───────────────────────────────────────────────────────────
  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex-1 flex items-center justify-center pt-24 text-center px-4">
        <div className="workbench-card p-8 rounded-2xl max-w-md shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-2">
            <IconAlertCircle size={22} />
          </div>
          <h2 className="text-2xl font-serif-title font-bold text-slate-900 dark:text-slate-100">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">This page is restricted to the PromptWise administrator.</p>
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
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-cobalt-700 dark:text-cobalt-300 text-xs font-mono font-semibold uppercase tracking-wider mb-3">
          <IconShield size={14} />
          <span>Admin Center</span>
        </div>
        <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          User Feedback
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-mono">
          Strictly user feedback data · Signed in as <span className="font-semibold text-slate-900 dark:text-slate-100">{user.email}</span>
        </p>
      </motion.div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          { Icon: IconMessageSquare, label: 'Total Feedback', value: totalCount, color: 'text-slate-900 dark:text-slate-100' },
          { Icon: IconCheckCircle, label: 'Helpful Votes', value: positiveVotes, color: 'text-sage-600 dark:text-sage-400' },
          { Icon: IconAlertCircle, label: 'Needs Work', value: negativeVotes, color: 'text-ochre-600 dark:text-ochre-400' },
          { Icon: IconStar, label: 'Avg Rating', value: avgRating ? `${avgRating} / 5` : '—', color: 'text-amber-500' },
        ].map((s) => {
          const StatIcon = s.Icon
          return (
            <div key={s.label} className="workbench-card rounded-xl p-4 shadow-2xs text-center">
              <div className="flex justify-center mb-1.5 text-slate-400 dark:text-slate-500">
                <StatIcon size={18} />
              </div>
              <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Category filter chips & Bulk Action Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div className="flex flex-wrap gap-2">
          {FEEDBACK_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer font-mono font-medium min-h-[32px] ${
                categoryFilter === cat
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs font-semibold'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
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
              className={`text-xs px-3 py-1.5 rounded-lg border font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 min-h-[32px] ${
                selectMode
                  ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30 text-cobalt-600 dark:text-cobalt-400'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <span>{selectMode ? 'Cancel' : 'Select'}</span>
            </button>
          )}

          {selectMode && filteredFeedback.length > 0 && (
            <label className="flex items-center gap-1.5 text-xs font-mono text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filteredFeedback.length > 0 && filteredFeedback.every((f) => selectedIds.has(f.id))}
                onChange={() => toggleSelectAll(filteredFeedback.map((f) => f.id))}
                className="w-3.5 h-3.5 rounded accent-blue-600 cursor-pointer"
              />
              <span>Select All</span>
            </label>
          )}

          {selectMode && selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={isMultiDeleting}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20 font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1.5 min-h-[32px]"
            >
              <IconTrash size={13} />
              <span>{isMultiDeleting ? 'Deleting…' : `Delete Selected (${selectedIds.size})`}</span>
            </button>
          )}

          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredFeedback.length}</span> responses
          </p>
        </div>
      </div>

      {/* Data loading / error */}
      {dataLoading && (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      )}
      {dataError && (
        <div className="workbench-card rounded-2xl p-6 text-center shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-full bg-ochre-500/10 text-ochre-600 dark:text-ochre-400 flex items-center justify-center mx-auto mb-1">
            <IconAlertCircle size={20} />
          </div>
          <p className="text-slate-900 dark:text-slate-100 font-semibold text-sm">Failed to load feedback</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs">{dataError}</p>
        </div>
      )}

      {/* Feedback Feed */}
      {!dataLoading && !dataError && (
        filteredFeedback.length === 0 ? (
          <div className="workbench-card rounded-2xl p-12 text-center shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-1">
              <IconHistory size={20} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">No feedback found in this category.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedback.map((f) => {
              const isSelected = selectedIds.has(f.id)
              return (
                <div
                  key={f.id}
                  className={`workbench-card rounded-xl p-5 shadow-2xs border transition-colors ${
                    isSelected ? 'border-cobalt-500/50 bg-cobalt-500/[0.03]' : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      {selectMode && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectFeedback(f.id)}
                          className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                          title="Select this feedback"
                        />
                      )}
                      <RatingBadge rating={f.rating} />
                      <CategoryBadge category={f.category} />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono text-slate-400">{formatDate(f.createdAt)}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteFeedback(f.id)}
                        className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10"
                        title="Delete feedback entry"
                      >
                        <IconTrash size={14} />
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
                    <div className="space-y-3 mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800">
                      {f.originalPrompt && (
                        <div className="p-3.5 rounded-xl bg-ochre-500/[0.04] dark:bg-ochre-500/[0.06] border border-ochre-500/25">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-ochre-700 dark:text-ochre-400">
                              Original Prompt
                            </p>
                            <button
                              onClick={() => handleCopy(f.originalPrompt || '', `orig-${f.id}`)}
                              className="text-[11px] font-mono text-slate-500 hover:text-cobalt-600 dark:hover:text-cobalt-400 cursor-pointer font-medium inline-flex items-center gap-1"
                            >
                              {copiedId === `orig-${f.id}` ? (
                                <>
                                  <IconCheck size={11} className="text-sage-600 dark:text-sage-400" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <IconCopy size={11} />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap break-words leading-relaxed select-text">
                            {f.originalPrompt}
                          </p>
                        </div>
                      )}
                      {f.improvedPrompt && (
                        <div className="p-3.5 rounded-xl bg-sage-500/[0.04] dark:bg-sage-500/[0.06] border border-sage-500/30">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-sage-700 dark:text-sage-400">
                              Improved Prompt
                            </p>
                            <button
                              onClick={() => handleCopy(f.improvedPrompt || '', `imp-${f.id}`)}
                              className="text-[11px] font-mono text-sage-700 dark:text-sage-300 hover:underline cursor-pointer font-medium inline-flex items-center gap-1"
                            >
                              {copiedId === `imp-${f.id}` ? (
                                <>
                                  <IconCheck size={11} className="text-sage-600 dark:text-sage-400" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <IconCopy size={11} />
                                  <span>Copy</span>
                                </>
                              )}
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
                    <div className="mt-3 pt-2 text-xs font-mono text-slate-400 border-t border-slate-200/80 dark:border-slate-800">
                      Author: <a href={`mailto:${f.email}`} className="text-cobalt-600 dark:text-cobalt-400 hover:underline">{f.email}</a>
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
