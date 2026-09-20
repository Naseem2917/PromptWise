import { Link, useLocation } from 'react-router-dom'
import {
  IconHome,
  IconBookOpen,
  IconSparkles,
  IconLightbulb,
  IconHelpCircle,
} from '../ui/Icons'

export function BottomNav() {
  const { pathname } = useLocation()

  const navItems = [
    {
      label: 'Home',
      to: '/',
      icon: <IconHome size={20} />,
    },
    {
      label: 'Learn',
      to: '/learn',
      icon: <IconBookOpen size={20} />,
    },
    {
      label: 'Improve',
      to: '/improve',
      special: true,
      icon: <IconSparkles size={22} />,
    },
    {
      label: 'Examples',
      to: '/examples',
      icon: <IconLightbulb size={20} />,
    },
    {
      label: 'Quiz',
      to: '/quiz',
      icon: <IconHelpCircle size={20} />,
    },
  ]

  return (
    <nav
      className="block md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#fbfbf9]/95 dark:bg-[#0d1117]/95 border-t border-[#e4e4de] dark:border-[#2a3342] shadow-[0_-2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 6px)' }}
    >
      <div className="max-w-md mx-auto px-3 pt-2 pb-1 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.to

          if (item.special) {
            return (
              <Link
                key={item.to}
                to={item.to}
                className="relative -top-3 flex flex-col items-center group cursor-pointer focus:outline-none"
              >
                <div className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-600/30 transform active:scale-95 transition-all">
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold mt-1 text-blue-600 dark:text-blue-400">
                  {item.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer min-w-[54px] min-h-[44px] ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {item.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
