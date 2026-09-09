import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type {
  WorkflowStep,
  AnalyzeResponse,
  ImproveResponse,
  QuestionAnswers,
  ScoreBreakdown,
} from '../types'
import { analyzePrompt, improvePrompt } from '../lib/api'
import { useSearchParams } from 'react-router-dom'
import { PromptInput } from '../components/improve/PromptInput'
import { StepIndicator } from '../components/improve/StepIndicator'
import { QuestionCard } from '../components/improve/QuestionCard'
import { ScoreDisplay } from '../components/improve/ScoreDisplay'
import { BeforeAfter } from '../components/improve/BeforeAfter'
import { ExplanationPanel } from '../components/improve/ExplanationPanel'
import { FeedbackWidget } from '../components/improve/FeedbackWidget'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../contexts/AuthContext'
import { savePrompt, toggleSavePrompt } from '../lib/db'
import { signInWithGoogle } from '../lib/auth'

// ── Loading overlay ───────────────────────────────────────────────────────────
function LoadingState({ message }: { message: string }) {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="flex flex-col items-center gap-5 py-20"
    >
      <Spinner size="xl" />
      <div className="text-center">
        <p className="text-slate-800 dark:text-slate-200 font-semibold">{message}</p>
        <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">This usually takes a few seconds…</p>
      </div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function Improve() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const initialPromptFromUrl = searchParams.get('prompt') ?? ''
  const [step, setStep] = useState<WorkflowStep>('input')
  const [originalPrompt, setOriginalPrompt] = useState(initialPromptFromUrl)
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResponse | null>(null)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [answers, setAnswers] = useState<QuestionAnswers>({})
  const [improveResult, setImproveResult] = useState<ImproveResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savedPromptId, setSavedPromptId] = useState<string | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // ── Generate improved prompt ─────────────────────────────────────────────
  const generateImproved = useCallback(
    async (
      prompt: string,
      collectedAnswers: QuestionAnswers,
      scoreBefore: number,
      scoreBreakdown: ScoreBreakdown,
    ) => {
      setStep('improving')
      setError(null)
      try {
        const result = await improvePrompt(prompt, collectedAnswers, scoreBefore, scoreBreakdown)
        setImproveResult(result)
        setStep('results')

        // If user is already signed in, auto-save prompt to Firestore
        if (user) {
          try {
            const id = await savePrompt(user.uid, {
              originalPrompt: prompt,
              improvedPrompt: result.improvedPrompt,
              scoreBefore,
              scoreAfter: result.scoreAfter,
            })
            setSavedPromptId(id)
          } catch (e) {
            console.error('Error auto-saving prompt:', e)
          }
        }
      } catch (err: unknown) {
        setError((err as Error).message)
        setStep('input')
      }
    },
    [user],
  )

  // ── Handle prompt submit ─────────────────────────────────────────────────
  const handlePromptSubmit = useCallback(
    async (prompt: string) => {
      setOriginalPrompt(prompt)
      setAnswers({})
      setCurrentQuestionIdx(0)
      setAnalyzeResult(null)
      setImproveResult(null)
      setSavedPromptId(null)
      setIsBookmarked(false)
      setStep('analyzing')
      setError(null)

      try {
        const result = await analyzePrompt(prompt)
        setAnalyzeResult(result)

        if (result.needsQuestions && result.questions.length > 0) {
          setStep('questions')
        } else {
          // Enough info — skip questions
          await generateImproved(prompt, {}, result.scoreBefore, result.scoreBreakdown)
        }
      } catch (err: unknown) {
        setError((err as Error).message)
        setStep('input')
      }
    },
    [generateImproved],
  )

  // ── Handle question answer ───────────────────────────────────────────────
  const handleAnswer = useCallback(
    async (id: string, answer: string | string[]) => {
      const newAnswers = { ...answers, [id]: answer }
      setAnswers(newAnswers)

      const questions = analyzeResult!.questions
      const nextIdx = currentQuestionIdx + 1

      if (nextIdx < questions.length) {
        setCurrentQuestionIdx(nextIdx)
      } else {
        await generateImproved(
          originalPrompt,
          newAnswers,
          analyzeResult!.scoreBefore,
          analyzeResult!.scoreBreakdown,
        )
      }
    },
    [answers, analyzeResult, currentQuestionIdx, generateImproved, originalPrompt],
  )

  // ── Reset ────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setStep('input')
    setOriginalPrompt('')
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
        {/* Step Indicator */}
        <StepIndicator currentStep={activeStep} totalSteps={totalSteps} />

        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between"
          >
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400/60 hover:text-red-400 ml-2 text-xs"
            >
              Dismiss
            </button>
          </motion.div>
        )}

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

              <PromptInput onSubmit={handlePromptSubmit} defaultValue={initialPromptFromUrl} />
            </motion.div>
          )}

          {/* Analyzing */}
          {step === 'analyzing' && (
            <LoadingState key="analyzing" message="Analyzing your prompt with AI…" />
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
                onAnswer={handleAnswer}
              />
            </motion.div>
          )}

          {/* Improving */}
          {step === 'improving' && (
            <LoadingState key="improving" message="Generating your improved prompt…" />
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
                <FeedbackWidget promptId={savedPromptId ?? undefined} userId={user?.uid} />
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
