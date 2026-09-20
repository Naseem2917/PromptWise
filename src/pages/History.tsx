import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getUserPrompts, toggleSavePrompt, deletePrompt } from '../lib/db'
import type { PromptRecord } from '../lib/db'
import { Spinner } from '../components/ui/Spinner'
import { ChatbotToolbar } from '../components/ui/ChatbotToolbar'
import {
  IconBookmark,
  IconBookmarkFilled,
  IconTrash,
  IconCopy,
  IconCheck,
  IconChevronDown,
  IconHistory,
  IconSparkles,
  IconLock,
  IconLogIn,
  IconSearch,
  IconX,
  IconArrowRight,
} from '../components/ui/Icons'

export function History() {
  const { user } = useAuth()
  const [prompts, setPrompts] = useState<PromptRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window === 'undefined') return ''
    return sessionStorage.getItem('pw_history_search') || ''
  })
  const [filterSavedOnly, setFilterSavedOnly] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem('pw_history_saved_only') === 'true'
  })

  // Persist search filter state across navigation within session
  useEffect(() => {
    try {
      sessionStorage.setItem('pw_history_search', searchQuery)
      sessionStorage.setItem('pw_history_saved_only', String(filterSavedOnly))
    } catch {
      // ignore quota / private-mode error
    }
  }, [searchQuery, filterSavedOnly])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    getUserPrompts(user.uid)
      .then(setPrompts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  const handleToggleSave = async (id: string, saved: boolean) => {
    await toggleSavePrompt(id, !saved)
    setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, saved: !saved } : p)))
  }

  const handleDeletePrompt = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!user) return
    const confirmed = window.confirm(
      'Are you sure you want to delete this prompt from your history?',
    )
    if (!confirmed) return
    try {
      await deletePrompt(id, user.uid)
      setPrompts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error('Failed to delete prompt:', err)
      alert('Failed to delete prompt. Please try again.')
    }
  }

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!user) {
    return (
      <div className="flex-1 max-w-xl mx-auto px-4 sm:px-6 py-20 text-center space-y-4 w-full">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-cobalt-600 dark:text-cobalt-400 mx-auto">
          <IconLock size={22} />
        </div>
        <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Sign In to Access Your History
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
          Your prompt history and improved prompts will appear here after signing in.
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

  const filteredPrompts = prompts.filter((p) => {
    const matchFilter = !filterSavedOnly || p.saved
    const q = searchQuery.toLowerCase().trim()
    const matchSearch =
      !q ||
      p.originalPrompt.toLowerCase().includes(q) ||
      p.improvedPrompt.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-cobalt-600 dark:text-cobalt-400 block mb-1">
          Your Saved History
        </span>
        <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
          Prompt History
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
          Review, inspect, export, or reload prompts you have previously improved.
        </p>

        {/* Search & Filter bar if prompts exist */}
        {prompts.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:flex-1">
              <IconSearch
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter history by prompt keywords…"
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-cobalt-600 focus:ring-2 focus:ring-cobalt-500/20 transition-all shadow-2xs min-h-[38px]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  aria-label="Clear filter"
                >
                  <IconX size={13} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setFilterSavedOnly(!filterSavedOnly)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer min-h-[38px] inline-flex items-center gap-1.5 shadow-2xs shrink-0 select-none ${
                filterSavedOnly
                  ? 'bg-blue-600 dark:bg-blue-600 text-white font-semibold border border-blue-700 dark:border-blue-500 ring-2 ring-blue-500/25'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <IconBookmarkFilled size={13} className={filterSavedOnly ? 'text-white' : 'text-ochre-500'} />
              <span>Bookmarked Only</span>
            </button>
          </div>
        )}
      </motion.div>

      {loading && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && prompts.length === 0 && (
        <div className="workbench-card text-center py-16 px-4 shadow-2xs space-y-3 max-w-lg mx-auto">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <IconHistory size={20} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No prompt transformations recorded yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
            All prompts you analyze and refine with PromptWise will be recorded here for fast access and reuse.
          </p>
          <div className="pt-2">
            <Link
              to="/improve"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold transition-colors shadow-xs"
            >
              <IconSparkles size={13} />
              <span>Improve Your First Prompt</span>
            </Link>
          </div>
        </div>
      )}

      {!loading && prompts.length > 0 && filteredPrompts.length === 0 && (
        <div className="workbench-card text-center py-12 px-4 shadow-2xs space-y-2">
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
            No prompts matched your search
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setFilterSavedOnly(false)
            }}
            className="text-xs font-mono font-medium text-cobalt-600 dark:text-cobalt-400 hover:underline cursor-pointer"
          >
            Reset filter
          </button>
        </div>
      )}

      {!loading && filteredPrompts.length > 0 && (
        <div className="space-y-3">
          {filteredPrompts.map((prompt, i) => {
            const isExpanded = expanded === prompt.id
            const date = prompt.createdAt
              ? new Date((prompt.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '—'

            return (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="workbench-card overflow-hidden shadow-2xs transition-colors"
              >
                {/* Header row */}
                <div
                  onClick={() => setExpanded(isExpanded ? null : prompt.id)}
                  className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors text-left"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setExpanded(isExpanded ? null : prompt.id)
                    }
                  }}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-mono-code text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium truncate">
                      {prompt.originalPrompt}
                    </p>
                    <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {date}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-blue-500/10 text-cobalt-700 dark:text-cobalt-300 border border-blue-500/25 font-semibold">
                      {prompt.scoreBefore} → {prompt.scoreAfter}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleSave(prompt.id, prompt.saved)
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      title={prompt.saved ? 'Remove saved prompt' : 'Save prompt'}
                    >
                      {prompt.saved ? (
                        <IconBookmarkFilled size={16} className="text-ochre-600 dark:text-ochre-400" />
                      ) : (
                        <IconBookmark size={16} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeletePrompt(prompt.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-ochre-600 dark:hover:text-ochre-400 transition-colors cursor-pointer"
                      title="Delete prompt"
                    >
                      <IconTrash size={16} />
                    </button>

                    <IconChevronDown
                      size={16}
                      className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-200/80 dark:border-slate-800 px-5 pb-5 pt-4 space-y-4"
                    >
                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* Draft Query */}
                        <div className="rounded-xl bg-ochre-500/[0.04] dark:bg-ochre-500/[0.06] border border-ochre-500/30 p-3.5 space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-ochre-500 shrink-0" />
                            <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ochre-700 dark:text-ochre-400">
                              Original Prompt
                            </p>
                          </div>
                          <p className="font-mono-code text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
                            {prompt.originalPrompt}
                          </p>
                        </div>

                        {/* Improved Prompt */}
                        <div className="rounded-xl bg-sage-500/[0.04] dark:bg-sage-500/[0.06] border border-sage-500/35 p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-sage-500 shrink-0" />
                              <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-sage-700 dark:text-sage-400">
                                Improved Prompt
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(prompt.improvedPrompt, prompt.id)}
                              className="inline-flex items-center gap-1 text-xs font-mono font-medium px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                            >
                              {copied === prompt.id ? (
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
                          <pre className="font-mono-code text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950/80 p-3 rounded-lg border border-sage-500/25 whitespace-pre-wrap break-words leading-relaxed">
                            {prompt.improvedPrompt}
                          </pre>
                        </div>
                      </div>

                      {/* Chatbot Quick Launch Toolbar */}
                      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800">
                        <ChatbotToolbar prompt={prompt.improvedPrompt} compact />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
