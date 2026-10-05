import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading = false }) => (
 <Modal isOpen={isOpen} onClose={onClose} title="" size="sm"
 footer={
 <>
 <button onClick={onClose} className="btn-secondary text-sm" disabled={loading}>Cancel</button>
 <button onClick={onConfirm} disabled={loading}
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50">
 {loading && <span className="spinner w-4 h-4" />}
 {confirmLabel}
 </button>
 </>
 }>
 <div className="flex flex-col items-center text-center py-4 gap-4">
 <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
 <AlertTriangle className="w-7 h-7 text-red-500" />
 </div>
 <div>
 <h3 className="text-base font-semibold text-text dark:text-text-secondary">{title}</h3>
 <p className="text-sm text-text-secondary dark:text-text-secondary mt-1">{message}</p>
 </div>
 </div>
 </Modal>
)

export default ConfirmDialog

