export const formatDate = (date) => {
 if (!date) return ''
 return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date))
}

export const formatRelativeDate = (date) => {
 if (!date) return ''
 const now = new Date(), d = new Date(date)
 const diff = Math.floor((now - d) / 1000)
 if (diff < 60) return 'just now'
 if (diff < 3600) return `${Math.floor(diff/60)}m ago`
 if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
 if (diff < 604800) return `${Math.floor(diff/86400)}d ago`
 return formatDate(date)
}

export const wordCount = (text) => {
 if (!text) return 0
 const stripped = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
 return stripped ? stripped.split(' ').filter(w => w.length > 0).length : 0
}

export const readingTime = (words) => {
 const mins = Math.ceil(words / 200)
 return mins < 1 ? '< 1 min' : `${mins} min read`
}

export const truncate = (str, n = 100) => {
 if (!str) return ''
 return str.length > n ? str.slice(0, n) + '…' : str
}

export const downloadBlob = (blob, filename) => {
 const url = window.URL.createObjectURL(blob)
 const a = document.createElement('a')
 a.href = url; a.setAttribute('download', filename)
 document.body.appendChild(a); a.click(); a.remove()
 window.URL.revokeObjectURL(url)
}

export const GENRES = [
 'fiction','non-fiction','self-help','business','technology',
 'science','history','biography','fantasy','romance',
 'mystery','thriller','education','children','poetry','other'
]

export const TONES = ['professional','casual','academic','conversational','inspirational','humorous','formal','creative']

export const LANGUAGES = [
 'English','Spanish','French','German','Italian','Portuguese',
 'Chinese','Japanese','Arabic','Hindi','Russian','Korean'
]

export const STATUS_COLORS = {
 draft: 'bg-accent text-text-secondary dark:bg-card dark:text-text-secondary',
 'in-progress':'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
 completed: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
 published: 'bg-accent text-primary dark:bg-accent dark:text-primary',
}

export const GENRE_ICONS = {
 fiction:'📖','non-fiction':'📚','self-help':'💡',business:'💼',technology:'💻',
 science:'🔬',history:'🏛️',biography:'👤',fantasy:'🧙',romance:'💕',
 mystery:'🔍',thriller:'😱',education:'🎓',children:'🧸',poetry:'✍️',other:'📄'
}

// Colorful cover schemes for book cards (matching reference image style)
export const DUMMY_COVER_COLORS = [
 { bg: 'bg-gradient-to-br from-orange-400 via-red-500 to-pink-600', circle: 'bg-yellow-300', text: 'text-white' },
 { bg: 'bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600', circle: 'bg-accent', text: 'text-white' },
 { bg: 'bg-gradient-to-br from-yellow-300 via-orange-400 to-amber-500', circle: 'bg-white', text: 'text-text' },
 { bg: 'bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600', circle: 'bg-teal-200', text: 'text-white' },
 { bg: 'bg-gradient-to-br from-pink-400 via-rose-500 to-red-600', circle: 'bg-pink-200', text: 'text-white' },
 { bg: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600', circle: 'bg-emerald-200', text: 'text-white' },
 { bg: 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-900', circle: 'bg-slate-400', text: 'text-white' },
 { bg: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500', circle: 'bg-amber-100', text: 'text-text' },
 { bg: 'bg-gradient-to-br from-blue-400 via-indigo-500 to-violet-600', circle: 'bg-blue-200', text: 'text-white' },
 { bg: 'bg-gradient-to-br from-fuchsia-400 via-pink-500 to-rose-600', circle: 'bg-fuchsia-200', text: 'text-white' },
]

// Dummy eBooks for empty state / demo purposes
export const DUMMY_BOOKS = [
 { _id: 'demo-1', title: 'Anxiety Alchemy', author: 'Alex Parker', genre: 'self-help', status: 'published', chapterCount: 12, wordCount: 24000, readingTime: 120 },
 { _id: 'demo-2', title: 'From Chaos to Clarity', author: 'Alex Doe', genre: 'self-help', status: 'completed', chapterCount: 8, wordCount: 18000, readingTime: 90 },
 { _id: 'demo-3', title:"The Introvert's Guide to Networking", author: 'Alex Doe', genre: 'business', status: 'published', chapterCount: 10, wordCount: 21000, readingTime: 105 },
 { _id: 'demo-4', title: 'Plant-Based on a Budget', author: 'Alex Doe', genre: 'non-fiction', status: 'completed', chapterCount: 15, wordCount: 30000, readingTime: 150 },
 { _id: 'demo-5', title: 'The Blueprint', author: 'Alex Doe', genre: 'business', status: 'draft', chapterCount: 5, wordCount: 9000, readingTime: 45 },
 { _id: 'demo-6', title: 'Morning Rituals', author: 'Alex Doe', genre: 'self-help', status: 'draft', chapterCount: 7, wordCount: 14000, readingTime: 70 },
 { _id: 'demo-7', title: 'The Art of Deep Work', author: 'Alex Thomas', genre: 'business', status: 'published', chapterCount: 11, wordCount: 22000, readingTime: 110 },
 { _id: 'demo-8', title: '30 Day Challenge', author: 'Alex Thomas', genre: 'self-help', status: 'completed', chapterCount: 30, wordCount: 45000, readingTime: 225 },
]

