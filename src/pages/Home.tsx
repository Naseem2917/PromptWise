import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  IconSparkles,
  IconArrowRight,
  IconBookOpen,
  IconHelpCircle,
  IconCheckCircle,
  IconFileText,
} from '../components/ui/Icons'

// ── Animation helpers ─────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: 'easeOut' as const, delay },
})

// ── Data ──────────────────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: '01',
    label: 'Step 01',
    title: 'Enter your prompt',
    desc: 'Write the prompt you were planning to give to an AI tool — even if it is short or vague.',
    IconComponent: IconFileText,
  },
  {
    step: '02',
    label: 'Step 02',
    title: 'Answer smart questions',
    desc: 'PromptWise asks 1–4 targeted follow-up questions to understand exactly what you need.',
    IconComponent: IconHelpCircle,
  },
  {
    step: '03',
    label: 'Step 03',
    title: 'Get a better prompt',
    desc: 'Receive a personalized, detailed prompt — plus an explanation of every improvement made.',
    IconComponent: IconSparkles,
  },
]

const FEATURES = [
  {
    IconComponent: IconHelpCircle,
    iconColor: 'text-blue-600 dark:text-blue-400',
    title: 'Smart Questions',
    desc: 'No overwhelming forms. PromptWise asks only the questions that actually matter for your specific prompt.',
  },
  {
    IconComponent: IconCheckCircle,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    title: 'Prompt Score',
    desc: 'See a quality score before and after. Watch it jump from 40 to 90 as your prompt gets improved.',
  },
  {
    IconComponent: IconBookOpen,
    iconColor: 'text-amber-600 dark:text-amber-400',
    title: 'Learn Why',
    desc: 'Every change comes with a plain-English explanation. Learn the principles, not just the result.',
  },
]

const EXAMPLE = {
  before: 'Explain Python',
  after:
    'Explain the fundamental concepts of Python programming to a beginner B.Sc. IT student.\n\nCover variables, data types, operators, conditional statements, loops, and functions.\n\nExplain each concept in simple language and include a short, practical code example for each one. Organize the response with clear headings.',
}

// ── Component ─────────────────────────────────────────────────────────────────
export function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-6 pb-16 sm:pt-10 sm:pb-24 border-b border-[#e4e4de]/60 dark:border-[#2a3342]/60">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-6 text-center">
          {/* Badge */}
          <motion.div {...fadeUp(0)}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#e4e4de] dark:border-[#2a3342] bg-white dark:bg-[#151b23] text-slate-700 dark:text-slate-300 text-xs font-mono font-medium shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              AI Literacy &amp; Prompt Engineering
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...fadeUp(0.08)}
            className="font-serif font-serif-title text-4xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-[1.1] tracking-tight"
          >
            Ask Better.{' '}
            <span className="text-blue-600 dark:text-blue-400">Learn Better.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            {...fadeUp(0.16)}
            className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Turn vague AI prompts into clear, personalized instructions — while learning{' '}
            <em className="text-slate-900 dark:text-slate-200 not-italic font-medium">why</em> effective prompting works.
          </motion.p>

          {/* CTAs */}
          <motion.div
            {...fadeUp(0.24)}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-2 w-full sm:w-auto"
          >
            <Link
              to="/improve"
              id="hero-cta-primary"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium px-6 py-3.5 rounded-lg transition-all duration-150 shadow-xs text-sm sm:text-base cursor-pointer w-full sm:w-auto min-h-[44px]"
            >
              <IconSparkles size={18} />
              <span>Improve My Prompt</span>
            </Link>
            <a
              href="#how-it-works"
              id="hero-cta-secondary"
              className="group/btn inline-flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium px-6 py-3.5 rounded-lg transition-all duration-150 text-sm sm:text-base border border-[#e4e4de] dark:border-[#2a3342] bg-white dark:bg-[#151b23] hover:border-slate-400 dark:hover:border-slate-500 shadow-xs cursor-pointer w-full sm:w-auto min-h-[44px]"
            >
              <span>Learn How It Works</span>
              <IconArrowRight size={16} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
            </a>
          </motion.div>

          {/* Demonstration card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.32, ease: 'easeOut' }}
            className="w-full max-w-2xl mx-auto mt-8"
          >
            <div className="workbench-card rounded-xl p-3 sm:p-4 border border-[#e4e4de] dark:border-[#2a3342] bg-white dark:bg-[#151b23] shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg bg-amber-500/[0.05] border border-amber-500/25 p-4 text-left">
                  <p className="text-[11px] font-mono font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1.5">
                    Original Prompt
                  </p>
                  <p className="text-slate-800 dark:text-slate-200 text-sm font-mono font-medium">
                    {EXAMPLE.before}
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-500/[0.05] border border-emerald-500/25 p-4 text-left">
                  <p className="text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5">
                    Improved Prompt
                  </p>
                  <p className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-mono leading-relaxed line-clamp-3">
                    {EXAMPLE.after}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-3 flex items-center justify-center gap-2 font-mono">
              <span>Prompt Quality:</span>
              <span className="text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                38/100
              </span>
              <span className="text-slate-400">→</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                91/100 (+53 pts)
              </span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            How PromptWise Works
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            A structured method to improve prompts — through understanding, not blind guessing.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = step.IconComponent
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="workbench-card rounded-xl p-6 border border-[#e4e4de] dark:border-[#2a3342] bg-white dark:bg-[#151b23] relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Icon size={20} />
                    </div>
                    <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {step.label}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 w-full border-t border-[#e4e4de]/60 dark:border-[#2a3342]/60">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            More than a prompt rewriter
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            PromptWise helps you write better prompts while teaching you how AI thinks.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.IconComponent
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="workbench-card rounded-xl p-6 border border-[#e4e4de] dark:border-[#2a3342] bg-white dark:bg-[#151b23]"
              >
                <div className={`w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-[#e4e4de] dark:border-[#2a3342] flex items-center justify-center mb-4 ${f.iconColor}`}>
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── Example ──────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 w-full border-t border-[#e4e4de]/60 dark:border-[#2a3342]/60">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            See the Difference
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            A real before &amp; after from a student's prompt.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto"
        >
          <div className="rounded-xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/[0.04] p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 shrink-0" />
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Original Prompt
              </span>
              <span className="ml-auto text-xs font-mono text-amber-700 dark:text-amber-400 font-semibold bg-amber-100/60 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Score: 15/100
              </span>
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-base font-mono leading-relaxed">
              {EXAMPLE.before}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/[0.04] p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" />
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Improved Prompt
              </span>
              <span className="ml-auto text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-100/60 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Score: 91/100
              </span>
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-mono leading-relaxed whitespace-pre-line">
              {EXAMPLE.after}
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 text-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="workbench-card rounded-2xl p-8 sm:p-14 border border-[#e4e4de] dark:border-[#2a3342] bg-white dark:bg-[#151b23] shadow-xs"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-4">
            <IconSparkles size={24} />
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Ready to write better prompts?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Join students who are learning to use AI more effectively — one prompt at a time.
          </p>
          <Link
            to="/improve"
            id="bottom-cta"
            className="group/btn inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium px-8 py-3.5 rounded-lg transition-all duration-150 shadow-xs text-base cursor-pointer min-h-[44px]"
          >
            <span>Start Improving</span>
            <IconArrowRight size={18} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
