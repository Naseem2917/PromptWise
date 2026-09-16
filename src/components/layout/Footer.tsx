import { Link } from 'react-router-dom'
import { BrandLogo } from '../ui/BrandLogo'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-white/[0.06] pt-10 pb-28 md:pb-10 bg-slate-50/50 dark:bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Single Clean Fluid Flex Footer */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 sm:gap-12">
          {/* Brand Col */}
          <div className="md:max-w-sm space-y-3">
            <div className="flex items-center gap-2">
              <BrandLogo className="w-7 h-7" />
              <span className="text-slate-900 dark:text-slate-100 text-lg font-bold tracking-tight">
                Prompt<span className="text-indigo-600 dark:text-indigo-400">Wise</span>
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Ask Better. Learn Better. The intelligent prompt engineering workbench powered by Gemini AI.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
              © 2026 PromptWise. Designed &amp; Developed with ❤️ by{' '}
              <a
                href="https://github.com/Naseem2917"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Naseem Khan
              </a>
              .
            </p>
          </div>

          {/* Nav Links Container (2-col grid on mobile, 3-col on sm+) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-14 lg:gap-20">
            {/* Tools */}
            <div className="min-w-[110px]">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">
                Tools
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <Link to="/improve" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Improve Prompt
                  </Link>
                </li>
                <li>
                  <Link to="/examples" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Prompt Library
                  </Link>
                </li>
                <li>
                  <Link to="/quiz" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Skills Quiz
                  </Link>
                </li>
              </ul>
            </div>

            {/* Learn */}
            <div className="min-w-[110px]">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">
                Learn
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <Link to="/learn" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Masterclass Guide
                  </Link>
                </li>
                <li>
                  <Link to="/learn#responsible-ai" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Responsible AI
                  </Link>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div className="min-w-[110px]">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">
                Community
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/history" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Prompt History
                  </Link>
                </li>
                <li>
                  <Link to="/feedback" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Send Feedback
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    About
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
