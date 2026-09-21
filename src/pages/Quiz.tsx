import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { saveQuizResult } from '../lib/db'
import { fetchQuizQuestions, type QuizQuestion } from '../lib/api'
import {
  IconCheckCircle,
  IconXCircle,
  IconRotateCcw,
  IconRefreshCw,
  IconBookOpen,
  IconSparkles,
  IconArrowRight,
  IconAlertCircle,
  IconAward,
  IconLightbulb,
} from '../components/ui/Icons'

// ── Storage Keys ─────────────────────────────────────────────────────────────
const QUIZ_STORAGE_KEY = 'promptwise_quiz_session'

interface StoredQuizState {
  questions: QuizQuestion[]
  currentIdx: number
  selectedOption: number | null
  isAnswered: boolean
  score: number
  quizFinished: boolean
}

function getStoredQuiz(): StoredQuizState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(QUIZ_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredQuizState
    if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed
    }
  } catch (e) {
    console.error('Failed to load stored quiz:', e)
  }
  return null
}

function saveQuizToSession(state: StoredQuizState) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save quiz state:', e)
  }
}

function clearStoredQuiz() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(QUIZ_STORAGE_KEY)
  } catch (e) {}
}

// ── Skeleton Loader ─────────────────────────────────────────────────────────

function QuizSkeleton() {
  return (
    <motion.div
      key="quiz-skeleton"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.25 }}
      className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full space-y-6"
    >
      {/* Editorial Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cobalt-500/10 border border-cobalt-500/25 text-cobalt-700 dark:text-cobalt-300 text-xs font-mono font-medium tracking-wide mb-2.5">
          <IconSparkles size={14} className="animate-twinkle text-cobalt-600 dark:text-cobalt-400 shrink-0" />
          <span>Generating quiz questions with AI…</span>
        </div>
        <h1 className="font-serif-title text-3xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-3">
          Prompt Engineering Quiz
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Generating questions to test your understanding of prompt writing and AI concepts.
        </p>
      </div>

      {/* Question Card Skeleton */}
      <div className="workbench-card rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
        {/* Top Progress / Controls placeholder */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-28 h-4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="w-20 h-4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="w-28 h-4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>

        {/* Progress track skeleton */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-blue-600/50 dark:bg-blue-500/50 h-full w-1/4 rounded-full animate-pulse" />
        </div>

        {/* Question Title Skeleton */}
        <div className="space-y-2.5 pt-1">
          <div className="w-11/12 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="w-3/4 h-5 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>

        {/* Options Skeletons */}
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="w-full min-h-[46px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-start gap-3 shadow-2xs animate-pulse"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5 pt-1">
                <div
                  className="h-4 rounded bg-slate-200 dark:bg-slate-800"
                  style={{ width: `${55 + (idx % 3) * 18}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Quiz() {
  const { user } = useAuth()

  const initialStored = getStoredQuiz()

  // ── Quiz data state
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => initialStored?.questions ?? [])
  const [loading, setLoading] = useState<boolean>(
    () => !initialStored || initialStored.questions.length === 0,
  )
  const [loadError, setLoadError] = useState<string | null>(null)

  // ── Quiz progress state
  const [currentIdx, setCurrentIdx] = useState<number>(() => initialStored?.currentIdx ?? 0)
  const [selectedOption, setSelectedOption] = useState<number | null>(
    () => initialStored?.selectedOption ?? null,
  )
  const [isAnswered, setIsAnswered] = useState<boolean>(() => initialStored?.isAnswered ?? false)
  const [score, setScore] = useState<number>(() => initialStored?.score ?? 0)
  const [quizFinished, setQuizFinished] = useState<boolean>(
    () => initialStored?.quizFinished ?? false,
  )

  // Sync state to sessionStorage whenever progress changes
  useEffect(() => {
    if (questions.length > 0) {
      saveQuizToSession({
        questions,
        currentIdx,
        selectedOption,
        isAnswered,
        score,
        quizFinished,
      })
    }
  }, [questions, currentIdx, selectedOption, isAnswered, score, quizFinished])

  // ── Load questions (fresh from AI) ─────────────────────────────────────────
  const loadQuestions = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    setCurrentIdx(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setScore(0)
    setQuizFinished(false)
    clearStoredQuiz()
    try {
      const qs = await fetchQuizQuestions()
      setQuestions(qs)
    } catch (e) {
      setLoadError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  // On mount: only fetch if there is NO existing quiz stored in session
  useEffect(() => {
    if (!initialStored || initialStored.questions.length === 0) {
      loadQuestions()
    }
  }, [loadQuestions])

  // ── Quiz Card Ref & Smooth Scroll ─────────────────────────────────────────
  const quizCardRef = useRef<HTMLDivElement>(null)

  const scrollToQuestion = () => {
    setTimeout(() => {
      if (quizCardRef.current) {
        const navOffset = 76 // Clearance for fixed top navbar
        const elementPosition = quizCardRef.current.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - navOffset
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth',
        })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }, 40)
  }

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
      scrollToQuestion()
    } else {
      setQuizFinished(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
    scrollToQuestion()
  }

  const handleRestart = () => {
    loadQuestions() // fetch fresh questions from AI on user click
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0

  const getRank = () => {
    if (percentage === 100) {
      return {
        title: 'Prompt Grandmaster',
        desc: 'Flawless score! You have master-level intuition for prompt design, grounding, and model psychology.',
      }
    }
    if (percentage >= 80) {
      return {
        title: 'Lead AI Engineer',
        desc: 'Exceptional work! You understand advanced prompting patterns, grounding, and constraints.',
      }
    }
    if (percentage >= 50) {
      return {
        title: 'Practitioner',
        desc: 'Solid foundation! A quick review of Few-Shot conditioning and Delimiters will push you to top tier.',
      }
    }
    return {
      title: 'Prompt Explorer',
      desc: 'Good start! Review our Learn section to master the 6 core prompt elements and constraint techniques.',
    }
  }

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (loading) {
    return <QuizSkeleton />
  }


  // ── Error screen ───────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <span className="inline-block font-mono text-xs font-semibold uppercase tracking-wider text-cobalt-600 dark:text-cobalt-400 mb-2">
            Assessment Status
          </span>
          <h1 className="font-serif-title text-3xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-3">
            Prompt Engineering Assessment
          </h1>
        </motion.div>

        <div className="workbench-card rounded-2xl p-10 text-center shadow-2xs max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-xl bg-ochre-500/10 border border-ochre-500/20 text-ochre-600 dark:text-ochre-400 flex items-center justify-center mx-auto">
            <IconAlertCircle size={24} />
          </div>
          <div>
            <p className="text-slate-900 dark:text-slate-100 font-bold mb-1">
              Could not generate assessment questions
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{loadError}</p>
          </div>
          <button
            type="button"
            onClick={loadQuestions}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-mono font-semibold transition-colors cursor-pointer shadow-xs min-h-[40px] inline-flex items-center gap-2"
          >
            <IconRotateCcw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    )
  }

  // ── Main quiz ──────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <span className="inline-block font-mono text-xs font-semibold uppercase tracking-wider text-cobalt-600 dark:text-cobalt-400 mb-2">
          AI Literacy Quiz
        </span>
        <h1 className="font-serif-title text-3xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-3">
          Prompt Engineering Quiz
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Test your understanding of how to give clear instructions to AI and get better answers.
        </p>
      </motion.div>

      {!quizFinished ? (
        <div ref={quizCardRef} className="workbench-card rounded-2xl p-6 sm:p-8 shadow-2xs scroll-mt-20">
          {/* Progress bar and control */}
          <div className="flex items-center justify-between gap-2.5 text-xs font-mono text-slate-600 dark:text-slate-400 mb-3">
            <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap min-w-0">
              <span className="font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-slate-300 dark:text-slate-700 hidden xs:inline">·</span>
              <span className="whitespace-nowrap text-slate-500 dark:text-slate-400">
                Score: {score} / {currentIdx + (isAnswered ? 1 : 0)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRestart}
              className="shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-mono font-medium transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 whitespace-nowrap"
              title="Generate a brand new set of questions"
            >
              <IconRefreshCw size={13} className="text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">New Question Set</span>
              <span className="sm:hidden">New Set</span>
            </button>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-6">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-snug">
                {currentQ.question}
              </h2>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQ.options.map((option, idx) => {
                  let optionStyle =
                    'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-cobalt-400 dark:hover:border-cobalt-600 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 shadow-2xs'

                  if (isAnswered) {
                    if (idx === currentQ.correctIdx) {
                      // Correct option: Sage
                      optionStyle =
                        'bg-sage-500/[0.08] dark:bg-sage-500/[0.14] border-sage-500/50 text-slate-900 dark:text-slate-100 font-medium'
                    } else if (selectedOption === idx) {
                      // Selected incorrect option: Ochre (educational, non-punitive)
                      optionStyle =
                        'bg-ochre-500/[0.08] dark:bg-ochre-500/[0.14] border-ochre-500/50 text-slate-900 dark:text-slate-100'
                    } else {
                      // Other options: Muted
                      optionStyle =
                        'opacity-40 bg-slate-50/50 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/60 text-slate-400 dark:text-slate-500'
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(idx)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-all duration-150 flex items-start gap-3 min-h-[46px] ${
                        isAnswered ? 'cursor-default' : 'cursor-pointer'
                      } ${optionStyle}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs shrink-0 mt-0.5 font-mono font-bold ${
                          isAnswered && idx === currentQ.correctIdx
                            ? 'bg-sage-500 text-white border-sage-600'
                            : isAnswered && selectedOption === idx
                              ? 'bg-ochre-500 text-white border-ochre-600'
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 leading-relaxed">{option}</span>
                      {isAnswered && idx === currentQ.correctIdx && (
                        <IconCheckCircle
                          size={18}
                          className="text-sage-600 dark:text-sage-400 shrink-0 mt-0.5"
                        />
                      )}
                      {isAnswered && selectedOption === idx && idx !== currentQ.correctIdx && (
                        <IconXCircle
                          size={18}
                          className="text-ochre-600 dark:text-ochre-400 shrink-0 mt-0.5"
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Explanation Callout */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`p-4 sm:p-5 rounded-xl border mb-6 text-xs sm:text-sm leading-relaxed ${
                      selectedOption === currentQ.correctIdx
                        ? 'bg-sage-500/[0.05] dark:bg-sage-500/[0.08] border-sage-500/30'
                        : 'bg-ochre-500/[0.05] dark:bg-ochre-500/[0.08] border-ochre-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {selectedOption === currentQ.correctIdx ? (
                        <>
                          <IconCheckCircle
                            size={16}
                            className="text-sage-600 dark:text-sage-400 shrink-0"
                          />
                          <span className="font-mono text-xs font-bold uppercase tracking-wider text-sage-700 dark:text-sage-300">
                            Correct!
                          </span>
                        </>
                      ) : (
                        <>
                          <IconLightbulb
                            size={16}
                            className="text-ochre-600 dark:text-ochre-400 shrink-0"
                          />
                          <span className="font-mono text-xs font-bold uppercase tracking-wider text-ochre-700 dark:text-ochre-300">
                            Explanation
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{currentQ.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next Button */}
              {isAnswered && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="group/btn px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-mono font-semibold transition-colors cursor-pointer shadow-xs min-h-[42px] inline-flex items-center gap-1.5"
                  >
                    <span>
                      {currentIdx + 1 === questions.length ? 'View Quiz Results' : 'Next Question'}
                    </span>
                    <IconArrowRight size={14} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        /* Results Screen */
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="workbench-card rounded-2xl p-8 sm:p-10 text-center shadow-2xs max-w-2xl mx-auto space-y-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-cobalt-600 dark:text-cobalt-400 mx-auto">
            <IconAward size={28} />
          </div>

          <div>
            <span className="inline-block font-mono text-xs font-semibold uppercase tracking-wider text-cobalt-600 dark:text-cobalt-400 mb-1">
              Quiz Complete
            </span>
            <h2 className="font-serif-title text-2xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
              {getRank().title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              {getRank().desc}
            </p>
          </div>

          {/* Diagnostic Metrics */}
          <div className="inline-flex items-center gap-6 sm:gap-10 px-6 sm:px-8 py-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider">
                Correct Answers
              </p>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {score} / {questions.length}
              </p>
            </div>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
            <div>
              <p className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider">
                Score
              </p>
              <p
                className={`text-2xl sm:text-3xl font-mono font-bold mt-0.5 ${
                  percentage >= 80
                    ? 'text-sage-600 dark:text-sage-400'
                    : percentage >= 50
                      ? 'text-cobalt-600 dark:text-cobalt-400'
                      : 'text-ochre-600 dark:text-ochre-400'
                }`}
              >
                {percentage}%
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRetake}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-mono font-semibold transition-colors shadow-xs cursor-pointer min-h-[42px] inline-flex items-center justify-center gap-1.5"
            >
              <IconRotateCcw size={14} />
              <span>Retake Set</span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono font-semibold transition-colors cursor-pointer min-h-[42px] inline-flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <IconRefreshCw size={14} />
              <span>New Question Set</span>
            </button>

            <Link
              to="/learn"
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono font-semibold transition-colors min-h-[42px] inline-flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <IconBookOpen size={14} />
              <span>Review Concepts</span>
            </Link>

            <Link
              to="/improve"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-xs sm:text-sm font-mono font-semibold transition-colors min-h-[42px] inline-flex items-center justify-center gap-1.5 shadow-xs"
            >
              <IconSparkles size={14} />
              <span>Improve a Prompt</span>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  )
}
