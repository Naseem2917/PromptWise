import { Link } from 'react-router-dom'
import { BrandLogo } from '../ui/BrandLogo'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-white/[0.06] pt-12 pb-10 bg-slate-50/50 dark:bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="col-span-2 sm:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <BrandLogo className="w-7 h-7" />
              <span className="text-slate-900 dark:text-slate-200 text-base font-bold">
                Prompt<span className="text-indigo-600 dark:text-indigo-400">Wise</span>
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Ask Better. Learn Better. The intelligent prompt engineering workbench powered by Gemini AI.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-300 uppercase tracking-wider mb-3">
              Tools
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/improve" className="hover:text-indigo-600 dark:hover:text-slate-200 transition-colors">
                  Improve Prompt
                </Link>
              </li>
              <li>
                <Link to="/practice" className="hover:text-indigo-600 dark:hover:text-slate-200 transition-colors">
                  Practice Arena
                </Link>
              </li>
              <li>
                <Link to="/examples" className="hover:text-indigo-600 dark:hover:text-slate-200 transition-colors">
                  Prompt Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Learn & Explore */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-300 uppercase tracking-wider mb-3">
              Learn
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/learn" className="hover:text-indigo-600 dark:hover:text-slate-200 transition-colors">
                  Masterclass Guide
                </Link>
              </li>
              <li>
                <Link to="/quiz" className="hover:text-indigo-600 dark:hover:text-slate-200 transition-colors">
                  Skills Quiz
                </Link>
              </li>
              <li>
                <Link to="/responsible-ai" className="hover:text-indigo-600 dark:hover:text-slate-200 transition-colors">
                  Responsible AI
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Account */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-300 uppercase tracking-wider mb-3">
              Community
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-slate-200 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-indigo-600 dark:hover:text-slate-200 transition-colors">
                  Prompt History
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="hover:text-indigo-600 dark:hover:text-slate-200 transition-colors">
                  Send Feedback
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-500">
          <p>© 2025 PromptWise. Built with Google Gemini & Cloudflare Workers.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-700 dark:hover:text-slate-400 transition-colors">
              About
            </Link>
            <Link to="/responsible-ai" className="hover:text-slate-700 dark:hover:text-slate-400 transition-colors">
              Safety & Ethics
            </Link>
            <Link to="/feedback" className="hover:text-slate-700 dark:hover:text-slate-400 transition-colors">
              Feedback
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
