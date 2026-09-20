import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  IconSearch,
  IconCopy,
  IconCheck,
  IconArrowRight,
  IconCheckCircle,
  IconX,
} from '../components/ui/Icons'

export type ExampleCategory =
  | 'Education'
  | 'Programming'
  | 'Research'
  | 'Writing'
  | 'Presentation'
  | 'Career'
  | 'Brainstorming'

interface PromptExample {
  id: string
  title: string
  category: ExampleCategory
  tags: string[]
  weakPrompt: string
  betterPrompt: string
  explanation: string
  score: number
}

const CATEGORIES: ('All' | ExampleCategory)[] = [
  'All',
  'Education',
  'Programming',
  'Research',
  'Writing',
  'Presentation',
  'Career',
  'Brainstorming',
]

const EXAMPLES: PromptExample[] = [
  {
    id: 'prog-java',
    title: 'Beginner-Friendly Java Banking System',
    category: 'Programming',
    tags: ['Java', 'OOP', 'Beginners'],
    weakPrompt: 'Write a Java program.',
    betterPrompt: `Write a clean, beginner-friendly Java console application simulating a simple Bank Account.

Requirements:
1. Account class with balance, deposit(), withdraw(), and getBalance() methods.
2. Handle insufficient funds with a clear console message without crashing.
3. Include inline comments explaining object-oriented principles (encapsulation).
4. Provide a main() method demonstrating 3 transactions.`,
    explanation: 'Replaces an open-ended request with explicit classes, error handling, educational comments, and a runnable demonstration.',
    score: 96,
  },
  {
    id: 'edu-cybersecurity',
    title: 'Cybersecurity Fundamentals for 1st Year Students',
    category: 'Education',
    tags: ['Cybersecurity', 'Networks', 'Socratic'],
    weakPrompt: 'Explain cybersecurity.',
    betterPrompt: `Explain the fundamental concepts of Cybersecurity to a 1st-year computer science student.
Topics to cover:
- CIA Triad (Confidentiality, Integrity, Availability) with real-world examples.
- Common attack vectors (Phishing, SQL Injection, DDoS).
- Essential defense practices for software developers.

Format:
- Use clear section headings, bullet points, and avoid heavy security jargon without immediate definitions.`,
    explanation: 'Defines the exact audience level (1st year CS) and key topics to prevent a generic superficial summary.',
    score: 94,
  },
  {
    id: 'pres-ai',
    title: '10-Slide Academic AI Presentation',
    category: 'Presentation',
    tags: ['Presentation', 'Slide Deck', 'AI Ethics'],
    weakPrompt: 'Make a PPT on AI.',
    betterPrompt: `Create a 10-slide outline for a 15-minute college seminar presentation titled "The Rise of Generative AI: Capabilities, Ethics, and Student Impact".

For each slide provide:
1. Slide Title
2. Visual/Graphic Suggestion (e.g. diagram, screenshot, or chart type)
3. 3 Bulleted Talking Points
4. Speaker Note (2 sentences) for the student presenter.`,
    explanation: 'Turns a vague presentation request into a structured slide-by-slide script with speaker notes and visual prompts.',
    score: 97,
  },
  {
    id: 'research-lit',
    title: 'Systematic Literature Review Framework',
    category: 'Research',
    tags: ['Literature Review', 'Methodology', 'Thesis'],
    weakPrompt: 'Help me with my research paper.',
    betterPrompt: `Act as an academic research advisor in Environmental Engineering.
Help me structure a literature review on "Microplastic Contamination in Freshwater Ecosystems".

Deliverable:
1. Conceptual framework matrix categorizing primary methodologies (Spectroscopy, Filtration).
2. 5 critical research gaps identified in papers published between 2020–2024.
3. Recommended structure for the methodology section with citation criteria.`,
    explanation: 'Focuses on actionable methodology matrices and research gaps rather than generic research tips.',
    score: 95,
  },
  {
    id: 'career-resume',
    title: 'Impact-Driven Software Resume Bullet Points',
    category: 'Career',
    tags: ['Resume', 'Internship', 'STAR Method'],
    weakPrompt: 'Improve my resume.',
    betterPrompt: `Rewrite the following software engineering internship project bullet points using the Google XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]".

Original experience:
- Built an internal dashboard for customer support
- Fixed API bugs in Node.js
- Wrote database queries

Constraints:
- Highlight quantitative metrics (latency reduction, ticket turnaround time).
- Keep each bullet to 1-2 lines maximum.
- Use strong action verbs (Architected, Spearheaded, Optimized).`,
    explanation: 'Enforces the recognized Google XYZ formula and quantifiable achievements.',
    score: 98,
  },
  {
    id: 'writing-rfc',
    title: 'Technical Design Specification (RFC)',
    category: 'Writing',
    tags: ['Architecture', 'RFC', 'System Design'],
    weakPrompt: 'Write a tech doc.',
    betterPrompt: `Draft a Request for Comments (RFC) technical design document for migrating our monolithic session storage to Redis Clusters.

Required Sections:
1. Context & Problem Statement
2. Proposed Architecture & Data Flow
3. Trade-offs (Consistency vs Availability under network partitions)
4. Rollback Plan & Zero-Downtime Migration Strategy
5. Open Questions for Engineering Peer Review.`,
    explanation: 'Specifies professional RFC document structure with architecture trade-offs and rollback strategies.',
    score: 96,
  },
  {
    id: 'brain-hackathon',
    title: 'Hackathon Project Ideation Matrix',
    category: 'Brainstorming',
    tags: ['Hackathon', 'AI Agents', 'Innovation'],
    weakPrompt: 'Give me hackathon ideas.',
    betterPrompt: `You are a hackathon mentor. Generate 4 unique, feasible project ideas for a 36-hour AI for Education hackathon using Gemini API and Cloudflare Workers.

For each idea include:
- Project Name & One-Line Hook
- Target Student Persona & Pain Point
- Technical Architecture & Key APIs
- Demo "Wow Factor" for judges
- 36-hour Feasibility Risk & Mitigation.`,
    explanation: 'Forces structured evaluation of hackathon feasibility, architecture, and judge criteria.',
    score: 97,
  },
]

export function Examples() {
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (typeof window === 'undefined') return 'All'
    return sessionStorage.getItem('pw_examples_cat') || 'All'
  })
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window === 'undefined') return ''
    return sessionStorage.getItem('pw_examples_search') || ''
  })
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    try {
      sessionStorage.setItem('pw_examples_cat', selectedCategory)
      sessionStorage.setItem('pw_examples_search', searchQuery)
    } catch {
      // ignore
    }
  }, [selectedCategory, searchQuery])

  const filtered = EXAMPLES.filter((ex) => {
    const matchCategory = selectedCategory === 'All' || ex.category === selectedCategory
    const matchSearch =
      ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchCategory && matchSearch
  })

  const copyPrompt = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
      {/* Editorial Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-10"
      >
        <span className="inline-block font-mono text-xs font-semibold uppercase tracking-wider text-cobalt-600 dark:text-cobalt-400 mb-2">
          Prompt Library &amp; Examples
        </span>
        <h1 className="font-serif-title text-3xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-3">
          Example Prompts
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Browse example prompts across common student subjects. Compare weak original prompts with improved versions, or load any example directly into the tool.
        </p>

        {/* Search & Filter Bar */}
        <div className="mt-8 flex flex-col gap-4 max-w-4xl mx-auto items-center">
          {/* Search input */}
          <div className="relative w-full max-w-md">
            <IconSearch
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, keyword, or #tag…"
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-cobalt-600 focus:ring-2 focus:ring-cobalt-500/20 transition-all shadow-2xs min-h-[42px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                aria-label="Clear search"
              >
                <IconX size={14} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center p-1 rounded-2xl bg-slate-200/50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-2xs">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={[
                    'px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all duration-150 cursor-pointer min-h-[34px] select-none',
                    isSelected
                      ? 'bg-blue-600 dark:bg-blue-600 text-white font-semibold shadow-sm border border-blue-700 dark:border-blue-500 ring-2 ring-blue-500/25'
                      : 'bg-white dark:bg-slate-950/70 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs',
                  ].join(' ')}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Grid of Examples */}
      <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
        <AnimatePresence>
          {filtered.map((example, i) => (
            <motion.div
              key={example.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className="workbench-card p-6 sm:p-7 shadow-2xs flex flex-col justify-between space-y-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div>
                {/* Header Metadata */}
                <div className="flex items-start justify-between gap-2 mb-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                  <span className="font-mono text-xs font-semibold text-cobalt-700 dark:text-cobalt-300 bg-cobalt-500/10 border border-cobalt-500/25 px-2.5 py-0.5 rounded">
                    {example.category}
                  </span>
                  <span className="font-mono text-xs font-bold text-sage-700 dark:text-sage-300 bg-sage-500/10 border border-sage-500/25 px-2.5 py-0.5 rounded inline-flex items-center gap-1.5">
                    <IconCheckCircle size={12} className="text-sage-600 dark:text-sage-400 shrink-0" />
                    <span>Score {example.score} / 100</span>
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 leading-snug">
                  {example.title}
                </h3>

                {/* Weak Prompt vs Better Prompt */}
                <div className="space-y-3 mb-4">
                  {/* Draft (Ochre) */}
                  <div className="rounded-xl bg-ochre-500/[0.04] dark:bg-ochre-500/[0.06] border border-ochre-500/30 p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-ochre-500 shrink-0" />
                      <span className="text-[11px] font-mono font-semibold text-ochre-700 dark:text-ochre-400 uppercase tracking-wider">
                        Original Prompt
                      </span>
                    </div>
                    <p className="font-mono-code text-xs text-slate-800 dark:text-slate-200">
                      "{example.weakPrompt}"
                    </p>
                  </div>

                  {/* Improved Prompt (Sage) */}
                  <div className="rounded-xl bg-sage-500/[0.04] dark:bg-sage-500/[0.06] border border-sage-500/35 p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sage-500 shrink-0" />
                      <span className="text-[11px] font-mono font-semibold text-sage-700 dark:text-sage-400 uppercase tracking-wider">
                        Improved Prompt
                      </span>
                    </div>
                    <pre className="font-mono-code text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950/80 p-3 rounded-lg border border-sage-500/25 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed shadow-2xs font-medium">
                      {example.betterPrompt}
                    </pre>
                  </div>
                </div>

                {/* Educational Takeaway */}
                <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed bg-slate-50/70 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800/70">
                  <IconCheckCircle size={14} className="text-sage-600 dark:text-sage-400 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-slate-900 dark:text-slate-100 font-semibold">Why it works:</strong>{' '}
                    {example.explanation}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {example.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800 gap-2">
                <button
                  type="button"
                  onClick={() => copyPrompt(example.betterPrompt, example.id)}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer min-h-[34px] inline-flex items-center gap-1.5 shadow-2xs"
                >
                  {copiedId === example.id ? (
                    <>
                      <IconCheck size={12} className="text-sage-600 dark:text-sage-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <IconCopy size={12} />
                      <span>Copy Prompt</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/improve?prompt=${encodeURIComponent(example.weakPrompt)}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 transition-colors min-h-[34px] inline-flex items-center"
                    title="See how PromptWise improves the weak version"
                  >
                    Test Draft →
                  </Link>

                  <Link
                    to={`/improve?prompt=${encodeURIComponent(example.betterPrompt)}`}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-mono font-semibold text-white transition-colors inline-flex items-center gap-1 shadow-xs min-h-[34px]"
                  >
                    <span>Use This Example</span>
                    <IconArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16 workbench-card shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <IconSearch size={20} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No example prompts found matching "{searchQuery}"
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-sm mx-auto">
            Try searching with a broader topic keyword or select a different category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('All')
            }}
            className="text-xs font-mono font-semibold text-cobalt-600 dark:text-cobalt-400 hover:underline pt-2 cursor-pointer"
          >
            Reset search and filters
          </button>
        </div>
      )}
    </div>
  )
}
