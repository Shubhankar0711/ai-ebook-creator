import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ChevronLeft, ChevronRight, Check, Upload, Image } from 'lucide-react'
import { bookService, aiService } from '../services/bookService'
import { useAuth } from '../context/AuthContext'
import { generateBookCoverSVG } from '../utils/bookCovers'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

const GENRES   = ['fiction','non-fiction','business','technology','self-help','biography','fantasy','romance','mystery','thriller','education','other']
const TONES    = ['professional','casual','academic','conversational','inspirational','humorous','formal','creative']
const LANGUAGES = ['English','Hindi','Spanish','French','German','Portuguese','Chinese','Japanese','Arabic']

/* ── Canva-style cover templates ─────────────────────────── */
const COVER_TEMPLATES = [
  { id: 'warm',    label: 'Warm Sunset',  gradient: 'linear-gradient(135deg,#f97316,#ef4444,#ec4899)' },
  { id: 'ocean',   label: 'Deep Ocean',   gradient: 'linear-gradient(135deg,#06b6d4,#3b82f6,#6366f1)' },
  { id: 'forest',  label: 'Forest',       gradient: 'linear-gradient(135deg,#22c55e,#14b8a6,#0ea5e9)' },
  { id: 'night',   label: 'Midnight',     gradient: 'linear-gradient(135deg,#1e293b,#312e81,#0f172a)' },
  { id: 'gold',    label: 'Gold Rush',    gradient: 'linear-gradient(135deg,#f59e0b,#f97316,#fbbf24)' },
  { id: 'rose',    label: 'Rose',         gradient: 'linear-gradient(135deg,#f43f5e,#e879f9,#a855f7)' },
  { id: 'slate',   label: 'Slate',        gradient: 'linear-gradient(135deg,#475569,#334155,#1e293b)' },
  { id: 'mint',    label: 'Mint Fresh',   gradient: 'linear-gradient(135deg,#10b981,#059669,#0d9488)' },
]

const TOTAL_STEPS = 5

const NewBookPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileRef  = useRef(null)

  const [step, setStep]             = useState(1)
  const [loading, setLoading]       = useState(false)
  const [genLoading, setGenLoading] = useState(false)
  const [aiQuotaError, setAiQuotaError] = useState(false)
  const [coverMode, setCoverMode]   = useState('template')
  const [selectedTemplate, setSelectedTemplate] = useState(COVER_TEMPLATES[0])
  const [uploadedCover, setUploadedCover] = useState(null)

  const [form, setForm] = useState({
    title:           '',
    subtitle:        '',
    genre:           'non-fiction',
    tone:            'professional',
    language:        'English',
    targetAudience:  '',
    description:     '',
    numberOfChapters: 10,
    outline:         '',
    author:          user?.name || '',
  })

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))
  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS))
  const back = () => { setAiQuotaError(false); setStep(s => Math.max(s - 1, 1)) }

  /* Build cover image — use uploaded file, else generate SVG from template */
  const buildCover = () => {
    if (coverMode === 'upload' && uploadedCover) return uploadedCover
    return generateBookCoverSVG(form.title, form.author, form.genre)
  }

  /* Handle file upload */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    const reader = new FileReader()
    reader.onload = () => { setUploadedCover(reader.result); setCoverMode('upload') }
    reader.readAsDataURL(file)
  }

  /* Generate outline with AI */
  const handleGenerateOutline = async () => {
    if (!form.title) { toast.error('Add a title first'); return }
    setAiQuotaError(false)
    setGenLoading(true)
    try {
      const { data } = await aiService.generateOutline({
        title: form.title, genre: form.genre, tone: form.tone,
        targetAudience: form.targetAudience, language: form.language,
        numberOfChapters: form.numberOfChapters, description: form.description,
      })
      set('outline', data.outline)
      toast.success('Outline generated!')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || ''
      if (msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('exceeded')) {
        setAiQuotaError(true)
      } else {
        toast.error(msg || 'Failed to generate outline')
      }
    } finally {
      setGenLoading(false)
    }
  }

  /* Create book */
  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setLoading(true)
    try {
      const coverImage = buildCover()
      const { data } = await bookService.createBook({ ...form, coverImage })
      toast.success('Book created! 🚀')
      navigate(`/books/${data.book._id}/edit`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create book')
    } finally {
      setLoading(false)
    }
  }

  /* ── Step renderers ───────────────────────────────────── */
  const steps = [
    /* Step 1 — Basic info */
    <div key={1} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>Book details</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Give your book a title and description.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
            Title <span className="text-danger">*</span>
          </label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="e.g. The Art of Productivity"
            className="input-field text-base" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
            Subtitle <span className="text-xs font-normal" style={{ color: 'var(--color-text-secondary)' }}>(optional)</span>
          </label>
          <input type="text" value={form.subtitle} onChange={e => set('subtitle', e.target.value)}
            placeholder="e.g. Master your time and achieve more"
            className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Author</label>
          <input type="text" value={form.author} onChange={e => set('author', e.target.value)}
            placeholder="Your name"
            className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
            Description
            <span className="text-xs font-normal ml-1" style={{ color: 'var(--color-text-secondary)' }}>(optional — helps AI write better)</span>
          </label>
          <div className="relative">
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
              placeholder="What is this book about? What will readers learn?"
              className="input-field resize-none h-auto py-2.5" style={{ height: '80px' }} />
          </div>
          <button type="button"
            onClick={async () => {
              if (!form.title) { toast.error('Add a title first'); return }
              const tid = toast.loading('Generating description…')
              try {
                const { data } = await aiService.generateDescription({
                  title: form.title,
                  genre: form.genre,
                  tone: form.tone,
                  language: form.language,
                })
                if (data.description) {
                  set('description', data.description)
                  toast.success('Description generated!', { id: tid })
                } else {
                  toast.error('Could not generate description', { id: tid })
                }
              } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to generate description', { id: tid })
              }
            }}
            className="mt-1.5 text-xs font-medium flex items-center gap-1 transition-colors"
            style={{ color: 'var(--color-primary)' }}>
            <Sparkles className="w-3 h-3" /> Generate description with AI
          </button>
        </div>
      </div>
    </div>,

    /* Step 2 — Genre & Settings */
    <div key={2} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>Genre & Settings</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Configure how AI will write your book.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Genre</label>
          <div className="flex flex-wrap gap-2">
            {GENRES.map(g => (
              <button key={g} onClick={() => set('genre', g)}
                className={clsx('px-3 py-1.5 rounded-full text-sm font-medium border transition-all capitalize',
                  form.genre === g
                    ? 'bg-primary text-white border-primary'
                    : 'border-border hover:border-primary/50')}
                style={form.genre !== g ? { color: 'var(--color-text)', background: 'var(--color-card)' } : {}}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Tone</label>
            <select value={form.tone} onChange={e => set('tone', e.target.value)} className="input-field capitalize">
              {TONES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Language</label>
            <select value={form.language} onChange={e => set('language', e.target.value)} className="input-field">
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Chapters</label>
            <input type="number" min={1} max={50} value={form.numberOfChapters}
              onChange={e => set('numberOfChapters', parseInt(e.target.value) || 1)}
              className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Target Audience</label>
            <input type="text" value={form.targetAudience} onChange={e => set('targetAudience', e.target.value)}
              placeholder="e.g. Students, Entrepreneurs"
              className="input-field" />
          </div>
        </div>
      </div>
    </div>,

    /* Step 3 — Cover */
    <div key={3} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>Book Cover</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Choose a template or upload your own image.</p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2">
        <button onClick={() => setCoverMode('template')}
          className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all',
            coverMode === 'template' ? 'bg-primary text-white border-primary' : 'border-border')}
          style={coverMode !== 'template' ? { color: 'var(--color-text)', background: 'var(--color-card)' } : {}}>
          <Image className="w-4 h-4" /> Templates
        </button>
        <button onClick={() => { setCoverMode('upload'); fileRef.current?.click() }}
          className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all',
            coverMode === 'upload' ? 'bg-primary text-white border-primary' : 'border-border')}
          style={coverMode !== 'upload' ? { color: 'var(--color-text)', background: 'var(--color-card)' } : {}}>
          <Upload className="w-4 h-4" /> Upload Image
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {coverMode === 'upload' && uploadedCover ? (
        <div className="flex items-start gap-4">
          <img src={uploadedCover} alt="Cover" className="w-32 rounded-xl shadow-md object-cover" style={{ aspectRatio: '3/4' }} />
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Uploaded cover</p>
            <button onClick={() => { setUploadedCover(null); setCoverMode('template'); fileRef.current.value = '' }}
              className="text-xs text-danger hover:underline">Remove</button>
          </div>
        </div>
      ) : (
        <>
          {/* Template grid */}
          <div className="grid grid-cols-4 gap-3">
            {COVER_TEMPLATES.map(tmpl => (
              <button key={tmpl.id} onClick={() => { setSelectedTemplate(tmpl); setCoverMode('template') }}
                className={clsx('relative rounded-xl overflow-hidden transition-all',
                  selectedTemplate.id === tmpl.id ? 'ring-2 ring-primary ring-offset-2 scale-105' : 'hover:scale-105')}
                style={{ aspectRatio: '3/4' }}>
                <div className="w-full h-full flex flex-col items-center justify-center p-2"
                  style={{ background: tmpl.gradient }}>
                  <p className="text-white text-[10px] font-bold text-center leading-tight">
                    {form.title || 'Your Book'}
                  </p>
                </div>
                {selectedTemplate.id === tmpl.id && (
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Selected: <span className="font-medium">{selectedTemplate.label}</span> · Cover is auto-generated with your title and author name
          </p>
        </>
      )}
    </div>,

    /* Step 4 — Outline (optional) */
    <div key={4} className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>Book Outline</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Optionally generate an AI outline. This step is <strong>completely optional</strong> — you can skip it and create the book right now.
        </p>
      </div>

      {/* AI quota warning shown inline */}
      {aiQuotaError && (
        <div className="flex items-start gap-3 p-4 rounded-xl border"
          style={{ background: '#fef3c7', borderColor: '#f59e0b' }}>
          <span className="text-lg">⚠️</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#92400e' }}>AI quota exceeded for today</p>
            <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>
              You can still create your book without an outline —
              just click <strong>"Continue without outline"</strong> below.
            </p>
          </div>
        </div>
      )}

      {/* Generate button */}
      <button onClick={handleGenerateOutline} disabled={genLoading || !form.title}
        className="btn-primary w-full py-3">
        {genLoading
          ? <><span className="spinner" /> Generating outline…</>
          : <><Sparkles className="w-4 h-4" /> Generate Outline with AI</>}
      </button>

      {/* Skip button — always visible */}
      <button onClick={next}
        className="w-full py-2.5 rounded-xl text-sm font-medium border transition-colors"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-secondary)',
          background: 'transparent'
        }}>
        Continue without outline →
      </button>

      {form.outline ? (
        <div>
          <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--color-success)' }}>
            ✓ Outline ready — edit below if needed
          </p>
          <textarea value={form.outline} onChange={e => set('outline', e.target.value)}
            className="input-field resize-none font-mono text-xs"
            style={{ height: '200px', overflowY: 'auto' }} />
        </div>
      ) : (
        !aiQuotaError && (
          <div className="rounded-xl border-2 border-dashed p-6 text-center"
            style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              No outline yet — that's fine! You can generate one inside the editor anytime.
            </p>
          </div>
        )
      )}
    </div>,

    /* Step 5 — Review & Create */
    <div key={5} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>Ready to create</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Review your book details before creating.</p>
      </div>

      <div className="flex gap-5 items-start">
        {/* Cover preview */}
        <div className="shrink-0 w-28 rounded-xl overflow-hidden shadow-md" style={{ aspectRatio: '3/4' }}>
          {coverMode === 'upload' && uploadedCover ? (
            <img src={uploadedCover} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3"
              style={{ background: selectedTemplate.gradient }}>
              <p className="text-white text-xs font-bold text-center leading-tight">{form.title}</p>
              {form.author && <p className="text-white/70 text-[9px] mt-1">{form.author}</p>}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="flex-1 space-y-2.5">
          {[
            ['Title',    form.title || '—'],
            ['Subtitle', form.subtitle || '—'],
            ['Genre',    form.genre],
            ['Tone',     form.tone],
            ['Language', form.language],
            ['Chapters', form.numberOfChapters],
            ['Outline',  form.outline ? '✓ Generated' : 'None (can add later)'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-start gap-2">
              <span className="text-xs w-20 shrink-0 font-medium" style={{ color: 'var(--color-text-secondary)' }}>{k}</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>,
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-background)' }}>
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}>
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Step {step} of {TOTAL_STEPS}
        </span>
        <div className="w-16" />
      </header>

      {/* Progress bar */}
      <div className="h-1 w-full" style={{ background: 'var(--color-border)' }}>
        <div className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
      </div>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center p-6 pb-28 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
              {steps[step - 1]}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer nav */}
      <footer className="fixed bottom-0 left-0 right-0 px-6 py-4"
        style={{ background: 'var(--color-card)', borderTop: '1px solid var(--color-border)' }}>
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={back} disabled={step === 1}
            className="btn-secondary px-6 disabled:opacity-0">
            Back
          </button>

          <div className="flex items-center gap-2">
            {/* Step dots */}
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div key={i} className={clsx('w-2 h-2 rounded-full transition-all',
                i + 1 === step ? 'bg-primary w-5' : i + 1 < step ? 'bg-primary/50' : 'bg-border')} />
            ))}
          </div>

          {step < TOTAL_STEPS ? (
            <button onClick={next} disabled={step === 1 && !form.title.trim()}
              className="btn-primary px-6 disabled:opacity-50">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleCreate} disabled={loading}
              className="btn-primary px-8">
              {loading ? <span className="spinner" /> : <Check className="w-4 h-4" />}
              {loading ? 'Creating…' : 'Create Book'}
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}

export default NewBookPage
