import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Menu, X, Moon, Sun, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const Navbar = () => {
 const [open, setOpen] = useState(false)
 const { user, logout } = useAuth()
 const { darkMode, toggleDarkMode } = useTheme()

 const navLinks = [
 { href: '#features', label: 'Features' },
 { href: '#pricing', label: 'Pricing' },
 { href: '#faq', label: 'FAQ' },
 ]

 return (
 <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-card/90 backdrop-blur-xl border-b border-border/80 dark:border-border">
 <div className="page-container">
 <div className="flex items-center justify-between h-14">

 {/* Logo */}
 <Link to="/" className="flex items-center gap-2.5 group">
 <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-brand">
 <BookOpen className="w-4 h-4 text-white" />
 </div>
 <span className="font-bold text-sm text-text-secondary dark:text-white hidden sm:block">
 AI eBook Creator
 </span>
 </Link>

 {/* Desktop Nav */}
 <div className="hidden md:flex items-center gap-1">
 {!user && navLinks.map(l => (
 <a key={l.href} href={l.href}
 className="px-3 py-1.5 text-sm font-medium text-text-secondary dark:text-text-secondary hover:text-text-secondary dark:hover:text-white rounded-lg hover:bg-card dark:hover:bg-card transition-colors">
 {l.label}
 </a>
 ))}
 </div>

 {/* Right */}
 <div className="flex items-center gap-1.5">
 <button onClick={toggleDarkMode}
 className="btn-ghost p-2"
 aria-label="Toggle dark mode">
 {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
 </button>

 {user ? (
 <div className="flex items-center gap-2">
 <Link to="/dashboard" className="btn-secondary text-xs hidden sm:flex">Dashboard</Link>
 <button onClick={logout} className="btn-ghost text-xs hidden sm:block">Logout</button>
 <Link to="/dashboard">
 <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-xs">
 {user.name?.charAt(0).toUpperCase()}
 </div>
 </Link>
 </div>
 ) : (
 <div className="hidden sm:flex items-center gap-2">
 <Link to="/login" className="btn-ghost text-sm">Login</Link>
 <Link to="/register" className="btn-primary text-xs py-2 px-3.5">
 <Sparkles className="w-3.5 h-3.5" /> Get Started
 </Link>
 </div>
 )}

 <button onClick={() => setOpen(!open)} className="md:hidden btn-ghost p-2">
 {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
 </button>
 </div>
 </div>
 </div>

 {/* Mobile Menu */}
 {open && (
 <div className="md:hidden bg-white dark:bg-card border-t border-border dark:border-border px-4 py-3 space-y-1 animate-slide-up">
 {!user && navLinks.map(l => (
 <a key={l.href} href={l.href} onClick={() => setOpen(false)}
 className="block py-2 px-3 rounded-xl text-sm text-text-secondary dark:text-text-secondary hover:bg-card dark:hover:bg-card transition-colors">
 {l.label}
 </a>
 ))}
 {user ? (
 <>
 <Link to="/dashboard" onClick={() => setOpen(false)}
 className="block py-2 px-3 rounded-xl text-sm text-text-secondary dark:text-text-secondary hover:bg-card dark:hover:bg-card">
 Dashboard
 </Link>
 <button onClick={() => { logout(); setOpen(false) }}
 className="block w-full text-left py-2 px-3 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
 Logout
 </button>
 </>
 ) : (
 <div className="flex gap-2 pt-2">
 <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary text-sm flex-1 text-center">Login</Link>
 <Link to="/register" onClick={() => setOpen(false)} className="btn-primary text-sm flex-1 text-center">Sign Up</Link>
 </div>
 )}
 </div>
 )}
 </nav>
 )
}

export default Navbar

