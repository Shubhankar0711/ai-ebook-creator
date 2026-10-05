import { Link } from 'react-router-dom'
import { Trash2, Heart } from 'lucide-react'
import { generateBookCoverSVG } from '../../utils/bookCovers'

const BookCard = ({ book, onDelete, onToggleFavorite }) => {
  const coverSrc = book.coverImage || generateBookCoverSVG(book.title, book.author, book.genre)

  return (
    <div className="bg-white dark:bg-card border border-border/80 dark:border-border rounded-2xl p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition-all duration-200 group relative">
      {/* Left side: Book Cover Image */}
      <Link to={`/books/${book._id}/edit`} className="shrink-0 block">
        <div className="w-28 sm:w-32 h-40 rounded-xl overflow-hidden shadow-md bg-gray-100 dark:bg-gray-800 transition-transform group-hover:scale-[1.02]">
          <img
            src={coverSrc}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      {/* Right side: Book Title, Description, and Read More button + Favorite & Delete icons */}
      <div className="flex-1 min-w-0 flex flex-col h-40 justify-between">
        <div>
          <Link to={`/books/${book._id}/edit`}>
            <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-1 hover:text-primary transition-colors">
              {book.title}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-3 leading-relaxed">
            {book.description || book.subtitle || `A compelling ${book.genre || 'general'} eBook created with AI writing assistant.`}
          </p>
        </div>

        {/* Bottom Row: Read More pill button + Favorite & Delete icons */}
        <div className="flex items-center justify-between pt-2">
          <Link
            to={`/books/${book._id}/edit`}
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary transition-colors">
            Read More
          </Link>

          <div className="flex items-center gap-1">
            {onToggleFavorite && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(book._id) }}
                title={book.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                className="p-2 rounded-full transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/40">
                <Heart className={`w-4 h-4 transition-colors ${book.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-400 hover:text-rose-500'}`} />
              </button>
            )}

            {onDelete && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(book._id) }}
                title="Delete Book"
                className="p-2 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookCard
