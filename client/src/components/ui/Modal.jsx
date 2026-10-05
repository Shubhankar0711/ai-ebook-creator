import { useEffect } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

const Modal = ({ isOpen, onClose, title, children, size = 'md', footer }) => {
 useEffect(() => {
 document.body.style.overflow = isOpen ? 'hidden' : ''
 return () => { document.body.style.overflow = '' }
 }, [isOpen])

 useEffect(() => {
 const h = e => { if (e.key === 'Escape') onClose() }
 if (isOpen) window.addEventListener('keydown', h)
 return () => window.removeEventListener('keydown', h)
 }, [isOpen, onClose])

 if (!isOpen) return null

 const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' }

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
 <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
 <div className={clsx(
 'relative w-full bg-white dark:bg-card rounded-2xl shadow-card-lg animate-slide-up',
 'border border-border dark:border-border',
 sizes[size]
 )}>
 {title && (
 <div className="flex items-center justify-between px-5 py-4 border-b border-border dark:border-border">
 <h2 className="text-base font-semibold text-text dark:text-text-secondary">{title}</h2>
 <button onClick={onClose}
 className="p-1.5 rounded-lg hover:bg-accent dark:hover:bg-card transition-colors text-text-secondary">
 <X className="w-4 h-4" />
 </button>
 </div>
 )}
 <div className="px-5 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
 {footer && (
 <div className="px-5 py-4 border-t border-border dark:border-border flex items-center justify-end gap-2">
 {footer}
 </div>
 )}
 </div>
 </div>
 )
}

export default Modal

