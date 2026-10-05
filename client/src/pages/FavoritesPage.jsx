import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { userService, bookService } from '../services/bookService'
import BookCard from '../components/ui/BookCard'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const FavoritesPage = () => {
 const [books, setBooks] = useState([])
 const [loading, setLoading] = useState(true)
 const [deleteId, setDeleteId] = useState(null)
 const [deleting, setDeleting] = useState(false)

 useEffect(() => {
 userService.getFavoriteBooks()
 .then(({ data }) => setBooks(data.books))
 .catch(() => toast.error('Failed to load favorites'))
 .finally(() => setLoading(false))
 }, [])

 const handleDelete = async () => {
 setDeleting(true)
 try {
 await bookService.deleteBook(deleteId)
 setBooks(prev => prev.filter(b => b._id !== deleteId))
 toast.success('Book deleted')
 } catch { toast.error('Failed to delete') }
 finally { setDeleting(false); setDeleteId(null) }
 }

 const handleToggleFavorite = async (id) => {
 try {
 await bookService.toggleFavorite(id)
 setBooks(prev => prev.filter(b => b._id !== id))
 toast.success('Removed from favorites')
 } catch {}
 }

 const handleDuplicate = async (id) => {
 try {
 const { data } = await bookService.duplicateBook(id)
 setBooks(prev => [data.book, ...prev])
 toast.success('Book duplicated')
 } catch { toast.error('Failed to duplicate') }
 }

 if (loading) return (
 <div className="flex items-center justify-center h-64">
 <LoadingSpinner size="lg" />
 </div>
 )

 return (
 <div className="p-6 space-y-6 animate-fade-in">
 <div>
 <h1 className="text-2xl font-bold text-text dark:text-text-secondary flex items-center gap-2">
 <Heart className="w-6 h-6 text-red-500 fill-red-500" /> Favorites
 </h1>
 <p className="text-sm text-text-secondary dark:text-text-secondary mt-1">{books.length} favorited book{books.length !== 1 ? 's' : ''}</p>
 </div>

 {books.length === 0 ? (
 <div className="card p-14 text-center">
 <Heart className="w-12 h-12 text-text-secondary dark:text-text-secondary mx-auto mb-3" />
 <h3 className="font-semibold text-text dark:text-text-secondary mb-2">No favorites yet</h3>
 <p className="text-sm text-text-secondary mb-5">Star any book to see it here</p>
 <Link to="/books" className="btn-primary inline-flex items-center gap-2 text-sm">Browse Books</Link>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
 {books.map(book => (
 <BookCard key={book._id} book={book}
 onDelete={(id) => setDeleteId(id)}
 onDuplicate={handleDuplicate}
 onToggleFavorite={handleToggleFavorite} />
 ))}
 </div>
 )}

 <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)}
 onConfirm={handleDelete} loading={deleting}
 title="Delete Book" message="This will permanently delete the book and all its chapters." />
 </div>
 )
}

export default FavoritesPage


