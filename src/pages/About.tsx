import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BrandLogo } from '../components/ui/BrandLogo'

export function About() {
  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 flex flex-col items-center"
      >
        <div className="mb-4">
          <BrandLogo className="w-16 h-16 shadow-xl" />
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
          🎓 Capstone Education Project (CEP)
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          About PromptWise
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
          Bridging the AI literacy gap for students through conversational prompt engineering and interactive learning.
        </p>
      </motion.div>

      <div className="space-y-8">
        {/* The Problem & Vision */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <span>💡</span> The Core Philosophy
          </h2>
          <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
            Most students use Generative AI tools like ChatGPT or Gemini by entering short, vague queries like <code className="text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded font-medium">"Explain Python"</code> or <code className="text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded font-medium">"Make a PPT on AI"</code>. When the AI delivers generic or disappointing answers, students often conclude that AI isn't useful for complex academic work.
          </p>
          <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            Existing prompt rewrite tools just swap words magically. <strong className="text-slate-900 dark:text-white">PromptWise takes a radically different approach:</strong> it identifies what critical information is missing, asks 1–4 intelligent clarifying questions to uncover the user’s true intent, and then crafts a tailored prompt while explaining every single improvement made.
          </p>
        </div>

        {/* The Research & CEP Connection */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/[0.08]">
          <h2 className="text-xl font-bold text-slate-100 mb-3 flex items-center gap-2">
            <span>🔬</span> Research & Community Impact
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
            PromptWise was built as part of an academic Capstone Education Project (CEP) to evaluate how guided prompt improvement accelerates students' AI confidence and prompt engineering proficiency.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-2xl mb-1 block">📊</span>
              <h3 className="text-sm font-bold text-slate-200 mb-1">Pre & Post Testing</h3>
              <p className="text-xs text-slate-400">Measuring tangible gains in prompt quality and clarity before and after interactive sessions.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-2xl mb-1 block">🌱</span>
              <h3 className="text-sm font-bold text-slate-200 mb-1">Responsible AI</h3>
              <p className="text-xs text-slate-400">Educating students on data privacy, hallucination verification, and academic ethics.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-2xl mb-1 block">⚡</span>
              <h3 className="text-sm font-bold text-slate-200 mb-1">Edge Architecture</h3>
              <p className="text-xs text-slate-400">Powered by Cloudflare Workers and Google Gemini 3.6 Flash for sub-second, secure inference.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-6">
          <Link
            to="/improve"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-indigo-600/25"
          >
            <span>✨ Try the Improve Tool</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
