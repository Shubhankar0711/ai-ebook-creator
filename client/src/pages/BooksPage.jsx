import { useEffect, useState, useCallback } from"react";
import { Link } from"react-router-dom";
import { PlusCircle, Search, BookOpen, Grid, List } from"lucide-react";
import { bookService } from"../services/bookService";
import BookCard from"../components/ui/BookCard";
import BookListItem from"../components/ui/BookListItem";
import { LoadingSpinner } from"../components/ui/LoadingSpinner";
import ConfirmDialog from"../components/ui/ConfirmDialog";
import useDebounce from"../hooks/useDebounce";
import { GENRES, STATUS_COLORS } from"../utils/helpers";
import toast from"react-hot-toast";
import clsx from"clsx";

const STATUSES = ["draft","in-progress","completed","published"];

const BooksPage = () => {
 const [books, setBooks] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [genre, setGenre] = useState("");
 const [status, setStatus] = useState("");
 const [page, setPage] = useState(1);
 const [pagination, setPagination] = useState({});
 const [viewMode, setViewMode] = useState("grid");
 const [tab, setTab] = useState("saved");
 const [deleteId, setDeleteId] = useState(null);
 const [deleting, setDeleting] = useState(false);
 const debouncedSearch = useDebounce(search, 400);

 const loadBooks = useCallback(async () => {
 setLoading(true);
 try {
 const { data } = await bookService.getBooks({
 page,
 limit: 12,
 search: debouncedSearch,
 genre,
 status,
 });
 setBooks(data.books);
 setPagination(data.pagination);
 } catch {
 toast.error("Failed to load books");
 } finally {
 setLoading(false);
 }
 }, [page, debouncedSearch, genre, status]);

 useEffect(() => {
 loadBooks();
 }, [loadBooks]);
 useEffect(() => {
 setPage(1);
 }, [debouncedSearch, genre, status]);

 const handleDelete = async () => {
 setDeleting(true);
 try {
 await bookService.deleteBook(deleteId);
 setBooks((prev) => prev.filter((b) => b._id !== deleteId));
 toast.success("Book deleted");
 } catch {
 toast.error("Failed to delete");
 } finally {
 setDeleting(false);
 setDeleteId(null);
 }
 };

 const handleDuplicate = async (id) => {
 try {
 const { data } = await bookService.duplicateBook(id);
 setBooks((prev) => [data.book, ...prev]);
 toast.success("Book duplicated");
 } catch {
 toast.error("Failed to duplicate");
 }
 };

 const handleToggleFavorite = async (id) => {
    try {
      const bookToToggle = books.find((b) => b._id === id);
      const newFavStatus = !bookToToggle?.isFavorite;
      await bookService.toggleFavorite(id);
      setBooks((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, isFavorite: newFavStatus } : b,
        ),
      );
      toast.success(newFavStatus ? 'Added to favorites ❤️' : 'Removed from favorites');
    } catch {
      toast.error('Failed to update favorite status');
    }
  };

 return (
 <div className="p-6 space-y-5 animate-fade-in">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
  <div>
  <h1 className="text-2xl font-bold text-text dark:text-white">My eBooks</h1>
  <p className="text-xs text-text-secondary mt-0.5">{pagination.total || 0} eBook{pagination.total !== 1 ? 's' : ''} in library</p>
  </div>
  <div className="flex items-center gap-3">
  <div className="rounded-full bg-card dark:bg-card p-1 flex gap-1 border border-border">
  <button onClick={() => setTab('saved')} className={clsx('px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all', tab === 'saved' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text')}>Saved</button>
  <button onClick={() => setTab('collections')} className={clsx('px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all', tab === 'collections' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text')}>Collections</button>
  <button onClick={() => setTab('archived')} className={clsx('px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all', tab === 'archived' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text')}>Archived</button>
  </div>
 <Link to="/books/new" className="btn-primary self-start">
 <PlusCircle className="w-4 h-4" /> New Book
 </Link>
 </div>
 </div>

 {/* Filters */}
 <div className="flex flex-wrap gap-2 items-center">
 <div className="relative flex-1 min-w-44">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Search books…"
 className="input-field pl-9 py-2 text-sm"
 />
 </div>

 <select
 value={genre}
 onChange={(e) => setGenre(e.target.value)}
 className="input-field py-2 text-sm w-auto min-w-[120px]"
 >
 <option value="">All Genres</option>
 {GENRES.map((g) => (
 <option key={g} value={g} className="capitalize">
 {g}
 </option>
 ))}
 </select>

 <select
 value={status}
 onChange={(e) => setStatus(e.target.value)}
 className="input-field py-2 text-sm w-auto min-w-[120px]"
 >
 <option value="">All Status</option>
 {STATUSES.map((s) => (
 <option key={s} value={s} className="capitalize">
 {s}
 </option>
 ))}
 </select>

 <div className="flex items-center gap-0.5 bg-card dark:bg-card rounded-xl p-1">
 <button
 onClick={() => setViewMode("grid")}
 className={clsx(
"p-1.5 rounded-lg transition-colors",
 viewMode ==="grid"
 ?"bg-white dark:bg-card shadow-soft text-primary"
 :"text-text-secondary hover:text-text-secondary",
 )}
 >
 <Grid className="w-4 h-4" />
 </button>
 <button
 onClick={() => setViewMode("list")}
 className={clsx(
"p-1.5 rounded-lg transition-colors",
 viewMode ==="list"
 ?"bg-white dark:bg-card shadow-soft text-primary"
 :"text-text-secondary hover:text-text-secondary",
 )}
 >
 <List className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* Content */}
 {loading ? (
 <div className="flex items-center justify-center h-48">
 <LoadingSpinner size="lg" />
 </div>
 ) : books.length === 0 ? (
 <div className="card p-14 text-center">
 <div className="w-12 h-12 rounded-xl bg-card dark:bg-card flex items-center justify-center mx-auto mb-4">
 <BookOpen className="w-6 h-6 text-text-secondary" />
 </div>
 <h3 className="font-semibold text-text-secondary dark:text-text-secondary mb-1.5">
 No books found
 </h3>
 <p className="text-sm text-text-secondary mb-5">
 {search || genre || status
 ?"Try adjusting your filters"
 :"Create your first book to get started"}
 </p>
 {!search && !genre && !status && (
 <Link to="/books/new" className="btn-primary inline-flex">
 <PlusCircle className="w-4 h-4" /> Create Book
 </Link>
 )}
 </div>
 ) : (
 <>
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {books.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onDelete={(id) => setDeleteId(id)}
                onDuplicate={handleDuplicate}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
 ) : (
 <div className="space-y-4">
 {books.map((book) => (
 <BookListItem
 key={book._id}
 book={book}
 onDelete={(id) => setDeleteId(id)}
 onDuplicate={handleDuplicate}
 onToggleFavorite={handleToggleFavorite}
 />
 ))}
 </div>
 )}

 {pagination.pages > 1 && (
 <div className="flex items-center justify-center gap-2 pt-2">
 <button
 onClick={() => setPage((p) => Math.max(1, p - 1))}
 disabled={page === 1}
 className="btn-secondary text-xs px-4 py-2 disabled:opacity-40"
 >
 ← Prev
 </button>
 <span className="text-xs text-text-secondary px-2">
 {page} / {pagination.pages}
 </span>
 <button
 onClick={() =>
 setPage((p) => Math.min(pagination.pages, p + 1))
 }
 disabled={page === pagination.pages}
 className="btn-secondary text-xs px-4 py-2 disabled:opacity-40"
 >
 Next →
 </button>
 </div>
 )}
 </>
 )}

 <ConfirmDialog
 isOpen={!!deleteId}
 onClose={() => setDeleteId(null)}
 onConfirm={handleDelete}
 loading={deleting}
 title="Delete Book"
 message="This will permanently delete the book and all its chapters."
 />
 </div>
 );
};

export default BooksPage;

