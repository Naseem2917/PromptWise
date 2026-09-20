import { useTheme } from '../../contexts/ThemeContext'
import { IconSun, IconMoon } from './Icons'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center justify-center p-2 rounded-lg border transition-all duration-150 cursor-pointer min-h-[40px] min-w-[40px] ${
        theme === 'dark'
          ? 'bg-[#151b23] border-[#2a3342] text-amber-400 hover:bg-slate-800 hover:text-amber-300'
          : 'bg-white border-[#e4e4de] text-slate-700 hover:bg-slate-50 hover:text-blue-600 shadow-xs'
      } ${className}`}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle color theme"
    >
      {theme === 'dark' ? (
        <IconSun size={18} className="transition-transform hover:rotate-45" />
      ) : (
        <IconMoon size={18} className="transition-transform hover:-rotate-12" />
      )}
    </button>
  )
}
