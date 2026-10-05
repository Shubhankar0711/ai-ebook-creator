import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const LoginPage = () => {
 const [form, setForm] = useState({ email: '', password: '' })
 const [showPwd, setShowPwd] = useState(false)
 const [loading, setLoading] = useState(false)
 const { login } = useAuth()
 const navigate = useNavigate()

 const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

 const handleSubmit = async (e) => {
 e.preventDefault()
 setLoading(true)
 try {
 await login(form.email, form.password)
 toast.success('Welcome back!')
 navigate('/dashboard')
 } catch (err) {
 toast.error(err.response?.data?.message || 'Login failed')
 } finally {
 setLoading(false)
 }
 }

 return (
 <div className="min-h-screen flex items-center justify-center bg-card dark:bg-card p-4">
 <div className="w-full max-w-sm animate-slide-up">
 {/* Card */}
 <div className="card p-8">
 {/* Logo */}
 <Link to="/" className="flex flex-col items-center gap-3 mb-8">
 <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shadow-brand">
 <BookOpen className="w-6 h-6 text-white" />
 </div>
 <div className="text-center">
 <h1 className="text-lg font-bold text-text-secondary dark:text-white">AI eBook Creator</h1>
 <p className="text-xs text-text-secondary mt-0.5">Sign in to your account</p>
 </div>
 </Link>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary mb-1.5">Email</label>
 <input type="email" name="email" value={form.email}
 onChange={handleChange} required placeholder="you@example.com"
 className="input-field" />
 </div>

 <div>
 <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary mb-1.5">Password</label>
 <div className="relative">
 <input type={showPwd ? 'text' : 'password'} name="password" value={form.password}
 onChange={handleChange} required placeholder="••••••••"
 className="input-field pr-10" />
 <button type="button" onClick={() => setShowPwd(p => !p)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-secondary transition-colors">
 {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 </div>

 <button type="submit" disabled={loading}
 className="btn-primary w-full py-2.5 mt-1">
 {loading ? <span className="spinner" /> : null}
 {loading ? 'Signing in…' : 'Sign In'}
 </button>
 </form>

 <p className="mt-6 text-center text-xs text-text-secondary">
 No account?{' '}
 <Link to="/register" className="text-primary font-semibold hover:underline">Create one free</Link>
 </p>
 </div>

 <p className="text-center text-xs text-text-secondary mt-4">
 <Link to="/" className="hover:text-text-secondary dark:hover:text-text-secondary transition-colors">← Back to homepage</Link>
 </p>
 </div>
 </div>
 )
}

export default LoginPage

