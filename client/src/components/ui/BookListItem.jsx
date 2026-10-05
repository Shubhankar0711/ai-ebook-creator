import { Link } from"react-router-dom";
import { Play, MoreHorizontal } from"lucide-react";

const BookListItem = ({ book, onDelete, onDuplicate, onToggleFavorite }) => {
 return (
 <div className="flex items-center justify-between gap-4 p-4 rounded-2xl hover:bg-card transition-colors">
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0">
 <Link
 to={`/books/${book._id}/edit`}
 className="text-sm font-semibold text-text-secondary hover:underline block truncate"
 >
 {book.title}
 </Link>
 <p className="text-xs text-text-secondary mt-1 truncate">
 {book.author ||"Unknown author"}
 </p>
 </div>
 <div className="flex items-center gap-2">
 <button className="btn-secondary px-3 py-1.5 text-sm flex items-center gap-2">
 <Play className="w-4 h-4" /> Play
 </button>
 <button className="btn-ghost p-2" aria-label="more">
 <MoreHorizontal className="w-4 h-4" />
 </button>
 </div>
 </div>

 {book.description && (
 <p className="text-xs text-text-secondary mt-3 line-clamp-3">
 {book.description}
 </p>
 )}

 <div className="mt-3 flex items-center gap-3 text-[12px] text-text-secondary">
 {/* Example small status */}
 <span>
 •{""}
 {book.duration
 ? `${book.duration} mins left`
 : book.status ||"Complete"}
 </span>
 </div>
 </div>

 <div className="w-28 h-36 rounded-lg overflow-hidden bg-card flex-shrink-0 shadow-inner">
 {book.coverImage ? (
 <img
 src={book.coverImage}
 alt={book.title}
 className="w-full h-full object-cover"
 />
 ) : (
 <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white text-xs font-bold">
 {book.title?.slice(0, 2).toUpperCase()}
 </div>
 )}
 </div>
 </div>
 );
};

export default BookListItem;

