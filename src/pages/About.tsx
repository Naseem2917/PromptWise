import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BrandLogo } from '../components/ui/BrandLogo'
import {
  IconGraduationCap,
  IconLightbulb,
  IconShield,
  IconZap,
  IconSparkles,
  IconArrowRight,
  IconCheckCircle,
} from '../components/ui/Icons'

export function About() {
  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-center mb-10 sm:mb-12 flex flex-col items-center"
      >
        <div className="mb-4">
          <BrandLogo className="w-14 h-14" />
        </div>
        <span className="inline-block font-mono text-xs font-semibold uppercase tracking-wider text-cobalt-600 dark:text-cobalt-400 mb-2">
          Community Engagement Projects (CEP) · Academic Initiative
        </span>
        <h1 className="font-serif-title text-3xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-3">
          About PromptWise
        </h1>
        <p className="font-serif italic text-lg sm:text-xl text-cobalt-700 dark:text-cobalt-300 font-medium mb-3">
          "Ask Better. Learn Better."
        </p>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          An interactive learning tool designed to help students master effective prompt writing through guided questions, clear explanations, and transparent scoring.
        </p>
      </motion.div>

      <div className="space-y-6 sm:space-y-8">
        {/* The Core Philosophy */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.3 }}
          className="workbench-card p-6 sm:p-8 shadow-2xs space-y-4"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-cobalt-600 dark:text-cobalt-400 flex items-center justify-center shrink-0">
              <IconLightbulb size={16} />
            </div>
            <h2 className="font-serif-title text-xl font-bold text-slate-900 dark:text-slate-100">
              The Pedagogical Philosophy
            </h2>
          </div>

          <div className="space-y-3 text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
            <p>
              Most students interact with AI models using brief, vague instructions—such as{' '}
              <code className="font-mono-code text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                "Explain cybersecurity"
              </code>{' '}
              or{' '}
              <code className="font-mono-code text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                "Help me with my research paper"
              </code>
              . When the language model generates generic or superficial output, learners mistakenly assume AI lacks the depth required for serious academic problem-solving.
            </p>
            <p>
              Standard prompt rewrites simply append generic adjectives or opaque prefixes. <strong className="text-slate-900 dark:text-slate-100 font-semibold">PromptWise treats prompting as a learning process:</strong> it looks at what is missing, asks a few targeted questions, and builds a clear, complete prompt while explaining the reasons behind every change.
            </p>
          </div>
        </motion.div>

        {/* Research & CEP Context */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.3 }}
          className="workbench-card p-6 sm:p-8 shadow-2xs space-y-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-cobalt-600 dark:text-cobalt-400 flex items-center justify-center shrink-0">
                <IconGraduationCap size={16} />
              </div>
              <h2 className="font-serif-title text-xl font-bold text-slate-900 dark:text-slate-100">
                Research &amp; Community Impact
              </h2>
            </div>
            <span className="font-mono text-[11px] font-semibold text-cobalt-700 dark:text-cobalt-300 bg-cobalt-500/10 border border-cobalt-500/25 px-2.5 py-1 rounded">
              CEP Topic: AI Literacy and Prompt Engineering Awareness for Students
            </span>
          </div>

          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
            PromptWise was created within the <strong className="text-slate-900 dark:text-slate-100 font-semibold">Community Engagement Projects (CEP)</strong> curriculum to explore how structured prompt engineering literacy empowers undergraduate students across diverse fields of study.
          </p>

          <div className="grid sm:grid-cols-3 gap-3.5 pt-1">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-cobalt-600 dark:text-cobalt-400 font-mono text-xs font-semibold">
                <IconCheckCircle size={15} />
                <span>Prompt Quality Check</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Evaluates your prompt across 6 key areas: goal, context, audience, details, format, and rules.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-sage-600 dark:text-sage-400 font-mono text-xs font-semibold">
                <IconShield size={15} />
                <span>Responsible AI</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Teaches data privacy boundaries, academic integrity guidelines, hallucination verification, and bias mitigation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-ochre-600 dark:text-ochre-400 font-mono text-xs font-semibold">
                <IconZap size={15} />
                <span>Fast &amp; Reliable</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Powered by Cloudflare Workers and Google Gemini API for fast, reliable suggestions whenever you need them.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Bar */}
        <div className="text-center pt-4">
          <Link
            to="/improve"
            className="group/btn inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs sm:text-sm font-semibold transition-colors shadow-xs"
          >
            <IconSparkles size={14} />
            <span>Try Prompt Improvement</span>
            <IconArrowRight size={14} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}
