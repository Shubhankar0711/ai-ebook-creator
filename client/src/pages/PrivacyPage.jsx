import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>{title}</h2>
    <div className="text-sm leading-relaxed space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
      {children}
    </div>
  </div>
)

const PrivacyPage = () => (
  <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
    {/* Nav */}
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

    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-primary)' }}>Legal</p>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Privacy Policy</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <Section title="1. Information We Collect">
        <p>We collect information you provide when you register for an account, including your name, email address, and password. We also collect the books and chapters you create on our platform.</p>
        <p>We automatically collect certain technical information when you use our service, including IP address, browser type, and pages visited, to improve our platform.</p>
      </Section>

      <Section title="2. How We Use Your Information">
        <p>We use your information to provide, maintain, and improve our services — including AI-assisted writing features, PDF export, and book management.</p>
        <p>We do not sell your personal information to third parties. Your books and content are private by default.</p>
      </Section>

      <Section title="3. AI Features & Data">
        <p>When you use AI writing features, your prompts are sent to our AI provider (Groq) to generate content. We do not store these prompts permanently or use them to train AI models.</p>
        <p>Generated content belongs to you. You retain full ownership of everything you create on our platform.</p>
      </Section>

      <Section title="4. Data Security">
        <p>We use industry-standard security measures including JWT authentication, bcrypt password hashing, and HTTPS encryption to protect your data.</p>
        <p>Your password is never stored in plain text. We use bcrypt with a salt factor of 12.</p>
      </Section>

      <Section title="5. Cookies">
        <p>We use localStorage to store your authentication token and theme preference. We do not use tracking cookies or share data with advertising networks.</p>
      </Section>

      <Section title="6. Your Rights">
        <p>You can delete your account and all associated data at any time from your settings page. You can also export your books as PDF before deletion.</p>
        <p>To request data deletion, contact us at <a href="mailto:support@ebookcreator.app" className="text-primary underline">support@ebookcreator.app</a>.</p>
      </Section>

      <Section title="7. Contact">
        <p>If you have questions about this Privacy Policy, email us at <a href="mailto:support@ebookcreator.app" className="text-primary underline">support@ebookcreator.app</a>.</p>
      </Section>
    </main>
  </div>
)

export default PrivacyPage
