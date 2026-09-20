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
import { saveSessionPrompt } from '../lib/sessionHistory'
import { signInWithGoogle } from '../lib/auth'
import {
  IconRotateCcw,
  IconAlertCircle,
  IconCheckCircle,
  IconBookmark,
  IconBookmarkFilled,
  IconHistory,
  IconLogIn,
} from '../components/ui/Icons'



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
  }, [])

  // Scroll to top immediately whenever screen/step or active question changes
  useEffect(() => {
    scrollToTop()
  }, [step, currentQuestionIdx])

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

        // Always save to session memory (for both logged-in and guest users)
        const sessionRecord = saveSessionPrompt({
          userId: user?.uid ?? 'guest',
          originalPrompt: prompt,
          improvedPrompt: result.improvedPrompt,
          scoreBefore,
          scoreAfter: safeScoreAfter,
          saved: false,
        })
        setSavedPromptId(sessionRecord.id)

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
      <div className="w-full max-w-3xl">
        {/* Top Bar Navigation: Easily start a new prompt from anywhere */}
        {step !== 'input' && (
          <div className="flex items-center justify-between mb-5 px-1">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-cobalt-600 dark:text-cobalt-400 hover:text-cobalt-700 dark:hover:text-cobalt-300 transition-colors cursor-pointer px-3 py-1.5 rounded-lg bg-cobalt-500/10 border border-cobalt-500/25 shadow-2xs hover:shadow-xs"
              title="Start a new prompt improvement"
            >
              <IconRotateCcw size={13} />
              <span>Improve Another Prompt</span>
            </button>
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
              Session state preserved
            </span>
          </div>
        )}

        {/* Step Indicator */}
        <StepIndicator currentStep={activeStep} totalSteps={totalSteps} />

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
                <span className="inline-block font-mono text-xs font-semibold uppercase tracking-wider text-cobalt-600 dark:text-cobalt-400 mb-2">
                  AI Prompt Improvement
                </span>
                <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
                  Improve Your Prompt
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
                  Paste your prompt. We'll ask a few questions and help you make it clearer and more useful.
                </p>
              </div>

              <PromptInput
                onSubmit={handlePromptSubmit}
                defaultValue={originalPrompt}
                defaultMode={mode}
                error={error}
                onClearError={() => setError(null)}
              />
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ochre-500/10 border border-ochre-500/25 text-ochre-700 dark:text-ochre-400 text-xs font-mono font-semibold uppercase tracking-wider">
                  <IconAlertCircle size={13} />
                  <span>A Little More Detail Needed</span>
                </span>
              </div>

              {/* Anchor context: Original draft prompt being clarified */}
              {originalPrompt && (
                <div className="mb-6 p-4 rounded-xl border border-ochre-500/25 bg-ochre-500/[0.04] dark:bg-ochre-500/[0.06] shadow-2xs max-w-2xl mx-auto">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-ochre-500 shrink-0" />
                    <span className="text-[11px] font-mono text-ochre-700 dark:text-ochre-400 uppercase tracking-wider font-semibold">
                      Your Original Prompt
                    </span>
                  </div>
                  <p className="font-mono-code text-xs sm:text-sm text-slate-800 dark:text-slate-200 line-clamp-3">
                    {originalPrompt}
                  </p>
                </div>
              )}

              <QuestionCard
                question={GENERIC_CLARIFICATION_QUESTION}
                questionNumber={1}
                totalQuestions={1}
                initialValue={originalPrompt}
                onAnswer={(_, ans) =>
                  handleClarificationAnswer(typeof ans === 'string' ? ans : ans.join(' '))
                }
                hideSkip={true}
                submitButtonText="Continue"
                error={error}
                onClearError={() => setError(null)}
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
              {/* Context Anchor: Draft prompt specification being refined */}
              <div className="mb-6 p-4 rounded-xl border border-ochre-500/25 bg-ochre-500/[0.04] dark:bg-ochre-500/[0.06] shadow-2xs max-w-2xl mx-auto">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-ochre-500 shrink-0" />
                    <span className="text-[11px] font-mono text-ochre-700 dark:text-ochre-400 uppercase tracking-wider font-semibold">
                      Your Original Prompt
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    Question {currentQuestionIdx + 1} of {questionCount}
                  </span>
                </div>
                <p className="font-mono-code text-xs sm:text-sm text-slate-800 dark:text-slate-200 line-clamp-3">
                  {originalPrompt}
                </p>
              </div>

              <QuestionCard
                question={analyzeResult.questions[currentQuestionIdx]}
                questionNumber={currentQuestionIdx + 1}
                totalQuestions={questionCount}
                onAnswer={handleFollowUpAnswer}
                onBack={currentQuestionIdx > 0 ? handlePreviousQuestion : undefined}
                existingAnswer={answers[analyzeResult.questions[currentQuestionIdx].id]}
                error={error}
                onClearError={() => setError(null)}
              />
            </motion.div>
          )}

          {/* Improving */}
          {step === 'improving' && (
            <ImproveSkeleton originalPrompt={originalPrompt} />
          )}

          {/* Results: Structured Editorial Progression */}
          {step === 'results' && improveResult && analyzeResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Results header */}
              <div className="text-center mb-2">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage-500/15 border border-sage-500/30 text-sage-700 dark:text-sage-300 text-xs font-mono font-semibold mb-3"
                >
                  <IconCheckCircle size={14} className="text-sage-600 dark:text-sage-400" />
                  <span>Prompt Improved Successfully</span>
                </motion.div>
                <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Your Improved Prompt is Ready
                </h2>
              </div>

              {/* Actions Bar: Bookmark & Auth status */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl workbench-card shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
                  {user ? (
                    <span className="flex items-center gap-1.5">
                      <IconCheckCircle size={14} className="text-sage-600 dark:text-sage-400" />
                      <span>Saved to your history</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <IconHistory size={14} className="text-slate-400" />
                      <span>Sign in to save this prompt to your dashboard</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {user ? (
                    <button
                      onClick={handleToggleBookmark}
                      disabled={isSaving}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors flex items-center gap-1.5 cursor-pointer min-h-[34px] ${
                        isBookmarked
                          ? 'bg-ochre-500/15 border-ochre-500/30 text-ochre-700 dark:text-ochre-300'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {isBookmarked ? (
                        <>
                          <IconBookmarkFilled size={13} className="text-ochre-500" />
                          <span>Bookmarked</span>
                        </>
                      ) : (
                        <>
                          <IconBookmark size={13} />
                          <span>Bookmark</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleSignInAndSave}
                      disabled={isSaving}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-cobalt-600 hover:bg-cobalt-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs min-h-[34px]"
                    >
                      <IconLogIn size={13} />
                      <span>Sign in to save</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 1. Before / After Comparison */}
              <BeforeAfter
                originalPrompt={originalPrompt}
                improvedPrompt={improveResult.improvedPrompt}
              />

              {/* 2. Educational What Changed & Why Rationale */}
              <ExplanationPanel items={improveResult.explanation} />

              {/* 3. Diagnostic Readiness Scoreboard */}
              <ScoreDisplay
                scoreBefore={analyzeResult.scoreBefore}
                scoreAfter={improveResult.scoreAfter}
                breakdownBefore={analyzeResult.scoreBreakdown}
                breakdownAfter={improveResult.scoreBreakdown}
              />

              {/* 4. Feedback Assessment */}
              <div className="workbench-card p-4 sm:p-5 shadow-2xs">
                <FeedbackWidget
                  promptId={savedPromptId ?? undefined}
                  userId={user?.uid}
                  originalPrompt={originalPrompt}
                  improvedPrompt={improveResult.improvedPrompt}
                />
              </div>

              {/* 5. Start Another Prompt */}
              <div className="flex justify-center pt-2 pb-4">
                <button
                  onClick={handleReset}
                  className="text-cobalt-600 dark:text-cobalt-400 hover:text-cobalt-700 dark:hover:text-cobalt-300 text-xs sm:text-sm font-mono font-semibold transition-colors cursor-pointer min-h-[44px] inline-flex items-center gap-2"
                >
                  <IconRotateCcw size={15} />
                  <span>Improve another prompt</span>
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

