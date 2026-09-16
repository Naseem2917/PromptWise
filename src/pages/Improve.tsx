import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type {
  WorkflowStep,
  AnalyzeResponse,
  ImproveResponse,
  QuestionAnswers,
  ScoreBreakdown,
  Question,
} from '../types'
import { analyzePrompt, improvePrompt } from '../lib/api'
import type { ResponseMode } from '../lib/api'
import { isObviousGarbage, isObviousGarbageAnswer } from '../lib/validation'
import { useSearchParams } from 'react-router-dom'
import { PromptInput } from '../components/improve/PromptInput'
import { StepIndicator } from '../components/improve/StepIndicator'
import { QuestionCard } from '../components/improve/QuestionCard'
import { ScoreDisplay } from '../components/improve/ScoreDisplay'
import { BeforeAfter } from '../components/improve/BeforeAfter'
import { ExplanationPanel } from '../components/improve/ExplanationPanel'
import { FeedbackWidget } from '../components/improve/FeedbackWidget'
import { AnalyzeSkeleton, ImproveSkeleton } from '../components/improve/ImproveSkeletons'
import { useAuth } from '../contexts/AuthContext'
import { savePrompt, toggleSavePrompt } from '../lib/db'
import { signInWithGoogle } from '../lib/auth'

const GENERIC_CLARIFICATION_QUESTION: Question = {
  id: 'clarification',
  question: 'What specific goal would you like to achieve?',
  type: 'text',
}

/** Put low-friction choice/toggle questions first, and open-ended text questions last */
function sortFollowUpQuestions(questions?: Question[]): Question[] {
  if (!questions || questions.length <= 1) return questions ?? []
  return [...questions].sort((a, b) => {
    if (a.type === 'text' && b.type !== 'text') return 1
    if (a.type !== 'text' && b.type === 'text') return -1
    return 0
  })
}

// ── Storage Keys & Types ──────────────────────────────────────────────────────
const IMPROVE_STORAGE_KEY = 'promptwise_improve_session'

interface StoredImproveState {
  step: WorkflowStep
  mode: ResponseMode
  originalPrompt: string
  clarifications: string[]
  analyzeResult: AnalyzeResponse | null
  currentQuestionIdx: number
  answers: QuestionAnswers
  improveResult: ImproveResponse | null
  savedPromptId: string | null
  isBookmarked: boolean
}

function getStoredImprove(): StoredImproveState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(IMPROVE_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredImproveState
    if (parsed && typeof parsed.step === 'string') {
      return parsed
    }
  } catch (e) {
    console.error('Failed to load stored improve session:', e)
  }
  return null
}

function saveImproveToSession(state: StoredImproveState) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(IMPROVE_STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save improve session:', e)
  }
}

function clearStoredImprove() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(IMPROVE_STORAGE_KEY)
  } catch (e) {}
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function Improve() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const initialPromptFromUrl = searchParams.get('prompt') ?? ''

  const initialStored = getStoredImprove()

  // If coming with a fresh URL ?prompt=, prioritize URL prompt and reset to input
  const hasUrlPrompt = !!initialPromptFromUrl

  const [step, setStep] = useState<WorkflowStep>(() => {
    if (hasUrlPrompt) return 'input'
    // If user was in the middle of a loading skeleton, restore to a safe interactive step
    if (initialStored?.step === 'analyzing') return 'input'
    if (initialStored?.step === 'improving') return initialStored?.analyzeResult ? 'questions' : 'input'
    return initialStored?.step ?? 'input'
  })
  const [mode, setMode] = useState<ResponseMode>(() => hasUrlPrompt ? 'medium' : (initialStored?.mode ?? 'medium'))
  const [originalPrompt, setOriginalPrompt] = useState(() => initialPromptFromUrl || (initialStored?.originalPrompt ?? ''))
  const [clarifications, setClarifications] = useState<string[]>(() => hasUrlPrompt ? [] : (initialStored?.clarifications ?? []))

  useEffect(() => {
    if (initialPromptFromUrl) {
      setOriginalPrompt(initialPromptFromUrl)
      setStep('input')
    }
  }, [initialPromptFromUrl])

  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResponse | null>(() => hasUrlPrompt ? null : (initialStored?.analyzeResult ?? null))
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(() => hasUrlPrompt ? 0 : (initialStored?.currentQuestionIdx ?? 0))
  const [answers, setAnswers] = useState<QuestionAnswers>(() => hasUrlPrompt ? {} : (initialStored?.answers ?? {}))
  const [improveResult, setImproveResult] = useState<ImproveResponse | null>(() => hasUrlPrompt ? null : (initialStored?.improveResult ?? null))
  const [error, setError] = useState<string | null>(null)
  const [errorKey, setErrorKey] = useState(0)
  const [savedPromptId, setSavedPromptId] = useState<string | null>(() => hasUrlPrompt ? null : (initialStored?.savedPromptId ?? null))
  const [isBookmarked, setIsBookmarked] = useState(() => hasUrlPrompt ? false : (initialStored?.isBookmarked ?? false))
  const [isSaving, setIsSaving] = useState(false)

  // Sync state to sessionStorage whenever key workflow states change
  useEffect(() => {
    saveImproveToSession({
      step,
      mode,
      originalPrompt,
      clarifications,
      analyzeResult,
      currentQuestionIdx,
      answers,
      improveResult,
      savedPromptId,
      isBookmarked,
    })
  }, [
    step,
    mode,
    originalPrompt,
    clarifications,
    analyzeResult,
    currentQuestionIdx,
    answers,
    improveResult,
    savedPromptId,
    isBookmarked,
  ])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (document.documentElement) {
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const triggerError = useCallback((msg: string | null) => {
    setError(msg)
    if (msg) {
      setErrorKey((k) => k + 1)
      scrollToTop()
    }
  }, [])

  // Scroll to top immediately whenever screen/step, active question, or error changes
  useEffect(() => {
    scrollToTop()
  }, [step, currentQuestionIdx, error, errorKey])

  // ── Generate improved prompt (Stage C: Final Improvement) ─────────────────
  const generateImproved = useCallback(
    async (
      prompt: string,
      collectedClarifications: string[],
      collectedAnswers: QuestionAnswers,
      scoreBefore: number,
      scoreBreakdown: ScoreBreakdown,
      selectedMode: ResponseMode,
    ) => {
      setStep('improving')
      setError(null)
      try {
        const result = await improvePrompt(
          prompt,
          collectedAnswers,
          scoreBefore,
          scoreBreakdown,
          selectedMode,
          collectedClarifications,
        )
        const safeScoreAfter = Math.min(100, Math.max(scoreBefore, result.scoreAfter))
        const normalizedResult = { ...result, scoreAfter: safeScoreAfter }
        setImproveResult(normalizedResult)
        setStep('results')

        // If user is already signed in, auto-save prompt to Firestore
        if (user) {
          try {
            const id = await savePrompt(user.uid, {
              originalPrompt: prompt,
              improvedPrompt: result.improvedPrompt,
              scoreBefore,
              scoreAfter: safeScoreAfter,
            })
            setSavedPromptId(id)
          } catch (e) {
            console.error('Error auto-saving prompt:', e)
          }
        }
      } catch (err: unknown) {
        triggerError((err as Error).message)
        setStep('input')
      }
    },
    [user, triggerError],
  )

  // ── Handle prompt submit (Stage A: Initial Verification) ──────────────────
  const handlePromptSubmit = useCallback(
    async (prompt: string, selectedMode: ResponseMode) => {
      setMode(selectedMode)               // store once — not asked again
      setOriginalPrompt(prompt)
      setClarifications([])
      setAnswers({})
      setCurrentQuestionIdx(0)
      setAnalyzeResult(null)
      setImproveResult(null)
      setSavedPromptId(null)
      setIsBookmarked(false)
      setError(null)

      // 1. Lightweight local garbage check
      if (isObviousGarbage(prompt)) {
        // 0 Gemini API calls! Show generic clarification
        setStep('clarification')
        return
      }

      // 2. Not obvious garbage -> Call Gemini Analyze (API Call 1)
      setStep('analyzing')

      try {
        const result = await analyzePrompt(prompt, selectedMode)
        const sortedResult = {
          ...result,
          questions: sortFollowUpQuestions(result.questions),
        }
        setAnalyzeResult(sortedResult)

        if (sortedResult.status === 'needs_clarification') {
          // Gemini decided prompt is vague/unclear
          setStep('clarification')
        } else if (sortedResult.needsQuestions && sortedResult.questions && sortedResult.questions.length > 0) {
          // Verified -> Stage B (verified follow-up questions)
          setStep('questions')
        } else {
          // Verified and already comprehensive -> proceed directly to Stage C
          await generateImproved(prompt, [], {}, sortedResult.scoreBefore, sortedResult.scoreBreakdown, selectedMode)
        }
      } catch (err: unknown) {
        triggerError((err as Error).message)
        setStep('input')
      }
    },
    [generateImproved, triggerError],
  )

  // ── Handle clarification answer (Stage A: Verification Loop) ──────────────
  const handleClarificationAnswer = useCallback(
    async (answer: string) => {
      const trimmed = answer.trim()

      // 1. Lightweight local check on clarification answer
      if (isObviousGarbage(trimmed)) {
        // 0 Gemini API calls! Stay in clarification loop with gentle alert
        triggerError('Please describe what you would like to create or accomplish.')
        return
      }

      // Prevent calling Gemini if user submitted without adding any details or modifying the prompt
      if (trimmed.toLowerCase() === originalPrompt.trim().toLowerCase()) {
        triggerError('Please add more details to your prompt to continue.')
        return
      }

      setError(null)

      // 2. Update the prompt immediately so the skeleton displays the new prompt during analysis
      setOriginalPrompt(trimmed)
      setStep('analyzing')
      try {
        const result = await analyzePrompt(trimmed, mode)
        const sortedResult = {
          ...result,
          questions: sortFollowUpQuestions(result.questions),
        }
        setAnalyzeResult(sortedResult)

        if (sortedResult.status === 'needs_clarification') {
          // Still unclear -> stay in clarification loop
          triggerError('Please provide more detail about what you want to create or figure out.')
          setStep('clarification')
        } else if (sortedResult.needsQuestions && sortedResult.questions && sortedResult.questions.length > 0) {
          // Verified! Clear previous clarifications and proceed to questions
          setClarifications([])
          setStep('questions')
        } else {
          // Verified and complete -> proceed directly to Stage C (improvement)
          setClarifications([])
          await generateImproved(
            trimmed,
            [],
            {},
            sortedResult.scoreBefore,
            sortedResult.scoreBreakdown,
            mode,
          )
        }
      } catch (err: unknown) {
        triggerError((err as Error).message)
        setStep('clarification')
      }
    },
    [mode, generateImproved, triggerError, originalPrompt],
  )

  // ── Handle verified follow-up question answer (Stage B) ───────────────────
  // CRITICAL RULE: In this verified state, NEVER call Gemini to validate answers!
  const handleFollowUpAnswer = useCallback(
    async (id: string, answer: string | string[]) => {
      // Local check only for non-empty text answers (allow empty string for skip)
      if (typeof answer === 'string' && answer.trim().length > 0) {
        if (isObviousGarbageAnswer(answer)) {
          triggerError('Please provide a meaningful answer to continue.')
          return
        }
      }

      setError(null)
      const newAnswers = { ...answers, [id]: answer }
      setAnswers(newAnswers)

      const questions = analyzeResult!.questions
      const nextIdx = currentQuestionIdx + 1

      if (nextIdx < questions.length) {
        setCurrentQuestionIdx(nextIdx)
      } else {
        // All follow-up questions answered! Call Stage C (Final Improvement API Call)
        await generateImproved(
          originalPrompt,
          clarifications,
          newAnswers,
          analyzeResult!.scoreBefore,
          analyzeResult!.scoreBreakdown,
          mode,
        )
      }
    },
    [answers, analyzeResult, currentQuestionIdx, generateImproved, originalPrompt, clarifications, mode, triggerError],
  )

  // ── Navigate to previous question in Stage B ──────────────────────────────
  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx((prev) => prev - 1)
      scrollToTop()
    }
  }, [currentQuestionIdx])

  // ── Reset ────────────────────────────────────────────────────────────────
  const handleReset = () => {
    clearStoredImprove()
    setStep('input')
    setOriginalPrompt('')
    setClarifications([])
    setAnalyzeResult(null)
    setImproveResult(null)
    setAnswers({})
    setCurrentQuestionIdx(0)
    setSavedPromptId(null)
    setIsBookmarked(false)
    setError(null)
  }

  // ── Bookmark / Save toggle ───────────────────────────────────────────────
  const handleToggleBookmark = async () => {
    if (!savedPromptId) {
      // If user is logged in but save hasn't finished or was not created
      if (user && improveResult && analyzeResult) {
        setIsSaving(true)
        try {
          const id = await savePrompt(user.uid, {
            originalPrompt,
            improvedPrompt: improveResult.improvedPrompt,
            scoreBefore: analyzeResult.scoreBefore,
            scoreAfter: improveResult.scoreAfter,
          })
          setSavedPromptId(id)
          await toggleSavePrompt(id, true)
          setIsBookmarked(true)
        } catch (e) {
          console.error(e)
        } finally {
          setIsSaving(false)
        }
      }
      return
    }

    setIsSaving(true)
    try {
      await toggleSavePrompt(savedPromptId, !isBookmarked)
      setIsBookmarked(!isBookmarked)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  // ── Sign in & Save ───────────────────────────────────────────────────────
  const handleSignInAndSave = async () => {
    setIsSaving(true)
    try {
      const loggedUser = await signInWithGoogle()
      if (loggedUser && improveResult && analyzeResult) {
        const id = await savePrompt(loggedUser.uid, {
          originalPrompt,
          improvedPrompt: improveResult.improvedPrompt,
          scoreBefore: analyzeResult.scoreBefore,
          scoreAfter: improveResult.scoreAfter,
        })
        setSavedPromptId(id)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  // ── Step indicator logic ─────────────────────────────────────────────────
  const totalSteps = 3
  const stepIndex: Record<WorkflowStep, number> = {
    input: 0,
    clarification: 1,
    analyzing: 1,
    questions: 1,
    improving: 2,
    results: 3,
  }
  const activeStep = stepIndex[step]
  const questionCount = analyzeResult?.questions.length ?? 0

  return (
    <div className="flex-1 flex flex-col items-center justify-start py-8 sm:py-12 px-4 w-full">
      {/* Background glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-600/[0.07] rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-3xl">
        {/* Top Bar Navigation: Easily start a new prompt from anywhere */}
        {step !== 'input' && (
          <div className="flex items-center justify-between mb-4 px-1">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors cursor-pointer px-3 py-1.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/20 shadow-2xs hover:shadow-xs"
              title="Start a new prompt improvement"
            >
              <span>✨</span>
              <span>Improve Another Prompt</span>
            </button>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
              Progress saved in session
            </span>
          </div>
        )}

        {/* Step Indicator */}
        <StepIndicator currentStep={activeStep} totalSteps={totalSteps} />

        {/* Error banner */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key={`error-${errorKey}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">⚠️</span>
                <span className="font-normal text-red-500 dark:text-red-400 truncate sm:whitespace-normal">
                  {error}
                </span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400/60 hover:text-red-400 ml-2 text-xs font-medium cursor-pointer shrink-0"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Input */}
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
                  Improve Your Prompt
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                  Paste any prompt. We'll analyze it, ask targeted questions, and craft a better version.
                </p>
              </div>

              <PromptInput onSubmit={handlePromptSubmit} defaultValue={originalPrompt} defaultMode={mode} />
            </motion.div>
          )}

          {/* Clarification (Stage A Verification Loop) */}
          {step === 'clarification' && (
            <motion.div
              key="clarification"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-6 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">
                  Clarification Needed
                </span>
              </div>

              <QuestionCard
                question={GENERIC_CLARIFICATION_QUESTION}
                questionNumber={1}
                totalQuestions={1}
                initialValue={originalPrompt}
                onAnswer={(_, ans) =>
                  handleClarificationAnswer(typeof ans === 'string' ? ans : ans.join(' '))
                }
                hideSkip={true}
                submitButtonText="Continue →"
              />
            </motion.div>
          )}

          {/* Analyzing */}
          {step === 'analyzing' && (
            <AnalyzeSkeleton prompt={originalPrompt} />
          )}

          {/* Step 2: Questions */}
          {step === 'questions' && analyzeResult && analyzeResult.questions.length > 0 && (
            <motion.div
              key={`question-${currentQuestionIdx}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Original prompt preview */}
              <div className="mb-8 px-5 py-3.5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] shadow-xs">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium uppercase tracking-wider">Your prompt</p>
                <p className="text-slate-800 dark:text-slate-300 text-sm">{originalPrompt}</p>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm mb-8">
                Let's make your prompt more specific.{' '}
                <span className="text-slate-400 dark:text-slate-600">
                  ({currentQuestionIdx + 1} of {questionCount} question
                  {questionCount > 1 ? 's' : ''})
                </span>
              </p>

              <QuestionCard
                question={analyzeResult.questions[currentQuestionIdx]}
                questionNumber={currentQuestionIdx + 1}
                totalQuestions={questionCount}
                onAnswer={handleFollowUpAnswer}
                onBack={currentQuestionIdx > 0 ? handlePreviousQuestion : undefined}
                existingAnswer={answers[analyzeResult.questions[currentQuestionIdx].id]}
              />
            </motion.div>
          )}

          {/* Improving */}
          {step === 'improving' && (
            <ImproveSkeleton originalPrompt={originalPrompt} />
          )}

          {/* Results */}
          {step === 'results' && improveResult && analyzeResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Results header */}
              <div className="text-center mb-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-4"
                >
                  ✅ Prompt improved!
                </motion.div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Here's your improved prompt</h2>
              </div>

              {/* Actions Bar: Bookmark & Auth status */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] shadow-xs">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  {user ? (
                    <span>💾 Auto-saved to your history</span>
                  ) : (
                    <span>💡 Sign in with Google to save to your dashboard</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {user ? (
                    <button
                      onClick={handleToggleBookmark}
                      disabled={isSaving}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
                        isBookmarked
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-300'
                          : 'bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      {isBookmarked ? '★ Bookmarked' : '☆ Bookmark prompt'}
                    </button>
                  ) : (
                    <button
                      onClick={handleSignInAndSave}
                      disabled={isSaving}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm min-h-[36px]"
                    >
                      <span>Sign in to save</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Before / After */}
              <BeforeAfter
                originalPrompt={originalPrompt}
                improvedPrompt={improveResult.improvedPrompt}
              />

              {/* Score */}
              <ScoreDisplay
                scoreBefore={analyzeResult.scoreBefore}
                scoreAfter={improveResult.scoreAfter}
                breakdownBefore={analyzeResult.scoreBreakdown}
                breakdownAfter={improveResult.scoreBreakdown}
              />

              {/* Explanation */}
              <ExplanationPanel items={improveResult.explanation} />

              {/* Feedback */}
              <div className="glass-card rounded-2xl">
                <FeedbackWidget
                  promptId={savedPromptId ?? undefined}
                  userId={user?.uid}
                  originalPrompt={originalPrompt}
                  improvedPrompt={improveResult.improvedPrompt}
                />
              </div>

              {/* Try another */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleReset}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-semibold transition-colors cursor-pointer min-h-[44px] inline-flex items-center justify-center"
                >
                  ← Improve another prompt
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
