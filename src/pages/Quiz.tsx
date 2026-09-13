import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { saveQuizResult } from '../lib/db'
import { Spinner } from '../components/ui/Spinner'

// ── Types ─────────────────────────────────────────────────────────────────────

interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctIdx: number
  explanation: string
}

// ── API helper ────────────────────────────────────────────────────────────────

async function fetchQuizQuestions(): Promise<QuizQuestion[]> {
  const res = await fetch('/api/quiz')
  const json = await res.json() as {
    success?: boolean
    data?: { questions: QuizQuestion[] }
    error?: string
  }
  if (!res.ok || !json.success) {
    throw new Error(json.error ?? 'Failed to load quiz questions.')
  }
  return json.data!.questions
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Quiz() {
  const { user } = useAuth()

  // ── Quiz data state
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // ── Quiz progress state
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)

  // ── Load questions ─────────────────────────────────────────────────────────
  const loadQuestions = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    setCurrentIdx(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setScore(0)
    setQuizFinished(false)
    try {
      const qs = await fetchQuizQuestions()
      setQuestions(qs)
    } catch (e) {
      setLoadError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  // ── Quiz handlers ──────────────────────────────────────────────────────────
  const currentQ = questions[currentIdx]

  const handleSelect = (idx: number) => {
    if (isAnswered) return
    setSelectedOption(idx)
    setIsAnswered(true)
    if (idx === currentQ.correctIdx) {
      setScore((s) => s + 1)
    }
  }

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((i) => i + 1)
      setSelectedOption(null)
      setIsAnswered(false)
    } else {
      setQuizFinished(true)
      if (user) {
        saveQuizResult(user.uid, score, questions.length).catch(console.error)
      }
    }
  }

  const handleRetake = () => {
    setCurrentIdx(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setScore(0)
    setQuizFinished(false)
  }

  const handleRestart = () => {
    loadQuestions()  // fetch fresh questions from AI
  }

  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0

  const getRank = () => {
    if (percentage === 100) return { title: 'Prompt Grandmaster 🏆', desc: 'Flawless score! You have master-level intuition for prompt design and model psychology.' }
    if (percentage >= 80)  return { title: 'Lead AI Engineer ⚡', desc: 'Exceptional work! You understand advanced prompting patterns, grounding, and constraints.' }
    if (percentage >= 50)  return { title: 'Practitioner 🌱', desc: 'Solid foundation! A quick review of Few-Shot prompting and Delimiters will push you to top tier.' }
    return { title: 'Prompt Explorer 🚀', desc: 'Good start! Check out our Learn section to master the 6 core prompt elements.' }
  }

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
            🧠 Skills Assessment
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Prompt Engineering Quiz
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Test your knowledge of LLM reasoning, few-shot prompting, and hallucination defense.
          </p>
        </motion.div>

        <div className="glass-card rounded-2xl p-12 flex flex-col items-center gap-5 shadow-sm">
          <Spinner size="xl" />
          <div className="text-center">
            <p className="text-slate-800 dark:text-slate-200 font-semibold">Generating your quiz with AI…</p>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">Fresh questions every time. This takes a few seconds.</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Error screen ───────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
            🧠 Skills Assessment
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Prompt Engineering Quiz
          </h1>
        </motion.div>

        <div className="glass-card rounded-2xl p-10 text-center shadow-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-slate-700 dark:text-slate-300 font-semibold mb-2">Could not generate quiz questions</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{loadError}</p>
          <button
            onClick={loadQuestions}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-indigo-600/20 min-h-[44px]"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    )
  }

  // ── Main quiz ──────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
          🧠 Skills Assessment
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
          Prompt Engineering Quiz
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Test your knowledge of LLM reasoning, few-shot prompting, and hallucination defense.
        </p>
      </motion.div>

      {!quizFinished ? (
        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-3">
            <span>Question {currentIdx + 1} of {questions.length}</span>
            <span>Score: {score}/{currentIdx + (isAnswered ? 1 : 0)}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-white/[0.05] h-1.5 rounded-full overflow-hidden mb-6">
            <div
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }}
            >
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-snug">
                {currentQ.question}
              </h2>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQ.options.map((option, idx) => {
                  let optionStyle =
                    'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/[0.06] shadow-xs'

                  if (isAnswered) {
                    if (idx === currentQ.correctIdx) {
                      optionStyle =
                        'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                    } else if (selectedOption === idx) {
                      optionStyle =
                        'bg-red-50 dark:bg-red-500/20 border-red-300 dark:border-red-500/40 text-red-800 dark:text-red-300'
                    } else {
                      optionStyle = 'opacity-40 bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.04] text-slate-400'
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 rounded-xl border text-sm transition-all duration-200 cursor-pointer flex items-start gap-3 min-h-[44px] ${optionStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-white/20 flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold text-slate-700 dark:text-slate-300">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {isAnswered && idx === currentQ.correctIdx && <span>✅</span>}
                      {isAnswered && selectedOption === idx && idx !== currentQ.correctIdx && <span>❌</span>}
                    </button>
                  )
                })}
              </div>

              {/* Explanation Banner */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-indigo-50/70 dark:bg-white/[0.03] border border-indigo-200 dark:border-white/[0.08] mb-6 text-xs sm:text-sm"
                  >
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                      {selectedOption === currentQ.correctIdx ? '🎉 Correct!' : '💡 Key Insight:'}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{currentQ.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next Button */}
              {isAnswered && (
                <div className="flex justify-end">
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-indigo-600/20 min-h-[44px]"
                  >
                    {currentIdx + 1 === questions.length ? 'See Final Results →' : 'Next Question →'}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        /* Results Screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-8 text-center shadow-lg"
        >
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">
            {getRank().title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
            {getRank().desc}
          </p>

          <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] mb-8">
            <div>
              <p className="text-xs text-slate-500 uppercase">Correct Answers</p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{score} / {questions.length}</p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-white/10" />
            <div>
              <p className="text-xs text-slate-500 uppercase">Proficiency</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{percentage}%</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleRetake}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5"
            >
              🔁 Retake Quiz
            </button>

            <button
              onClick={handleRestart}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] dark:text-slate-300 dark:border-white/[0.1] text-sm font-semibold transition-colors cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5"
            >
              🔄 New Quiz
            </button>

            <Link
              to="/learn"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] dark:text-slate-300 dark:border-white/[0.1] text-sm font-semibold transition-colors min-h-[44px] flex items-center justify-center"
            >
              📖 Review Masterclass
            </Link>

            <Link
              to="/improve"
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-600/20 min-h-[44px] flex items-center justify-center"
            >
              ⚡ Improve a Prompt
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  )
}
