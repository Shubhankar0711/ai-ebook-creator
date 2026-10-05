import { AlertTriangle, ExternalLink, X } from 'lucide-react'
import { useState } from 'react'

/**
 * Shows a helpful banner when AI calls fail due to missing/invalid key.
 * Pass `error` as the error message string from the catch block.
 */
const AIKeyBanner = ({ error, onDismiss }) => {
 const [dismissed, setDismissed] = useState(false)

 const isKeyError = error && (
 error.includes('AIza') ||
 error.includes('API key') ||
 error.includes('not configured') ||
 error.includes('AI_KEY')
 )

 if (!isKeyError || dismissed) return null

 const handleDismiss = () => {
 setDismissed(true)
 onDismiss?.()
 }

 return (
 <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 flex gap-3 animate-slide-up">
 <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">AI API Key Required</p>
 <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
 AI features need a valid Gemini API key (starts with <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">AIza</code>).
 Get one free — no credit card needed.
 </p>
 <div className="flex flex-wrap gap-2 mt-3">
 <a
 href="https://aistudio.google.com/app/apikey"
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 px-3 py-1.5 rounded-lg transition-colors">
 Get free Gemini key <ExternalLink className="w-3 h-3" />
 </a>
 <div className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1 px-1">
 Then paste it in <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">server/.env</code> as <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">GEMINI_API_KEY=AIza...</code>
 </div>
 </div>
 </div>
 <button onClick={handleDismiss} className="text-amber-400 hover:text-amber-600 transition-colors shrink-0">
 <X className="w-4 h-4" />
 </button>
 </div>
 )
}

export default AIKeyBanner

