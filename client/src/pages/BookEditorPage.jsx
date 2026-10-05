import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
 Save, Eye, Sparkles, Plus, Trash2, GripVertical,
 ChevronLeft, Wand2, Maximize2, Minimize2, Clock, Hash, BookOpen, Edit3
} from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { bookService, chapterService, aiService } from '../services/bookService'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { wordCount, readingTime } from '../utils/helpers'
import useAutoSave from '../hooks/useAutoSave'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// Lazy load Quill editor
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const QUILL_MODULES = {
 toolbar: [
 [{ header: [1, 2, 3, false] }],
 ['bold', 'italic', 'underline', 'strike'],
 [{ list: 'ordered' }, { list: 'bullet' }],
 [{ indent: '-1' }, { indent: '+1' }],
 ['blockquote', 'code-block'],
 ['link'],
 [{ align: [] }],
 ['clean'],
 ],
}

const AI_ACTIONS = [
 { id: 'generate', label: 'Generate Chapter', icon: '✨' },
 { id: 'continue', label: 'Continue Writing', icon: '▶️' },
 { id: 'rewrite', label: 'Rewrite Content', icon: '🔄' },
 { id: 'expand', label: 'Expand Paragraph', icon: '📝' },
 { id: 'shorten', label: 'Shorten', icon: '✂️' },
 { id: 'grammar', label: 'Fix Grammar', icon: '✅' },
 { id: 'summarize', label: 'Summarize', icon: '📋' },
]

const BookEditorPage = () => {
 const { id } = useParams()
 const navigate = useNavigate()

 const [book, setBook] = useState(null)
 const [chapters, setChapters] = useState([])
 const [activeChapter, setActiveChapter] = useState(null)
 const [content, setContent] = useState('')
 const [loading, setLoading] = useState(true)
 const [saving, setSaving] = useState(false)
 const [aiLoading, setAiLoading] = useState(false)
 const [aiPanel, setAiPanel] = useState(false)
 const [focusMode, setFocusMode] = useState(false)
 const [renamingId, setRenamingId] = useState(null)
 const [renameValue, setRenameValue] = useState('')
 const renameInputRef = useRef(null)
 const [deleteChapterId, setDeleteChapterId] = useState(null)
 const [outlineModal, setOutlineModal] = useState(false)
 const [outline, setOutline] = useState('')
 const [outlineLoading, setOutlineLoading] = useState(false)
 const [lastSaved, setLastSaved] = useState(null)

 // Load book + chapters
 const loadBook = useCallback(async () => {
 try {
 const { data } = await bookService.getBook(id)
 setBook(data.book)
 setChapters(data.chapters)
 setOutline(data.book.outline || '')
 if (data.chapters.length > 0) {
 setActiveChapter(data.chapters[0])
 setContent(data.chapters[0].content || '')
 }
 } catch {
 toast.error('Failed to load book')
 navigate('/books')
 } finally {
 setLoading(false)
 }
 }, [id, navigate])

 useEffect(() => { loadBook() }, [loadBook])

 // Switch chapter — save current first
 const switchChapter = async (chapter) => {
 if (activeChapter && content !== activeChapter.content) {
 await saveCurrentChapter(false)
 }
 setActiveChapter(chapter)
 setContent(chapter.content || '')
 }

 const saveCurrentChapter = useCallback(async (showToast = true) => {
 if (!activeChapter) return
 setSaving(true)
 try {
 const { data } = await chapterService.updateChapter(activeChapter._id, { content })
 setChapters(prev => prev.map(c => c._id === activeChapter._id ? data.chapter : c))
 setLastSaved(new Date())
 if (showToast) toast.success('Saved!', { id: 'save' })
 } catch {
 if (showToast) toast.error('Save failed')
 } finally {
 setSaving(false)
 }
 }, [activeChapter, content])

 useAutoSave(content, () => saveCurrentChapter(false), 30000)

 // Add chapter
 const addChapter = async () => {
 try {
 const { data } = await chapterService.createChapter({
 title: `Chapter ${chapters.length + 1}`,
 content: '',
 bookId: id
 })
 const updated = [...chapters, data.chapter]
 setChapters(updated)
 switchChapter(data.chapter)
 toast.success('Chapter added')
 } catch {
 toast.error('Failed to add chapter')
 }
 }

 // Delete chapter
 const handleDeleteChapter = async () => {
 try {
 await chapterService.deleteChapter(deleteChapterId)
 const updated = chapters.filter(c => c._id !== deleteChapterId)
 setChapters(updated)
 if (activeChapter?._id === deleteChapterId) {
 setActiveChapter(updated[0] || null)
 setContent(updated[0]?.content || '')
 }
 toast.success('Chapter deleted')
 } catch {
 toast.error('Failed to delete chapter')
 } finally {
 setDeleteChapterId(null)
 }
 }

 // Drag and drop reorder
 const handleDragEnd = async (result) => {
 if (!result.destination) return
 const items = Array.from(chapters)
 const [moved] = items.splice(result.source.index, 1)
 items.splice(result.destination.index, 0, moved)
 const reordered = items.map((c, i) => ({ ...c, chapterNumber: i + 1 }))
 setChapters(reordered)
 try {
 await chapterService.reorderChapters({
 bookId: id,
 chapters: reordered.map(c => ({ _id: c._id, chapterNumber: c.chapterNumber }))
 })
 } catch {
 toast.error('Failed to reorder chapters')
 }
 }

 // AI Actions
 const runAiAction = async (actionId) => {
 setAiLoading(true)
 try {
 let result = ''
 switch (actionId) {
 case 'generate':
 const { data: gen } = await aiService.generateChapter({
 chapterId: activeChapter._id,
 bookId: id,
 chapterTitle: activeChapter.title,
 chapterNumber: activeChapter.chapterNumber,
 bookTitle: book.title,
 genre: book.genre,
 tone: book.tone,
 language: book.language,
 outline: book.outline,
 })
 result = gen.content; break
 case 'continue':
 const { data: cont } = await aiService.continueWriting({
 content, bookTitle: book.title, genre: book.genre, tone: book.tone, language: book.language
 })
 result = content + '\n\n' + cont.content; break
 case 'rewrite':
 if (!content.trim()) { toast.error('No content to rewrite'); return }
 const { data: rw } = await aiService.rewrite({ content, tone: book.tone, language: book.language })
 result = rw.content; break
 case 'expand':
 if (!content.trim()) { toast.error('No content to expand'); return }
 const { data: ex } = await aiService.expand({ content, language: book.language })
 result = ex.content; break
 case 'shorten':
 if (!content.trim()) { toast.error('No content to shorten'); return }
 const { data: sh } = await aiService.summarize({ content, language: book.language, type: 'shorten' })
 result = sh.content; break
 case 'grammar':
 if (!content.trim()) { toast.error('No content to improve'); return }
 const { data: gr } = await aiService.improveGrammar({ content, language: book.language })
 result = gr.content; break
 case 'summarize':
 if (!content.trim()) { toast.error('No content to summarize'); return }
 const { data: su } = await aiService.summarize({ content, language: book.language, type: 'summary' })
 result = su.content; break
 default: return
 }
 setContent(result)
 toast.success('AI action complete!')
 } catch (err) {
 toast.error(err.response?.data?.message || 'AI action failed')
 } finally {
 setAiLoading(false)
 }
 }

 // Generate outline
 const handleGenerateOutline = async () => {
 setOutlineLoading(true)
 try {
 const { data } = await aiService.generateOutline({
 bookId: id,
 title: book.title,
 genre: book.genre,
 tone: book.tone,
 targetAudience: book.targetAudience,
 language: book.language,
 numberOfChapters: chapters.length || 10,
 description: book.description
 })
 setOutline(data.outline)
 toast.success('Outline generated!')
 } catch (err) {
 toast.error(err.response?.data?.message || 'Failed to generate outline')
 } finally {
 setOutlineLoading(false)
 }
 }

 // Rename chapter
 const renameChapter = async (chId, newTitle) => {
   try {
     await chapterService.updateChapter(chId, { title: newTitle })
     setChapters(prev => prev.map(c => c._id === chId ? { ...c, title: newTitle } : c))
     if (activeChapter?._id === chId) setActiveChapter(prev => ({ ...prev, title: newTitle }))
   } catch {
     toast.error('Failed to rename chapter')
   }
 }

 const startRename = (ch, e) => {
   e.stopPropagation()
   setRenamingId(ch._id)
   setRenameValue(ch.title)
   setTimeout(() => renameInputRef.current?.focus(), 50)
 }

 const commitRename = async (chId) => {
   const trimmed = renameValue.trim()
   setRenamingId(null)
   if (trimmed && trimmed !== chapters.find(c => c._id === chId)?.title) {
     await renameChapter(chId, trimmed)
   }
 }

 const wc = wordCount(content)
 const rt = readingTime(wc)

 if (loading) return (
 <div className="flex items-center justify-center h-screen">
 <LoadingSpinner size="xl" />
 </div>
 )

 return (
 <div className={clsx('flex h-screen bg-background dark:bg-background overflow-hidden',
 focusMode && 'fixed inset-0 z-50')}>

 {/* Chapter Sidebar */}
 {!focusMode && (
 <aside className="w-64 bg-white dark:bg-card border-r border-border dark:border-border flex flex-col shrink-0">
 {/* Book info */}
 <div className="p-4 border-b border-border dark:border-border">
 <Link to="/books" className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-gray-600 dark:hover:text-gray-200 mb-3 transition-colors">
 <ChevronLeft className="w-3.5 h-3.5" /> Back to books
 </Link>
 <h2 className="font-bold text-sm text-text dark:text-text-secondary truncate">{book?.title}</h2>
 <p className="text-xs text-text-secondary capitalize mt-0.5">{book?.genre} · {book?.language}</p>
 </div>

 {/* Outline button */}
 <div className="px-3 pt-3">
 <button onClick={() => setOutlineModal(true)}
 className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-primary dark:text-primary hover:bg-accent dark:hover:bg-accent transition-colors border border-border dark:border-border">
 <Wand2 className="w-4 h-4" /> Book Outline
 </button>
 </div>

 {/* Chapters */}
 <div className="flex-1 overflow-y-auto py-3 px-3">
 <div className="flex items-center justify-between mb-2">
 <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Chapters</p>
 <button onClick={addChapter}
 className="p-1 rounded-lg hover:bg-accent dark:hover:bg-card transition-colors">
 <Plus className="w-4 h-4 text-text-secondary" />
 </button>
 </div>

 <DragDropContext onDragEnd={handleDragEnd}>
 <Droppable droppableId="chapters">
 {(provided) => (
 <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
 {chapters.map((ch, index) => (
 <Draggable key={ch._id} draggableId={ch._id} index={index}>
 {(provided, snapshot) => (
 <div
 ref={provided.innerRef}
 {...provided.draggableProps}
 className={clsx(
 'flex items-center gap-1.5 group rounded-xl px-2 py-2 cursor-pointer transition-all',
 activeChapter?._id === ch._id
 ? 'bg-accent dark:bg-accent text-primary dark:text-primary'
 : 'hover:bg-accent dark:hover:bg-card text-text dark:text-text-secondary',
 snapshot.isDragging && 'shadow-lg opacity-90'
 )}
 onClick={() => switchChapter(ch)}>
 <div {...provided.dragHandleProps} className="opacity-0 group-hover:opacity-100 shrink-0">
 <GripVertical className="w-3.5 h-3.5 text-text-secondary" />
 </div>
 <span className="text-xs text-text-secondary shrink-0 w-5">{ch.chapterNumber}.</span>

 {/* Inline rename input or title */}
 {renamingId === ch._id ? (
   <input
     ref={renameInputRef}
     value={renameValue}
     onChange={e => setRenameValue(e.target.value)}
     onBlur={() => commitRename(ch._id)}
     onKeyDown={e => {
       if (e.key === 'Enter') { e.preventDefault(); commitRename(ch._id) }
       if (e.key === 'Escape') setRenamingId(null)
     }}
     onClick={e => e.stopPropagation()}
     className="text-xs flex-1 bg-transparent border-b border-primary outline-none px-0.5 py-0"
     style={{ color: 'var(--color-text)', minWidth: 0 }}
   />
 ) : (
   <span className="text-xs font-medium truncate flex-1">{ch.title}</span>
 )}

 {/* Actions: rename + delete */}
 <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0">
   <button
     onClick={e => startRename(ch, e)}
     title="Rename chapter"
     className="p-0.5 rounded hover:text-primary transition-colors"
     style={{ color: 'var(--color-text-secondary)' }}>
     <Edit3 className="w-3 h-3" />
   </button>
   <button
     onClick={(e) => { e.stopPropagation(); setDeleteChapterId(ch._id) }}
     title="Delete chapter"
     className="p-0.5 rounded hover:text-red-500 transition-colors"
     style={{ color: 'var(--color-text-secondary)' }}>
     <Trash2 className="w-3 h-3" />
   </button>
 </div>
 </div>
 )}
 </Draggable>
 ))}
 {provided.placeholder}
 </div>
 )}
 </Droppable>
 </DragDropContext>

 {chapters.length === 0 && (
 <button onClick={addChapter}
 className="w-full text-xs text-center text-text-secondary hover:text-primary py-4 border border-dashed border-border dark:border-border rounded-xl mt-2 transition-colors">
 + Add first chapter
 </button>
 )}
 </div>
 </aside>
 )}

 {/* Main Editor */}
 <div className="flex-1 flex flex-col min-w-0">
 {/* Toolbar */}
 <div className="h-14 bg-white dark:bg-card border-b border-border dark:border-border flex items-center px-4 gap-3 shrink-0">
 {activeChapter && (
 <h3 className="font-semibold text-text dark:text-text-secondary text-sm truncate flex-1">
 {activeChapter.title}
 </h3>
 )}

 {/* Word count */}
 <div className="hidden sm:flex items-center gap-3 text-xs text-text-secondary dark:text-text-secondary">
 <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{wc.toLocaleString()} words</span>
 <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{rt}</span>
 {lastSaved && <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>}
 </div>

 <div className="flex items-center gap-2">
 <button onClick={() => setAiPanel(p => !p)}
 className={clsx('btn-ghost flex items-center gap-1.5 text-sm px-3',
 aiPanel && 'bg-accent dark:bg-accent text-primary dark:text-primary')}>
 <Sparkles className="w-4 h-4" />
 <span className="hidden sm:block">AI Tools</span>
 </button>

 <Link to={`/books/${id}/preview`}
 className="btn-ghost flex items-center gap-1.5 text-sm px-3">
 <Eye className="w-4 h-4" />
 <span className="hidden sm:block">Preview</span>
 </Link>

 <button onClick={() => setFocusMode(f => !f)}
 className="btn-ghost p-2">
 {focusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
 </button>

 <button onClick={() => saveCurrentChapter(true)}
 disabled={saving}
 className="btn-primary flex items-center gap-1.5 text-sm py-2 px-4">
 {saving ? <span className="spinner w-4 h-4" /> : <Save className="w-4 h-4" />}
 Save
 </button>
 </div>
 </div>

 {/* Editor + AI Panel */}
 <div className="flex-1 flex overflow-hidden">
 {/* Text Editor */}
 <div className={clsx('flex-1 overflow-y-auto p-4 sm:p-6', aiPanel ? 'hidden md:block' : '')}>
 {activeChapter ? (
 <div className={clsx('mx-auto', focusMode ? 'max-w-3xl' : 'max-w-4xl')}>
 <ReactQuill
 value={content}
 onChange={setContent}
 modules={QUILL_MODULES}
 placeholder={`Start writing "${activeChapter.title}"…`}
 className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border dark:border-border"
 />
 </div>
 ) : (
 <div className="flex flex-col items-center justify-center h-full text-center">
 <div className="w-16 h-16 rounded-2xl bg-accent dark:bg-card flex items-center justify-center mb-4">
 <BookOpen className="w-8 h-8 text-text-secondary" />
 </div>
 <h3 className="font-semibold text-text dark:text-text-secondary mb-2">No chapters yet</h3>
 <p className="text-sm text-text-secondary mb-4">Add a chapter to start writing</p>
 <button onClick={addChapter} className="btn-primary flex items-center gap-2">
 <Plus className="w-4 h-4" /> Add Chapter
 </button>
 </div>
 )}
 </div>

 {/* AI Panel */}
 {aiPanel && (
 <div className="w-full md:w-72 bg-white dark:bg-card border-l border-border dark:border-border flex flex-col shrink-0">
 <div className="p-4 border-b border-border dark:border-border">
 <h3 className="font-semibold text-sm text-text dark:text-text-secondary flex items-center gap-2">
 <Sparkles className="w-4 h-4 text-primary" /> AI Writing Tools
 </h3>
 <p className="text-xs text-text-secondary mt-1">Enhance your chapter with AI</p>
 </div>
 <div className="flex-1 overflow-y-auto p-3 space-y-2">
 {AI_ACTIONS.map(action => (
 <button
 key={action.id}
 onClick={() => runAiAction(action.id)}
 disabled={aiLoading || !activeChapter}
 className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left hover:bg-accent dark:hover:bg-accent hover:text-primary dark:hover:text-primary text-text dark:text-text-secondary border border-gray-100 dark:border-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
 {aiLoading ? (
 <span className="spinner w-4 h-4 shrink-0" />
 ) : (
 <span className="text-base">{action.icon}</span>
 )}
 {action.label}
 </button>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Outline Modal */}
 <Modal isOpen={outlineModal} onClose={() => setOutlineModal(false)} title="Book Outline" size="lg"
 footer={
 <>
 <button onClick={() => setOutlineModal(false)} className="btn-secondary text-sm">Close</button>
 <button onClick={handleGenerateOutline} disabled={outlineLoading}
 className="btn-primary flex items-center gap-2 text-sm">
 {outlineLoading ? <span className="spinner" /> : <Sparkles className="w-4 h-4" />}
 Generate with AI
 </button>
 </>
 }>
 {outline ? (
 <pre className="whitespace-pre-wrap text-sm text-text dark:text-text-secondary leading-relaxed font-sans">{outline}</pre>
 ) : (
 <div className="text-center py-8">
 <p className="text-text-secondary mb-4">No outline yet. Generate one with AI!</p>
 <button onClick={handleGenerateOutline} disabled={outlineLoading}
 className="btn-primary flex items-center gap-2 mx-auto text-sm">
 {outlineLoading ? <span className="spinner" /> : <Sparkles className="w-4 h-4" />}
 Generate Outline
 </button>
 </div>
 )}
 </Modal>

 {/* Delete Chapter Dialog */}
 <ConfirmDialog
 isOpen={!!deleteChapterId}
 onClose={() => setDeleteChapterId(null)}
 onConfirm={handleDeleteChapter}
 title="Delete Chapter"
 message="This will permanently delete this chapter and all its content."
 />
 </div>
 )
}

export default BookEditorPage
