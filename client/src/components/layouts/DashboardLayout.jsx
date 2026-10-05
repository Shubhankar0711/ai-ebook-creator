import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, PlusCircle, Heart,
  BarChart2, Settings, LogOut, Crown,
  Menu, X, Moon, Sun, ChevronDown, User
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import clsx from 'clsx'

const NAV_ITEMS = [
  { label: 'Dashboard',  icon: LayoutDashboard, path: '/dashboard'     },
  { label: 'My eBooks',  icon: BookOpen,        path: '/books'         },
  { label: 'Favorites',  icon: Heart,           path: '/favorites'     },
  { label: 'Analytics',  icon: BarChart2,       path: '/analytics'     },
  { label: 'Settings',   icon: Settings,        path: '/settings'      },
]

/* ── User dropdown ─────────────────────── */
const UserMenu = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors"
        style={{ background: 'transparent' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-accent)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="hidden sm:block text-left leading-tight">
          <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{user?.name}</p>
          <p className="text-[10px] truncate max-w-[130px]" style={{ color: 'var(--color-text-secondary)' }}>
            {user?.email}
          </p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform hidden sm:block ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--color-text-secondary)' }} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-48 rounded-xl shadow-lg py-1 animate-fade-in"
          style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <Link to="/settings" onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
            style={{ color: 'var(--color-text)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <User className="w-4 h-4" /> Profile & Settings
          </Link>
          <Link to="/pricing-plans" onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
            style={{ color: 'var(--color-primary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Crown className="w-4 h-4" /> Upgrade Plan
          </Link>
          <hr style={{ borderColor: 'var(--color-border)', margin: '4px 0' }} />
          <button onClick={() => { logout(); navigate('/') }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm w-full text-left transition-colors"
            style={{ color: 'var(--color-danger)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Layout ───────────────────────────── */
const DashboardLayout = () => {
  const { darkMode, toggleDarkMode } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-background)' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 w-60 flex flex-col transition-transform duration-300',
        'lg:relative lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )} style={{ background: 'var(--color-card)', borderRight: '1px solid var(--color-border)' }}>

        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}>
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>AI eBook Creator</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden"
            style={{ color: 'var(--color-text-secondary)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
            <NavLink key={path} to={path} end={path === '/dashboard'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary text-white font-semibold shadow-sm'
                  : 'text-text-secondary hover:bg-accent hover:text-text'
              )}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}

          {/* Upgrade link in sidebar */}
          <NavLink to="/pricing-plans"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 mt-3',
              isActive
                ? 'bg-primary text-white font-semibold shadow-sm'
                : 'text-primary hover:bg-accent'
            )}>
            <Crown className="w-4 h-4 shrink-0" />
            Upgrade Plan
          </NavLink>
        </nav>

        {/* Sidebar Footer */}
        <div className="px-5 py-4 shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
          <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            AI eBook Creator © 2026
          </p>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar — clean header with theme controls and user menu */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 shrink-0"
          style={{ background: 'var(--color-card)', borderBottom: '1px solid var(--color-border)' }}>

          {/* Mobile hamburger */}
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          {/* Right side: 2-Button Theme Segment + User menu (No duplicate New eBook button here!) */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--color-accent)', border: '1px solid var(--color-border)' }}>
              <button
                onClick={useTheme().setLightMode}
                title="Light Mode"
                className={clsx(
                  'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                  !darkMode ? 'bg-white text-gray-900 shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                )}>
                <Sun className="w-3.5 h-3.5 text-amber-500" /> Light
              </button>
              <button
                onClick={useTheme().setDarkMode}
                title="Dark Mode"
                className={clsx(
                  'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                  darkMode ? 'bg-indigo-600 text-white shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                )}>
                <Moon className="w-3.5 h-3.5 text-indigo-300" /> Dark
              </button>
            </div>
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--color-background)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
