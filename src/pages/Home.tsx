import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// ── Animation helpers ─────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' as const, delay },
})

// ── Data ──────────────────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Enter your prompt',
    desc: 'Write the prompt you were planning to give to an AI tool — even if it is short or vague.',
    icon: '✍️',
  },
  {
    step: '02',
    title: 'Answer smart questions',
    desc: 'PromptWise asks 1–4 targeted follow-up questions to understand exactly what you need.',
    icon: '💬',
  },
  {
    step: '03',
    title: 'Get a better prompt',
    desc: 'Receive a personalized, detailed prompt — plus an explanation of every improvement made.',
    icon: '✨',
  },
]

const FEATURES = [
  {
    icon: '🧠',
    title: 'Smart Questions',
    desc: 'No overwhelming forms. PromptWise asks only the questions that actually matter for your specific prompt.',
    color: 'from-indigo-500/20 to-indigo-500/5',
    border: 'border-indigo-500/20',
  },
  {
    icon: '📊',
    title: 'Prompt Score',
    desc: 'See a quality score before and after. Watch it jump from 40 to 90 as your prompt gets improved.',
    color: 'from-violet-500/20 to-violet-500/5',
    border: 'border-violet-500/20',
  },
  {
    icon: '📖',
    title: 'Learn Why',
    desc: 'Every change comes with a plain-English explanation. Learn the principles, not just the result.',
    color: 'from-purple-500/20 to-purple-500/5',
    border: 'border-purple-500/20',
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
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)',
          }}
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-6 text-center">
          {/* Badge */}
          <motion.div {...fadeUp(0)}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs sm:text-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              AI Literacy &amp; Prompt Engineering
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...fadeUp(0.1)}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight"
          >
            Ask Better.{' '}
            <span className="gradient-text">Learn Better.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            {...fadeUp(0.2)}
            className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Turn vague AI prompts into clear, personalized instructions — while learning{' '}
            <em className="text-slate-900 dark:text-slate-300 not-italic font-medium">why</em> effective prompting works.
          </motion.p>

          {/* CTAs */}
          <motion.div
            {...fadeUp(0.3)}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2 w-full sm:w-auto"
          >
            <Link
              to="/improve"
              id="hero-cta-primary"
              className="inline-flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-all duration-200 shadow-xl shadow-indigo-500/30 text-base cursor-pointer w-full sm:w-auto min-h-[44px]"
            >
              ✨ Improve My Prompt
            </Link>
            <a
              href="#how-it-works"
              id="hero-cta-secondary"
              className="inline-flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold px-6 py-3.5 rounded-2xl transition-all duration-200 text-base border border-slate-300 dark:border-white/[0.1] hover:border-slate-400 dark:hover:border-white/20 bg-white/80 dark:bg-white/[0.04] shadow-xs cursor-pointer w-full sm:w-auto min-h-[44px]"
            >
              Learn How It Works →
            </a>
          </motion.div>

          {/* Demonstration card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
            className="w-full max-w-2xl mx-auto mt-10"
          >
            <div className="glass-card rounded-2xl p-2 sm:p-2.5 shadow-xl shadow-indigo-500/5 dark:shadow-black/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="rounded-xl bg-red-500/[0.06] border border-red-500/20 p-4 text-left">
                  <p className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-widest mb-1.5">Before</p>
                  <p className="text-slate-800 dark:text-slate-300 text-sm font-medium">Explain Python</p>
                </div>
                <div className="rounded-xl bg-indigo-500/[0.06] border border-indigo-500/20 p-4 text-left">
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1.5">After</p>
                  <p className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed line-clamp-3">
                    Explain the fundamental concepts of Python to a beginner B.Sc. IT student, covering variables, data types, and loops with practical code examples…
                  </p>
                </div>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-500 text-xs mt-3">
              Prompt Quality Score: <span className="text-red-500 dark:text-red-400 font-semibold">38/100</span> → <span className="text-emerald-500 dark:text-emerald-400 font-semibold">91/100</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">How PromptWise Works</h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            A smarter way to improve prompts — through understanding, not just rewriting.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="glass-card rounded-2xl p-7 relative overflow-hidden group hover:border-indigo-500/30 dark:hover:border-white/[0.16] transition-colors duration-300"
            >
              <span className="absolute top-4 right-5 text-5xl font-black text-slate-200 dark:text-white/[0.05] select-none">
                {step.step}
              </span>

              <div className="text-3xl mb-4">{step.icon}</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
            More than a prompt rewriter
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            PromptWise is a learning tool disguised as a productivity tool.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={[
                'rounded-2xl border p-7 bg-white dark:bg-slate-900/60 shadow-xs border-slate-200 dark:border-white/[0.08] hover:border-indigo-500/30 transition-colors',
              ].join(' ')}
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Example ──────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">See the Difference</h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">A real before &amp; after from a student's prompt.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-red-200 dark:border-red-500/25 bg-red-50/70 dark:bg-red-500/[0.05] p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 shrink-0" />
              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">Original</span>
              <span className="ml-auto text-xs text-red-600/80 dark:text-red-400/80 font-semibold">Score: 15/100</span>
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-base sm:text-lg font-medium">{EXAMPLE.before}</p>
          </div>

          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/35 bg-indigo-50/70 dark:bg-indigo-500/[0.07] p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" />
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Improved</span>
              <span className="ml-auto text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Score: 91/100</span>
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line">{EXAMPLE.after}</p>
          </div>
        </motion.div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 max-w-4xl mx-auto px-4 sm:px-6 text-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-3xl p-8 sm:p-14 border border-indigo-500/30 shadow-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 100%)',
          }}
        >
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
            Ready to write better prompts?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Join students who are learning to use AI more effectively — one prompt at a time.
          </p>
          <Link
            to="/improve"
            id="bottom-cta"
            className="inline-flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl shadow-indigo-500/30 text-base cursor-pointer min-h-[44px]"
          >
            ✨ Start Improving →
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
