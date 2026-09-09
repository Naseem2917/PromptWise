import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

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
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

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
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
          📚 Categorized Prompt Library
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Curated High-Impact Examples
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
          Explore production-grade prompts categorized by student use case. Click "Use This Example" to send directly to the PromptWise improvement engine.
        </p>

        {/* Search & Filter Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
          {/* Search input */}
          <div className="relative w-full sm:w-72">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic or tag…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs min-h-[44px]"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer min-h-[36px] ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/[0.06] shadow-xs'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <AnimatePresence>
          {filtered.map((example, i) => (
            <motion.div
              key={example.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-indigo-500/30 transition-all duration-200"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium border border-indigo-200 dark:border-indigo-500/20">
                    {example.category}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span>⚡ Prompt Score:</span>
                    <span>{example.score}/100</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{example.title}</h3>

                {/* Weak Prompt vs Better Prompt */}
                <div className="space-y-3 mb-4">
                  <div className="p-3 rounded-xl bg-red-50/80 dark:bg-red-500/[0.05] border border-red-200 dark:border-red-500/20">
                    <span className="text-[11px] font-bold text-red-600 dark:text-red-400 block mb-1 uppercase tracking-wide">
                      ❌ Weak Original:
                    </span>
                    <p className="text-xs font-mono text-slate-800 dark:text-slate-300">"{example.weakPrompt}"</p>
                  </div>

                  <div className="relative">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1 uppercase tracking-wide">
                      ✅ PromptWise Engineered Version:
                    </span>
                    <pre className="text-xs font-mono text-slate-900 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-xl border border-slate-200 dark:border-white/[0.08] whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed shadow-xs">
                      {example.betterPrompt}
                    </pre>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-xs mb-4 leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-200 font-semibold">Why it works:</strong> {example.explanation}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {example.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.03] px-2 py-0.5 rounded border border-slate-200 dark:border-white/[0.04]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/[0.06] gap-2">
                <button
                  onClick={() => copyPrompt(example.betterPrompt, example.id)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-xs text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-white/[0.08] transition-colors cursor-pointer min-h-[36px]"
                >
                  {copiedId === example.id ? '✅ Copied' : '📋 Copy Prompt'}
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/improve?prompt=${encodeURIComponent(example.weakPrompt)}`}
                    className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-xs text-indigo-600 dark:text-indigo-300 font-medium border border-slate-200 dark:border-white/[0.08] transition-colors min-h-[36px] flex items-center"
                    title="See how PromptWise improves the weak version"
                  >
                    Test Weak →
                  </Link>

                  <Link
                    to={`/improve?prompt=${encodeURIComponent(example.betterPrompt)}`}
                    className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-semibold transition-colors inline-flex items-center gap-1 shadow-md shadow-indigo-600/20 min-h-[36px]"
                  >
                    <span>Use This Example</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 glass-card rounded-2xl shadow-sm">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-slate-800 dark:text-slate-300 font-medium">No prompts found matching your search</p>
          <p className="text-slate-500 text-xs mt-1">Try another keyword or category filter</p>
        </div>
      )}
    </div>
  )
}
