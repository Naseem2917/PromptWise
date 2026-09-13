import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { analyzePrompt } from '../lib/api'
import type { AnalyzeResponse } from '../types'
import { Spinner } from '../components/ui/Spinner'

interface Challenge {
  id: string
  title: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  scenario: string
  weakPrompt: string
  hints: string[]
  expertPrompt: string
  explanation: string
}

const CHALLENGES: Challenge[] = [
  {
    id: 'bug-challenge',
    title: '1. Rescue the Vague Bug Report',
    category: 'Engineering',
    difficulty: 'Beginner',
    scenario: 'A junior teammate posted "The login page is broken, fix it" in Slack. The AI has zero context about what broke, what errors appeared, or the tech stack.',
    weakPrompt: 'The login page is broken, fix it.',
    hints: [
      'Include the exact error message or HTTP status code.',
      'Specify the frontend and auth stack (e.g. Next.js, Firebase Auth, JWT).',
      'Ask for root cause hypotheses and a step-by-step fix.',
    ],
    expertPrompt: `You are a Senior Full-Stack Engineer debugging an authentication failure.
Tech Stack: React 18, Next.js App Router, Firebase Authentication.

Problem: When users click "Sign in with Google", the popup closes and console displays "auth/popup-blocked-by-browser" on Safari iOS.

Task:
1. Explain why this specific error occurs on mobile Safari.
2. Provide an idiomatic fallback redirect flow implementation using signInWithRedirect.
3. Include error-handling code to gracefully catch blocked popups.`,
    explanation: 'By supplying the exact error code, browser environment (Safari iOS), and requesting a dual popup/redirect pattern, the AI can deliver working code rather than generic advice.',
  },
  {
    id: 'copy-challenge',
    title: '2. The High-Converting B2B Pitch',
    category: 'Marketing',
    difficulty: 'Intermediate',
    scenario: 'Transform a generic, pushy 5-paragraph cold email into a punchy 3-sentence message that gets replies from busy founders.',
    weakPrompt: 'Write a cold email to sell my AI note-taking app to busy founders.',
    hints: [
      'Define negative constraints (e.g. max 60 words, no buzzwords).',
      'Focus on a specific customer pain (e.g. lost action items after investor meetings).',
      'Ask for a soft, low-friction call to action.',
    ],
    expertPrompt: `Draft a 3-sentence cold email to a Series-A founder about our meeting intelligence tool.
Recipient: CEO with 25+ direct meetings per week.
Value Prop: Auto-extracts action items and syncs with Linear without requiring meeting bot presence.

Constraints:
- Maximum 50 words total.
- Rule: Do NOT use the words "revolutionary", "game-changing", or "hope this email finds you well".
- End with a low-friction question (e.g. "Worth a 2-minute peek?").`,
    explanation: 'Negative constraints and strict word limits force the AI to be concise and conversational rather than generic sales boilerplate.',
  },
  {
    id: 'sql-challenge',
    title: '3. SQL Query Optimization Architect',
    category: 'Data & DB',
    difficulty: 'Advanced',
    scenario: 'A query on an e-commerce order table with 10 million rows is timing out. Ask AI to analyze the query plan and suggest index strategies.',
    weakPrompt: 'My SQL query is running slow. How do I make it faster?',
    hints: [
      'Specify the database engine (PostgreSQL, MySQL, BigQuery).',
      'Provide schema columns, indexes, and row count magnitude.',
      'Ask the AI to explain the query plan (EXPLAIN ANALYZE) trade-offs.',
    ],
    expertPrompt: `Act as a Principal Database Administrator specializing in PostgreSQL 16 performance tuning.
Table: orders (12M rows, indexed on user_id and created_at).
Problem: The following query takes 4.2 seconds to run:
SELECT user_id, SUM(amount) FROM orders WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY user_id HAVING SUM(amount) > 1000;

Task:
1. Explain what execution plan (Seq Scan vs Bitmap Index Scan) Postgres is likely choosing and why.
2. Recommend composite or partial indexes to enable an Index-Only Scan.
3. Suggest an optimized rewrite or pre-aggregation strategy.`,
    explanation: 'Database performance depends entirely on data volume and index coverage. Giving schema context turns generic advice into production-grade database tuning.',
  },
]

import { useAuth } from '../contexts/AuthContext'
import { savePracticeAttempt } from '../lib/db'

export function Practice() {
  const { user } = useAuth()
  const [activeChallengeIdx, setActiveChallengeIdx] = useState(0)
  const [userPrompt, setUserPrompt] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null)
  const [showSolution, setShowSolution] = useState(false)
  const [showHints, setShowHints] = useState(false)

  const challenge = CHALLENGES[activeChallengeIdx]

  const handleSelectChallenge = (idx: number) => {
    setActiveChallengeIdx(idx)
    setUserPrompt('')
    setAnalysis(null)
    setShowSolution(false)
    setShowHints(false)
  }

  const handleAnalyzeWithAI = async () => {
    if (!userPrompt.trim() || analyzing) return
    setAnalyzing(true)
    try {
      const res = await analyzePrompt(userPrompt, 'medium')
      setAnalysis(res)
      if (user) {
        savePracticeAttempt(user.uid, challenge.title, userPrompt, res.scoreBefore).catch(console.error)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold uppercase tracking-wider mb-4">
          🏋️ Prompting Gym &amp; Challenges
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Practice Arena
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
          Tackle real-world scenarios. Rewrite broken prompts, score them live with AI, and benchmark against senior engineers.
        </p>
      </motion.div>

      {/* Challenge Selector Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {CHALLENGES.map((c, i) => (
          <button
            key={c.id}
            onClick={() => handleSelectChallenge(i)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 min-h-[44px] ${
              activeChallengeIdx === i
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'bg-white dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-white/[0.06] shadow-xs'
            }`}
          >
            <span>{c.title}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                c.difficulty === 'Beginner'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : c.difficulty === 'Intermediate'
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
              }`}
            >
              {c.difficulty}
            </span>
          </button>
        ))}
      </div>

      {/* Challenge Work Area */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left: Scenario & Hints */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-white/[0.08]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                Scenario Brief
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{challenge.category}</span>
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed mb-4">{challenge.scenario}</p>

            {/* Original Bad Prompt */}
            <div className="rounded-xl bg-red-50 dark:bg-red-500/[0.06] border border-red-200 dark:border-red-500/20 p-3.5 mb-4">
              <span className="text-xs font-semibold text-red-600 dark:text-red-400 block mb-1">
                ❌ Starting Weak Prompt:
              </span>
              <p className="font-mono text-xs text-slate-800 dark:text-slate-300">"{challenge.weakPrompt}"</p>
            </div>

            {/* Hints Accordion */}
            <div>
              <button
                onClick={() => setShowHints(!showHints)}
                className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span>💡 {showHints ? 'Hide Hints' : 'Show Strategic Hints'}</span>
                <span className="text-[10px]">{showHints ? '▲' : '▼'}</span>
              </button>

              {showHints && (
                <ul className="mt-3 space-y-1.5 text-xs text-slate-700 dark:text-slate-400 pl-2 border-l border-amber-500/30">
                  {challenge.hints.map((h, idx) => (
                    <li key={idx}>• {h}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Reveal Gold Standard Solution */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-white/[0.08]">
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="w-full flex items-center justify-between text-sm font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <span>🏆 View Expert Solution</span>
              <span className="text-indigo-600 dark:text-indigo-400 text-xs font-normal">
                {showSolution ? 'Hide' : 'Reveal'}
              </span>
            </button>

            {showSolution && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/[0.06]">
                <pre className="text-xs font-mono text-slate-800 dark:text-slate-300 bg-slate-50 dark:bg-black/40 p-3.5 rounded-xl border border-slate-200 dark:border-white/[0.06] whitespace-pre-wrap leading-relaxed mb-3">
                  {challenge.expertPrompt}
                </pre>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong className="text-slate-900 dark:text-slate-300">Why this works:</strong> {challenge.explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: User Workspace & Live AI Scoring */}
        <div className="lg:col-span-7 space-y-5">
          <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-white/[0.08]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Your Improved Prompt
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {userPrompt.length} chars
              </span>
            </div>

            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Draft your high-impact prompt here using the 6 core elements (Goal, Context, Audience, Specificity, Output Format, Constraints)…"
              rows={9}
              className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] p-4 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-indigo-500/50 resize-none font-mono leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
              <button
                onClick={() => setUserPrompt(challenge.weakPrompt)}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition-colors"
              >
                Insert weak prompt to start
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAnalyzeWithAI}
                  disabled={!userPrompt.trim() || analyzing}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  {analyzing ? (
                    <>
                      <Spinner size="sm" />
                      Evaluating with AI…
                    </>
                  ) : (
                    '⚡ Score My Prompt'
                  )}
                </button>

                {userPrompt.trim() && (
                  <Link
                    to={`/improve?prompt=${encodeURIComponent(userPrompt)}`}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] text-xs font-semibold transition-colors"
                  >
                    Open in Full Tool →
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* AI Score Feedback Panel */}
          {analysis && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-6 border border-indigo-500/30 bg-indigo-500/[0.02]"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Live AI Evaluation</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Analysis powered by PromptWise AI engine</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{analysis.scoreBefore}</span>
                  <span className="text-slate-500 text-xs">/100</span>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {Object.entries(analysis.scoreBreakdown).map(([key, ok]) => (
                  <div
                    key={key}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium flex items-center justify-between ${
                      ok
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                        : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'
                    }`}
                  >
                    <span className="capitalize">{key}</span>
                    <span>{ok ? '✓' : '✗'}</span>
                  </div>
                ))}
              </div>

              {analysis.questions.length > 0 && (
                <div className="text-xs text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-200 dark:border-white/[0.06]">
                  <p className="text-amber-600 dark:text-amber-400 font-semibold mb-1">To reach 90+ score:</p>
                  <p>Consider answering: "{analysis.questions[0].question}"</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
