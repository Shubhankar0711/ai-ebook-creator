import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Eye, EyeOff, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const strengthColors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-emerald-500']
const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

const passwordStrength = (pwd) => {
 let s = 0
 if (pwd.length >= 8) s++
 if (/[A-Z]/.test(pwd)) s++
 if (/[0-9]/.test(pwd)) s++
 if (/[^A-Za-z0-9]/.test(pwd)) s++
 return s
}

const RegisterPage = () => {
 const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
 const [showPwd, setShowPwd] = useState(false)
 const [loading, setLoading] = useState(false)
 const { register } = useAuth()
 const navigate = useNavigate()

 const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
 const strength = passwordStrength(form.password)

 const handleSubmit = async (e) => {
 e.preventDefault()
 if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
 if (form.password.length < 6) { toast.error('Password needs 6+ characters'); return }
 setLoading(true)
 try {
 await register(form.name, form.email, form.password)
 toast.success('Account created! Welcome 🎉')
 navigate('/dashboard')
 } catch (err) {
 toast.error(err.response?.data?.message || 'Registration failed')
 } finally {
 setLoading(false)
 }
 }

 return (
 <div className="min-h-screen flex items-center justify-center bg-card dark:bg-card p-4 py-10">
 <div className="w-full max-w-sm animate-slide-up">
 <div className="card p-8">
 {/* Logo */}
 <Link to="/" className="flex flex-col items-center gap-3 mb-8">
 <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shadow-brand">
 <BookOpen className="w-6 h-6 text-white" />
 </div>
 <div className="text-center">
 <h1 className="text-lg font-bold text-text-secondary dark:text-white">AI eBook Creator</h1>
 <p className="text-xs text-text-secondary mt-0.5">Create your free account</p>
 </div>
 </Link>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary mb-1.5">Full Name</label>
 <input type="text" name="name" value={form.name}
 onChange={handleChange} required placeholder="Your Name"
 className="input-field" />
 </div>

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
 onChange={handleChange} required placeholder="Min. 6 characters"
 className="input-field pr-10" />
 <button type="button" onClick={() => setShowPwd(p => !p)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-secondary transition-colors">
 {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 {form.password && (
 <div className="mt-2 space-y-1">
 <div className="flex gap-1">
 {[1, 2, 3, 4].map(i => (
 <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : 'bg-card dark:bg-card'}`} />
 ))}
 </div>
 <p className="text-[11px] text-text-secondary">{strengthLabels[strength]}</p>
 </div>
 )}
 </div>

 <div>
 <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary mb-1.5">Confirm Password</label>
 <div className="relative">
 <input type="password" name="confirm" value={form.confirm}
 onChange={handleChange} required placeholder="Repeat password"
 className="input-field pr-10" />
 {form.confirm && form.password === form.confirm && (
 <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
 )}
 </div>
 </div>

 <button type="submit" disabled={loading}
 className="btn-primary w-full py-2.5 mt-1">
 {loading ? <span className="spinner" /> : null}
 {loading ? 'Creating account…' : 'Create Free Account'}
 </button>
 </form>

 <p className="mt-6 text-center text-xs text-text-secondary">
 Already have an account?{' '}
 <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
 </p>
 </div>

 <p className="text-center text-xs text-text-secondary mt-4">
 <Link to="/" className="hover:text-text-secondary dark:hover:text-text-secondary transition-colors">← Back to homepage</Link>
 </p>
 </div>
 </div>
 )
}

export default RegisterPage

