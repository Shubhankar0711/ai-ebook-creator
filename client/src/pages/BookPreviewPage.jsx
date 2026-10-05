import { useEffect, useState } from"react";
import { useParams, Link } from"react-router-dom";
import {
 ChevronLeft,
 Download,
 Edit3,
 Clock,
 Hash,
 BookOpen,
} from"lucide-react";
import { bookService, exportService } from"../services/bookService";
import { LoadingSpinner } from"../components/ui/LoadingSpinner";
import {
 wordCount,
 readingTime,
 downloadBlob,
 GENRE_ICONS,
 formatRelativeDate,
} from"../utils/helpers";
import { generateBookCoverSVG } from"../utils/bookCovers";
import toast from"react-hot-toast";

const BookPreviewPage = () => {
 const { id } = useParams();
 const [book, setBook] = useState(null);
 const [chapters, setChapters] = useState([]);
 const [active, setActive] = useState(null);
 const [loading, setLoading] = useState(true);
 const [exporting, setExporting] = useState(false);
 const [readMode, setReadMode] = useState(false);
 const [selectedThemeColor, setSelectedThemeColor] = useState('purple');

 useEffect(() => {
    bookService
      .getBook(id)
      .then(({ data }) => {
        setBook(data.book);
        setChapters(data.chapters);
        if (data.book?.themeColor || data.book?.template) {
          setSelectedThemeColor(data.book.themeColor || data.book.template);
        }
        if (data.chapters.length > 0) setActive(data.chapters[0]);
      })
      .catch(() => toast.error("Failed to load book"))
      .finally(() => setLoading(false));
  }, [id]);

 const handleExportPDF = async () => {
   setExporting(true);
   const t = toast.loading(`Generating PDF in ${selectedThemeColor} template…`);
   try {
     const { data } = await exportService.exportPDF(id, { themeColor: selectedThemeColor });
     downloadBlob(data, `${book.title.replace(/[^a-z0-9]/gi, "_")}_${selectedThemeColor}.pdf`);
     toast.success("PDF downloaded with custom template color!", { id: t });
   } catch {
     toast.error("Export failed", { id: t });
   } finally {
     setExporting(false);
   }
 };

 if (loading)
 return (
 <div className="flex items-center justify-center h-96">
 <LoadingSpinner size="lg" />
 </div>
 );

 const totalWords = chapters.reduce((sum, c) => sum + (c.wordCount || 0), 0);

 return (
 <div className="flex h-screen bg-background dark:bg-background overflow-hidden">
 {/* Chapter List */}
 {!readMode && (
 <aside className="w-64 bg-white dark:bg-card border-r border-border dark:border-border flex flex-col shrink-0">
 <div className="p-4 border-b border-border dark:border-border">
 <Link
 to={`/books/${id}/edit`}
 className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-secondary dark:hover:text-gray-200 mb-3 transition-colors"
 >
 <ChevronLeft className="w-3.5 h-3.5" /> Back to editor
 </Link>
 <h2 className="font-bold text-sm text-text dark:text-text-secondary truncate">
 {book?.title}
 </h2>
 <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
 <span className="flex items-center gap-1">
 <Hash className="w-3 h-3" />
 {totalWords.toLocaleString()}
 </span>
 <span className="flex items-center gap-1">
 <Clock className="w-3 h-3" />
 {readingTime(totalWords)}
 </span>
 </div>
 </div>

 <div className="flex-1 overflow-y-auto p-3 space-y-1">
 <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-2 mb-2">
 Chapters
 </p>
 {chapters.map((ch) => (
 <button
 key={ch._id}
 onClick={() => setActive(ch)}
 className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
 active?._id === ch._id
 ?"bg-accent dark:bg-accent text-primary dark:text-primary"
 :"text-text-secondary dark:text-text-secondary hover:bg-accent dark:hover:bg-card"
 }`}
 >
 <div className="flex items-center gap-2">
 <span className="text-text-secondary shrink-0">
 {ch.chapterNumber}.
 </span>
 <span className="truncate">{ch.title}</span>
 </div>
 {ch.wordCount > 0 && (
 <p className="text-text-secondary mt-0.5 ml-5">
 {ch.wordCount} words
 </p>
 )}
 </button>
 ))}
 </div>

  <div className="p-3 border-t border-border dark:border-border space-y-2.5">
    <div>
      <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5 px-0.5">
        PDF Template Color
      </p>
      <div className="grid grid-cols-6 gap-1">
        {[
          { id: 'purple', bg: '#6366f1' },
          { id: 'blue', bg: '#0284c7' },
          { id: 'emerald', bg: '#10b981' },
          { id: 'amber', bg: '#f59e0b' },
          { id: 'crimson', bg: '#e11d48' },
          { id: 'dark', bg: '#1e293b' },
        ].map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedThemeColor(c.id)}
            title={`Template: ${c.id}`}
            className={`w-6 h-6 rounded-full transition-transform ${selectedThemeColor === c.id ? 'scale-125 ring-2 ring-primary ring-offset-1' : 'hover:scale-110 opacity-70'}`}
            style={{ backgroundColor: c.bg }}
          />
        ))}
      </div>
    </div>
    <button
      onClick={handleExportPDF}
      disabled={exporting}
      className="w-full btn-primary flex items-center justify-center gap-2 text-sm py-2"
    >
      {exporting ? (
        <span className="spinner w-4 h-4" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      Export PDF ({selectedThemeColor})
    </button>
    <Link
      to={`/books/${id}/edit`}
      className="w-full btn-secondary flex items-center justify-center gap-2 text-sm py-2"
    >
      <Edit3 className="w-4 h-4" /> Edit Book
    </Link>
  </div>
 </aside>
 )}

 {/* Preview Content */}
 <div className="flex-1 overflow-y-auto">
 {/* Top bar */}
 <div className="sticky top-0 z-10 bg-white/80 dark:bg-card/80 backdrop-blur-sm border-b border-border dark:border-border px-6 py-3 flex items-center justify-between">
 <h3 className="font-semibold text-sm text-text dark:text-text-secondary">
 {active ? active.title :"Preview"}
 </h3>
 <button
 onClick={() => setReadMode((r) => !r)}
 className="btn-ghost text-xs px-3 py-1.5"
 >
 {readMode ?"← Show sidebar" :"Reading mode"}
 </button>
 </div>

 {/* Book detail header */}
 <div className="max-w-5xl mx-auto px-6 py-10">
 <div className="grid gap-8 lg:grid-cols-[360px_1fr] items-start">
 <div className="rounded-3xl overflow-hidden border border-border dark:border-border shadow-sm bg-white dark:bg-background">
 <img
 src={
 book.coverImage ||
 generateBookCoverSVG(book.title, book.author, book.genre)
 }
 alt={book.title}
 className="w-full h-[420px] object-cover"
 />
 </div>

 <div className="space-y-6">
 <div className="rounded-3xl border border-border dark:border-border bg-white dark:bg-background p-8 shadow-sm">
 <div className="flex flex-col gap-4">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <p className="text-xs uppercase tracking-[0.28em] font-semibold text-text-secondary dark:text-text-secondary">
 {book.genre?.replace("-","") ||"Book"}
 </p>
 <p className="mt-2 text-2xl font-bold text-text dark:text-text-secondary leading-tight">
 {book.title}
 </p>
 {book.subtitle && (
 <p className="mt-2 max-w-xl text-sm text-text-secondary dark:text-text-secondary">
 {book.subtitle}
 </p>
 )}
 </div>
 <div className="rounded-3xl border border-border dark:border-border bg-background dark:bg-card p-4 text-right">
 <p className="text-[11px] uppercase tracking-[0.24em] text-text-secondary dark:text-text-secondary">
 Reading time
 </p>
 <p className="mt-2 text-sm font-semibold text-text dark:text-text-secondary">
 {readingTime(totalWords)}
 </p>
 </div>
 </div>

 <div className="rounded-3xl bg-accent dark:bg-accent p-5 text-sm text-text dark:text-text-secondary">
 <p className="uppercase tracking-[0.24em] text-text-secondary dark:text-text-secondary text-[11px]">
 Author
 </p>
 <p className="mt-2 text-lg font-semibold">
 {book.author ||"Unknown author"}
 </p>
 <p className="mt-3 text-sm leading-relaxed">
 {book.description
 ? `${book.description.slice(0, 180).trim()}${
 book.description.length > 180 ?"…" :""
 }`
 :"A compelling story starter with author details, genre, and writing tone all laid out clearly."}
 </p>
 </div>

 <div className="grid gap-3 sm:grid-cols-2">
 <div className="rounded-3xl border border-border dark:border-border p-4">
 <p className="text-[11px] uppercase tracking-[0.24em] text-text-secondary dark:text-text-secondary">
 Chapters
 </p>
 <p className="mt-2 text-sm font-semibold text-text dark:text-text-secondary">
 {book.chapterCount || chapters.length}
 </p>
 </div>
 <div className="rounded-3xl border border-border dark:border-border p-4">
 <p className="text-[11px] uppercase tracking-[0.24em] text-text-secondary dark:text-text-secondary">
 Pages
 </p>
 <p className="mt-2 text-sm font-semibold text-text dark:text-text-secondary">
 {Math.max(1, Math.ceil(totalWords / 270))} pages
 </p>
 </div>
 </div>
 </div>
 </div>

 <div className="rounded-3xl border border-border dark:border-border bg-white dark:bg-background p-6 shadow-sm">
 <div className="grid gap-4 sm:grid-cols-2">
 <div>
 <p className="text-[11px] uppercase tracking-[0.24em] text-text-secondary dark:text-text-secondary">
 Author
 </p>
 <p className="mt-2 text-sm font-semibold text-text dark:text-text-secondary">
 {book.author ||"Unknown author"}
 </p>
 </div>
 <div>
 <p className="text-[11px] uppercase tracking-[0.24em] text-text-secondary dark:text-text-secondary">
 Editors
 </p>
 <p className="mt-2 text-sm text-text dark:text-text-secondary">
 {book.author ||"No editor info"}
 </p>
 </div>
 <div>
 <p className="text-[11px] uppercase tracking-[0.24em] text-text-secondary dark:text-text-secondary">
 Language
 </p>
 <p className="mt-2 text-sm font-semibold text-text dark:text-text-secondary">
 {book.language}
 </p>
 </div>
 <div>
 <p className="text-[11px] uppercase tracking-[0.24em] text-text-secondary dark:text-text-secondary">
 Paperback
 </p>
 <p className="mt-2 text-sm text-text dark:text-text-secondary">
 Standard print edition
 </p>
 </div>
 </div>

 <div className="mt-6 rounded-3xl bg-background dark:bg-card p-5">
 <p className="text-[11px] uppercase tracking-[0.24em] text-text-secondary dark:text-text-secondary">
 Description
 </p>
 <p className="mt-2 leading-relaxed text-sm text-text dark:text-text-secondary">
 {book.description ||
"No description added yet. Add a short story summary to make this book shine."}
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Chapter content */}
 <div className="max-w-3xl mx-auto px-6 py-10">
 {active ? (
 <article className="prose prose-lg dark:prose-invert max-w-none">
 <h1 className="text-3xl font-bold text-text dark:text-text-secondary mb-2">
 Chapter {active.chapterNumber}: {active.title}
 </h1>
 <div className="flex items-center gap-4 text-sm text-text-secondary dark:text-text-secondary mb-8 pb-6 border-b border-border dark:border-border">
 <span>{active.wordCount || 0} words</span>
 <span>·</span>
 <span>{readingTime(active.wordCount || 0)}</span>
 </div>
 {active.content ? (
 <div
 className="text-text dark:text-text-secondary leading-relaxed text-[17px]"
 dangerouslySetInnerHTML={{ __html: active.content }}
 />
 ) : (
 <div className="text-center py-16 text-text-secondary">
 <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
 <p>This chapter is empty. Start writing in the editor!</p>
 <Link
 to={`/books/${id}/edit`}
 className="btn-primary mt-4 inline-flex items-center gap-2 text-sm"
 >
 <Edit3 className="w-4 h-4" /> Open Editor
 </Link>
 </div>
 )}
 </article>
 ) : (
 <div className="text-center py-24 text-text-secondary">
 <p>Select a chapter to preview</p>
 </div>
 )}

 {/* Chapter nav */}
 {chapters.length > 1 && active && (
 <div className="flex items-center justify-between mt-12 pt-8 border-t border-border dark:border-border">
 {chapters[active.chapterNumber - 2] ? (
 <button
 onClick={() => setActive(chapters[active.chapterNumber - 2])}
 className="btn-secondary text-sm flex items-center gap-2"
 >
 ← {chapters[active.chapterNumber - 2].title}
 </button>
 ) : (
 <div />
 )}
 {chapters[active.chapterNumber] && (
 <button
 onClick={() => setActive(chapters[active.chapterNumber])}
 className="btn-secondary text-sm flex items-center gap-2"
 >
 {chapters[active.chapterNumber].title} →
 </button>
 )}
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

export default BookPreviewPage;

