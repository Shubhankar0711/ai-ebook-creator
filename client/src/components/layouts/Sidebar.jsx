import { NavLink, useNavigate } from 'react-router-dom'
import {
 LayoutDashboard, BookOpen, PlusCircle, Heart,
 BarChart2, Settings, LogOut, BookMarked, Moon, Sun
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import clsx from 'clsx'

const navItems = [
 { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
 { to: '/books', icon: BookOpen, label: 'My Books' },
 { to: '/books/new', icon: PlusCircle, label: 'New Book' },
 { to: '/favorites', icon: Heart, label: 'Favorites' },
 { to: '/analytics', icon: BarChart2, label: 'Analytics' },
 { to: '/settings', icon: Settings, label: 'Settings' },
]

const Sidebar = ({ collapsed = false }) => {
 const { user, logout } = useAuth()
 const { darkMode, toggleDarkMode } = useTheme()
 const navigate = useNavigate()

 const handleLogout = () => { logout(); navigate('/') }

 return (
 <aside className={clsx(
 'flex flex-col h-full bg-white dark:bg-card',
 'border-r border-border dark:border-border transition-all duration-300',
 collapsed ? 'w-14' : 'w-56'
 )}>
 {/* Logo */}
 <div className={clsx(
 'flex items-center gap-2.5 h-14 border-b border-border dark:border-border shrink-0',
 collapsed ? 'justify-center px-0' : 'px-4'
 )}>
 <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shrink-0 shadow-brand">
 <BookMarked className="w-4 h-4 text-white" />
 </div>
 {!collapsed && (
 <div>
 <p className="font-bold text-xs text-text-secondary dark:text-white leading-tight">AI eBook Creator</p>
 <p className="text-[10px] text-text-secondary">Write smarter</p>
 </div>
 )}
 </div>

 {/* Nav */}
 <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
 {navItems.map(({ to, icon: Icon, label }) => (
 <NavLink key={to} to={to} end={to === '/dashboard'}
 className={({ isActive }) => clsx(
 'flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 group',
 collapsed && 'justify-center',
 isActive
 ? 'bg-primary text-white font-semibold shadow-sm'
 : 'text-text-secondary dark:text-text-secondary hover:bg-accent dark:hover:bg-accent hover:text-text dark:hover:text-text'
 )}>
 <Icon className={clsx(
 'shrink-0 transition-transform duration-150 group-hover:scale-105',
 collapsed ? 'w-5 h-5' : 'w-4 h-4'
 )} />
 {!collapsed && <span>{label}</span>}
 </NavLink>
 ))}
 </nav>

 {/* Bottom */}
 <div className="px-2 pb-3 pt-2 border-t border-border dark:border-border space-y-0.5">
 {user && (
 <div className={clsx(
 'flex items-center gap-2.5 px-2.5 py-2 rounded-xl',
 collapsed && 'justify-center'
 )}>
 <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
 {user.name?.charAt(0).toUpperCase()}
 </div>
 {!collapsed && (
 <div className="min-w-0">
 <p className="text-xs font-semibold truncate text-text-secondary dark:text-text-secondary">{user.name}</p>
 <p className="text-[10px] text-text-secondary truncate">{user.email}</p>
 </div>
 )}
 </div>
 )}

 <button onClick={toggleDarkMode}
 className={clsx(
 'flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-sm font-medium',
 'text-text-secondary dark:text-text-secondary hover:bg-card dark:hover:bg-card',
 'hover:text-text-secondary dark:hover:text-text-secondary transition-colors',
 collapsed && 'justify-center'
 )}>
 {darkMode ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
 {!collapsed && <span className="text-xs">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
 </button>

 <button onClick={handleLogout}
 className={clsx(
 'flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-sm font-medium',
 'text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors',
 collapsed && 'justify-center'
 )}>
 <LogOut className="w-4 h-4 shrink-0" />
 {!collapsed && <span className="text-xs">Logout</span>}
 </button>
 </div>
 </aside>
 )
}

export default Sidebar

