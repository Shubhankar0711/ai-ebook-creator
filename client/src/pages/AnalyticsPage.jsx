import { useEffect, useState } from 'react'
import { BookOpen, FileText, Clock, Star, TrendingUp, BarChart2 } from 'lucide-react'
import { userService } from '../services/bookService'
import StatCard from '../components/ui/StatCard'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { formatRelativeDate, GENRE_ICONS, STATUS_COLORS } from '../utils/helpers'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const AnalyticsPage = () => {
 const [data, setData] = useState(null)
 const [loading, setLoading] = useState(true)

 useEffect(() => {
 userService.getAnalytics()
 .then(({ data }) => setData(data.analytics))
 .catch(() => toast.error('Failed to load analytics'))
 .finally(() => setLoading(false))
 }, [])

 if (loading) return (
 <div className="flex items-center justify-center h-64">
 <LoadingSpinner size="lg" />
 </div>
 )

 return (
 <div className="p-6 space-y-8 animate-fade-in">
 <div>
 <h1 className="text-2xl font-bold text-text dark:text-text-secondary">Analytics</h1>
 <p className="text-sm text-text-secondary dark:text-text-secondary mt-1">Your writing stats and progress</p>
 </div>

 {/* Stats grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <StatCard icon={BookOpen} label="Total Books" value={data?.totalBooks || 0} color="brand" />
 <StatCard icon={FileText} label="Total Words" value={(data?.totalWords || 0).toLocaleString()} color="violet" />
 <StatCard icon={Clock} label="Reading Time" value={`${data?.totalReadingTime || 0}m`} color="blue" />
 <StatCard icon={Star} label="Favorites" value={data?.favoriteBooks || 0} color="orange" />
 </div>

 {/* Book status breakdown */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 {[
 { label: 'Draft', value: data?.draftBooks || 0, color: 'bg-gray-400' },
 { label: 'In Progress', value: (data?.totalBooks || 0) - (data?.draftBooks || 0) - (data?.completedBooks || 0), color: 'bg-blue-500' },
 { label: 'Completed', value: data?.completedBooks || 0, color: 'bg-green-500' },
 ].map(({ label, value, color }) => (
 <div key={label} className="card p-5 flex items-center gap-4">
 <div className={`w-3 h-3 rounded-full ${color} shrink-0`} />
 <div>
 <p className="text-2xl font-bold text-text dark:text-text-secondary">{value}</p>
 <p className="text-sm text-text-secondary dark:text-text-secondary">{label}</p>
 </div>
 </div>
 ))}
 </div>

 {/* Recent books */}
 {data?.recentBooks?.length > 0 && (
 <div>
 <h2 className="text-lg font-semibold text-text dark:text-text-secondary mb-4">Recent Books</h2>
 <div className="card divide-y divide-border dark:divide-border">
 {data.recentBooks.map(book => (
 <Link key={book._id} to={`/books/${book._id}/edit`}
 className="flex items-center gap-4 px-5 py-4 hover:bg-background dark:hover:bg-card transition-colors">
 <span className="text-2xl">{GENRE_ICONS[book.genre] || '📖'}</span>
 <div className="flex-1 min-w-0">
 <p className="font-semibold text-sm text-text dark:text-text-secondary truncate">{book.title}</p>
 <p className="text-xs text-text-secondary">{(book.wordCount || 0).toLocaleString()} words</p>
 </div>
 <div className="text-right">
 <span className={clsx('px-2.5 py-1 rounded-full text-xs font-medium capitalize', STATUS_COLORS[book.status])}>
 {book.status}
 </span>
 <p className="text-xs text-text-secondary mt-1">{formatRelativeDate(book.updatedAt)}</p>
 </div>
 </Link>
 ))}
 </div>
 </div>
 )}

 {/* Recent activity */}
 {data?.recentActivity?.length > 0 && (
 <div>
 <h2 className="text-lg font-semibold text-text dark:text-text-secondary mb-4">Activity Log</h2>
 <div className="card divide-y divide-border dark:divide-border">
 {data.recentActivity.map((act, i) => (
 <div key={i} className="flex items-center gap-3 px-5 py-3">
 <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
 <p className="text-sm text-text dark:text-text-secondary flex-1">
 <span className="capitalize font-medium text-primary dark:text-primary">{act.action}</span>
 {' '}"{act.bookTitle}"
 </p>
 <p className="text-xs text-text-secondary shrink-0">{formatRelativeDate(act.timestamp)}</p>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 )
}

export default AnalyticsPage


