import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen, Plus, Clock, FileText,
  PenTool, Lightbulb, LayoutTemplate, Trash2, Target,
  Crown, Check, Zap, Sparkles, Building2, Sun, Moon
} from 'lucide-react'
import { bookService } from '../services/bookService'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import PaymentModal from '../components/ui/PaymentModal'

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const container = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const DashboardPage = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [books, setBooks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState(null)

  const currentPlan = user?.plan || 'free'

  useEffect(() => { fetchBooks() }, [])

  const fetchBooks = async () => {
    try {
      const { data } = await bookService.getBooks()
      setBooks(data.books || [])
    } catch {
      toast.error('Failed to load books')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return
    try {
      await bookService.deleteBook(id)
      setBooks(prev => prev.filter(b => b._id !== id))
      toast.success('Book deleted')
    } catch {
      toast.error('Failed to delete book')
    }
  }

  const handleUpgradePlan = (planId) => {
    if (planId === currentPlan || planId === 'free') return
    setSelectedPaymentPlan(planId)
  }

  // Compute stats
  const totalWords    = books.reduce((s, b) => s + (b.wordCount || 0), 0)
  const totalChapters = books.reduce((s, b) => s + (b.chapterCount || 0), 0)
  const completed     = books.filter(b => b.status === 'completed' || b.status === 'published').length
  const completion    = books.length > 0 ? Math.round((completed / books.length) * 100) : 0

  return (
    <div className="page-container">
      {/* Header — Single New Book button + 2-Button Theme Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Writer'} 👋
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              {currentPlan} plan
            </span>
          </div>
          <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
            Manage your eBooks, track progress, and generate content with Groq AI.
          </p>
        </div>

        {/* Action Toolbar: Single New eBook CTA button */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/books/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create New eBook
          </Link>
        </div>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={BookOpen} title="Books Created"  value={books.length} />
          <StatCard icon={FileText} title="Words Written"  value={totalWords.toLocaleString()} />
          <StatCard icon={Target}   title="Chapters"       value={totalChapters} />
          <StatCard icon={Clock}    title="Completion"     value={`${completion}%`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Books List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                Your eBooks
              </h2>
              <Link to="/books" className="text-sm text-primary hover:underline font-medium">View all ({books.length}) →</Link>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2].map(i => <div key={i} className="h-44 rounded-xl animate-pulse" style={{ background: 'var(--color-accent)' }} />)}
              </div>
            ) : books.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {books.slice(0, 4).map(book => (
                  <BookCard key={book._id} book={book}
                    onDelete={() => handleDelete(book._id)}
                    navigate={navigate} />
                ))}
              </div>
            ) : (
              <div className="card p-10 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'var(--color-accent)' }}>
                  <PenTool className="w-6 h-6" style={{ color: 'var(--color-text-secondary)' }} />
                </div>
                <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>No eBooks yet</h3>
                <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
                  Start by creating your first AI-assisted eBook outline.
                </p>
                <Link to="/books/new" className="btn-primary">
                  <Plus className="w-4 h-4" /> Start eBook Project
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="space-y-5">
            <div className="card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: 'var(--color-text-secondary)' }}>
                Quick Shortcuts
              </h3>
              <div className="space-y-1.5">
                <QuickAction
                  icon={Lightbulb}
                  title="Library Overview"
                  desc="Manage your complete eBook collection"
                  onClick={() => navigate('/books')} />
                <QuickAction
                  icon={LayoutTemplate}
                  title="Writing Analytics"
                  desc="Inspect word count and completion rates"
                  onClick={() => navigate('/analytics')} />
                <QuickAction
                  icon={Crown}
                  title="Pricing & Upgrade"
                  desc="Compare plans and upgrade features"
                  onClick={() => navigate('/pricing-plans')} />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: 'var(--color-text-secondary)' }}>
                Recent Activity
              </h3>
              {books.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  No activity recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {books.slice(0, 3).map(book => (
                    <div key={book._id} className="flex gap-3 items-start cursor-pointer group"
                      onClick={() => navigate(`/books/${book._id}/edit`)}>
                      <div className="w-2 h-2 rounded-full mt-2 shrink-0 bg-primary group-hover:scale-125 transition-transform" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors" style={{ color: 'var(--color-text)' }}>
                          "{book.title}"
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {formatDistanceToNow(new Date(book.updatedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </motion.div>

      {selectedPaymentPlan && (
        <PaymentModal
          planId={selectedPaymentPlan}
          onClose={() => setSelectedPaymentPlan(null)}
          onSuccess={fetchBooks}
        />
      )}
    </div>
  )
}

function StatCard({ icon: Icon, title, value }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{title}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--color-accent)' }}>
          <Icon className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{value}</p>
    </motion.div>
  )
}

function QuickAction({ icon: Icon, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left"
      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-accent)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <Icon className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{title}</p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
      </div>
    </button>
  )
}

function BookCard({ book, onDelete, navigate }) {
  const progress = Math.min(100, (book.chapterCount || 0) * 10)
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, scale: 0.97 }, show: { opacity: 1, scale: 1 } }}
      className="card cursor-pointer hover:shadow-md transition-all flex flex-col"
      onClick={() => navigate(`/books/${book._id}/edit`)}>
      <div className="p-4 flex-1">
        <div className="flex justify-between items-start mb-3">
          <span className="badge capitalize">{book.genre || 'other'}</span>
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-danger)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <h3 className="font-semibold text-sm line-clamp-2 mb-1" style={{ color: 'var(--color-text)' }}>
          {book.title}
        </h3>
        <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(book.updatedAt), { addSuffix: true })}
        </p>
      </div>
      <div className="px-4 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
          <span>Progress</span><span>{progress}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-accent)' }}>
          <div className="h-full rounded-full transition-all duration-500 bg-primary"
            style={{ width: `${progress}%` }} />
        </div>
      </div>
    </motion.div>
  )
}

export default DashboardPage
