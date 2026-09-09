import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctIdx: number
  explanation: string
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Which technique is most effective when you need an LLM to reliably output JSON matching an exact schema?',
    options: [
      'Asking the model repeatedly in ALL CAPS.',
      'Providing 2-3 input/output examples in the prompt (Few-Shot Prompting).',
      'Using a higher temperature parameter setting.',
      'Writing the prompt in Python instead of English.',
    ],
    correctIdx: 1,
    explanation: 'Few-Shot prompting anchors the model’s generation probability distribution to your exact schema and syntax, making it far more reliable than generic text instructions.',
  },
  {
    id: 2,
    question: 'What is the primary purpose of "Chain of Thought" (CoT) prompting (e.g. "Think step-by-step")?',
    options: [
      'To make the response as long as possible.',
      'To force the model to allocate intermediate token computation to reasoning before committing to a final answer.',
      'To bypass copyright and safety filters.',
      'To reduce the token cost of the API call.',
    ],
    correctIdx: 1,
    explanation: 'LLMs generate autoregressively token-by-token. Asking them to explain their reasoning step-by-step allows intermediate calculation tokens to guide subsequent logical deductions.',
  },
  {
    id: 3,
    question: 'Why should you wrap external user data or reference text in distinct delimiters (e.g., """ or <data></data>)?',
    options: [
      'It makes the prompt look prettier.',
      'It prevents prompt injection and helps the LLM distinguish system instructions from untrusted data.',
      'It speeds up API latency by 50%.',
      'It is required by the HTTP standard.',
    ],
    correctIdx: 1,
    explanation: 'Delimiters establish clear semantic boundaries, preventing untrusted input from overriding system instructions or being confused with operational rules.',
  },
  {
    id: 4,
    question: 'Which prompt is best suited to reduce factual hallucinations when summarizing an article?',
    options: [
      '"Summarize this article and be completely honest."',
      '"Summarize the text below using ONLY facts directly mentioned in the article. If the text does not contain the answer, state \'Not mentioned\'."',
      '"Summarize this article and guess what happened next."',
      '"Write a summary with maximum creativity and flair."',
    ],
    correctIdx: 1,
    explanation: 'Grounding the model strictly to provided text and explicitly providing an escape hatch ("state Not mentioned") is the gold standard for minimizing hallucinations.',
  },
  {
    id: 5,
    question: 'What is the key benefit of specifying "Negative Constraints" (e.g., "Do NOT use buzzwords", "Keep under 60 words")?',
    options: [
      'It stops the model from using the letter "E".',
      'It clips the generation probabilities of repetitive, fluffy corporate cliches and forces conciseness.',
      'It turns the AI model into a classifier.',
      'It lowers the temperature of the model to 0.0.',
    ],
    correctIdx: 1,
    explanation: 'Language models tend to produce agreeable, verbose filler by default. Negative constraints prune the generation space, ensuring tight, high-signal copy.',
  },
  {
    id: 6,
    question: 'When assigning a role to an AI (e.g. "You are a Principal Database Administrator"), what actually happens under the hood?',
    options: [
      'The AI connects to a remote SQL database.',
      'The prompt primes the model’s latent vector space towards vocabulary, depth, and heuristics typical of senior professionals.',
      'It unlocks secret paid features.',
      'The AI runs a background benchmark test.',
    ],
    correctIdx: 1,
    explanation: 'Role framing acts as a semantic prior, steering the model’s context attention toward technical rigor and expert-level terminology instead of general internet chatter.',
  },
]

import { useAuth } from '../contexts/AuthContext'
import { saveQuizResult } from '../lib/db'

export function Quiz() {
  const { user } = useAuth()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)

  const currentQ = QUESTIONS[currentIdx]

  const handleSelect = (idx: number) => {
    if (isAnswered) return
    setSelectedOption(idx)
    setIsAnswered(true)
    if (idx === currentQ.correctIdx) {
      setScore((s) => s + 1)
    }
  }

  const handleNext = () => {
    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx((i) => i + 1)
      setSelectedOption(null)
      setIsAnswered(false)
    } else {
      setQuizFinished(true)
      if (user) {
        saveQuizResult(user.uid, score, QUESTIONS.length).catch(console.error)
      }
    }
  }

  const handleRestart = () => {
    setCurrentIdx(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setScore(0)
    setQuizFinished(false)
  }

  const percentage = Math.round((score / QUESTIONS.length) * 100)

  const getRank = () => {
    if (percentage === 100) return { title: 'Prompt Grandmaster 🏆', desc: 'Flawless score! You have master-level intuition for prompt design and model psychology.' }
    if (percentage >= 80) return { title: 'Lead AI Engineer ⚡', desc: 'Exceptional work! You understand advanced prompting patterns, grounding, and constraints.' }
    if (percentage >= 50) return { title: 'Practitioner 🌱', desc: 'Solid foundation! A quick review of Few-Shot prompting and Delimiters will push you to top tier.' }
    return { title: 'Prompt Explorer 🚀', desc: 'Good start! Check out our Learn section to master the 6 core prompt elements.' }
  }

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
            <span>Question {currentIdx + 1} of {QUESTIONS.length}</span>
            <span>Score: {score}/{currentIdx + (isAnswered ? 1 : 0)}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-white/[0.05] h-1.5 rounded-full overflow-hidden mb-6">
            <div
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* Question Title */}
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
                {currentIdx + 1 === QUESTIONS.length ? 'See Final Results →' : 'Next Question →'}
              </button>
            </div>
          )}
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
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{score} / {QUESTIONS.length}</p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-white/10" />
            <div>
              <p className="text-xs text-slate-500 uppercase">Proficiency</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{percentage}%</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] dark:text-slate-300 dark:border-white/[0.1] text-sm font-semibold transition-colors cursor-pointer min-h-[44px]"
            >
              🔄 Retake Quiz
            </button>

            <Link
              to="/learn"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20 min-h-[44px] flex items-center justify-center"
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
