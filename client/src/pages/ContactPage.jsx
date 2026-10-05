import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../services/api'

const SUPPORT_EMAIL = 'supportebookcreator@gmail.com'

const ContactPage = () => {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [status, setStatus]   = useState(null) // 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }))
    // Clear field error on change
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }))
  }

  // Frontend validation — mirrors backend rules
  const validate = () => {
    const e = {}
    if (!form.name.trim())                   e.name    = 'Name is required.'
    if (!form.email.trim())                  e.email   = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.'
    if (!form.message.trim())                e.message = 'Message is required.'
    if (form.subject.length  > 200)          e.subject = 'Subject is too long (max 200 chars).'
    if (form.message.length  > 5000)         e.message = 'Message is too long (max 5000 chars).'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setStatus(null)
    setErrorMsg('')

    try {
      await api.post('/contact', {
        name:    form.name.trim(),
        email:   form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      })
      setStatus('success')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setStatus('error')
      setErrorMsg(
        err.response?.data?.message ||
        'Failed to send message. Please try again or email us directly.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      {/* Header */}
      <header className="sticky top-0 z-10 h-14 flex items-center justify-between px-6 backdrop-blur-md"
        style={{ background: 'var(--color-card)', borderBottom: '1px solid var(--color-border)' }}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>AI eBook Creator</span>
        </Link>
        <Link to="/" className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}>
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-primary)' }}>
            Get in Touch
          </p>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Contact Us</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Have a question or need help? We typically respond within 24 hours.
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <a href={`mailto:${SUPPORT_EMAIL}`}
            className="rounded-xl p-4 flex items-center gap-3 transition-colors"
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-card)'}>
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Email</p>
              <p className="text-xs font-medium truncate" style={{ color: 'var(--color-primary)' }}>
                {SUPPORT_EMAIL}
              </p>
            </div>
          </a>
          <div className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Response Time</p>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Within 24 hours</p>
            </div>
          </div>
        </div>

        {/* Success state */}
        {status === 'success' ? (
          <div className="rounded-2xl p-8 text-center"
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <CheckCircle className="w-14 h-14 mx-auto mb-4 text-green-500" />
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              Message Sent!
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Your message has been sent successfully. Our support team will get back to you soon at{' '}
              <strong>{SUPPORT_EMAIL}</strong>.
            </p>
            <button
              onClick={() => setStatus(null)}
              className="btn-secondary text-sm">
              Send another message
            </button>
          </div>
        ) : (
          /* Contact form */
          <form onSubmit={handleSubmit} noValidate className="rounded-2xl p-6 space-y-4"
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>

            {/* Global error banner */}
            {status === 'error' && (
              <div className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Failed to send message</p>
                  <p className="text-xs text-red-600 mt-0.5">{errorMsg}</p>
                  <a href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-xs text-red-700 underline mt-1 inline-block">
                    Email us directly instead →
                  </a>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                  Name <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Your full name"
                  className="input-field"
                  style={errors.name ? { borderColor: '#ef4444' } : {}}
                  disabled={loading} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input type="email" value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className="input-field"
                  style={errors.email ? { borderColor: '#ef4444' } : {}}
                  disabled={loading} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                Subject <span className="text-xs font-normal" style={{ color: 'var(--color-text-secondary)' }}>(optional)</span>
              </label>
              <input type="text" value={form.subject}
                onChange={e => set('subject', e.target.value)}
                placeholder="What's this about?"
                className="input-field"
                style={errors.subject ? { borderColor: '#ef4444' } : {}}
                disabled={loading} />
              {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                Message <span className="text-red-500">*</span>
              </label>
              <textarea value={form.message}
                onChange={e => set('message', e.target.value)}
                placeholder="How can we help you? Please describe your issue in detail."
                rows={6}
                className="input-field resize-none"
                style={{ height: '144px', ...(errors.message ? { borderColor: '#ef4444' } : {}) }}
                disabled={loading} />
              <div className="flex justify-between mt-1">
                {errors.message
                  ? <p className="text-xs text-red-500">{errors.message}</p>
                  : <span />}
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {form.message.length}/5000
                </p>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? (
                <><span className="spinner" /> Sending…</>
              ) : (
                <><Send className="w-4 h-4" /> Send Message</>
              )}
            </button>

            <p className="text-xs text-center" style={{ color: 'var(--color-text-secondary)' }}>
              Or email us directly at{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--color-primary)' }}>
                {SUPPORT_EMAIL}
              </a>
            </p>
          </form>
        )}
      </main>
    </div>
  )
}

export default ContactPage
