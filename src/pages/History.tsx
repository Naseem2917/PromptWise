import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { getUserPrompts, toggleSavePrompt, deletePrompt } from '../lib/db'
import type { PromptRecord } from '../lib/db'
import { Spinner } from '../components/ui/Spinner'
import { ChatbotToolbar } from '../components/ui/ChatbotToolbar'

export function History() {
  const { user } = useAuth()
  const [prompts, setPrompts] = useState<PromptRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
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
    const confirmed = window.confirm('Are you sure you want to delete this prompt from your history?')
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
      <div className="flex-1 flex items-center justify-center pt-24">
        <div className="text-center">
          <p className="text-4xl mb-4">🔐</p>
          <h2 className="text-2xl font-bold text-slate-200 mb-2">Sign in to view your history</h2>
          <p className="text-slate-500">Your prompt history will appear here after signing in.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
      <div className="max-w-4xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-3">My Prompt History</h1>
          <p className="text-slate-600 dark:text-slate-400">All the prompts you've improved with PromptWise</p>
        </motion.div>

        {loading && (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {!loading && prompts.length === 0 && (
          <div className="text-center py-20 glass-card rounded-2xl shadow-sm">
            <p className="text-4xl mb-4">📝</p>
            <p className="text-slate-800 dark:text-slate-300 text-lg font-medium">No prompts improved yet.</p>
            <p className="text-slate-500 text-sm mt-1">Go to Improve and start your first one!</p>
          </div>
        )}

        {!loading && prompts.length > 0 && (
          <div className="space-y-3">
            {prompts.map((prompt, i) => {
              const isExpanded = expanded === prompt.id
              const date = prompt.createdAt
                ? new Date((prompt.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'

              return (
                <motion.div
                  key={prompt.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-card rounded-2xl overflow-hidden shadow-xs"
                >
                  {/* Header row */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : prompt.id)}
                    className="w-full flex items-center justify-between gap-4 p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 dark:text-slate-100 font-medium text-sm truncate">{prompt.originalPrompt}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{date}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/15 font-semibold">
                        {prompt.scoreBefore} → {prompt.scoreAfter}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleSave(prompt.id, prompt.saved) }}
                        className="text-base transition-transform duration-200 hover:scale-110 cursor-pointer p-1"
                        title={prompt.saved ? 'Remove bookmark' : 'Bookmark'}
                      >
                        {prompt.saved ? '🔖' : '📌'}
                      </button>
                      <button
                        onClick={(e) => handleDeletePrompt(prompt.id, e)}
                        className="text-sm text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10"
                        title="Delete prompt"
                      >
                        🗑️
                      </button>
                      <svg
                        className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-100 dark:border-white/[0.06] px-5 pb-5 pt-4 bg-slate-50/50 dark:bg-transparent space-y-4"
                    >
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="p-3 rounded-xl bg-red-50/60 dark:bg-red-500/[0.04] border border-red-200 dark:border-red-500/20">
                          <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-2">Original</p>
                          <p className="text-slate-800 dark:text-slate-300 text-sm leading-relaxed">{prompt.originalPrompt}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-500/[0.05] border border-indigo-200 dark:border-indigo-500/30">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Improved</p>
                            <button
                              onClick={() => handleCopy(prompt.improvedPrompt, prompt.id)}
                              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium"
                            >
                              {copied === prompt.id ? '✅ Copied!' : '📋 Copy'}
                            </button>
                          </div>
                          <p className="text-slate-900 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-line font-medium">
                            {prompt.improvedPrompt}
                          </p>
                        </div>
                      </div>

                      {/* Chatbot Quick Launch & Action Toolbar */}
                      <div className="pt-3 border-t border-slate-200/60 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <ChatbotToolbar prompt={prompt.improvedPrompt} compact />
                        </div>
                        <button
                          onClick={(e) => handleDeletePrompt(prompt.id, e)}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/20 transition-colors cursor-pointer shrink-0 self-end sm:self-center"
                          title="Delete prompt from history"
                        >
                          <span>🗑️</span>
                          <span>Delete Prompt</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
