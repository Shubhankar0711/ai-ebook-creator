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

const TermsPage = () => (
  <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
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
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Terms of Service</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <Section title="1. Acceptance of Terms">
        <p>By creating an account or using AI eBook Creator, you agree to be bound by these Terms of Service. If you do not agree, do not use our service.</p>
      </Section>

      <Section title="2. Account Responsibilities">
        <p>You are responsible for maintaining the security of your account and password. You must not share your account credentials with others.</p>
        <p>You must be at least 13 years old to use this service.</p>
      </Section>

      <Section title="3. Content Ownership">
        <p>You retain full ownership of all content you create on AI eBook Creator, including books, chapters, and outlines generated with AI assistance.</p>
        <p>By using our platform, you grant us a limited license to store and display your content solely for the purpose of providing the service to you.</p>
      </Section>

      <Section title="4. Acceptable Use">
        <p>You agree not to use our service to create content that is illegal, harmful, defamatory, or violates the rights of others.</p>
        <p>You may not reverse-engineer, scrape, or abuse our AI features in a way that violates our rate limits or the terms of our AI providers.</p>
      </Section>

      <Section title="5. AI-Generated Content">
        <p>AI-generated content is provided as-is. You are responsible for reviewing, editing, and verifying any AI-generated content before publishing.</p>
        <p>We do not guarantee the accuracy, originality, or quality of AI-generated content.</p>
      </Section>

      <Section title="6. Subscriptions & Payments">
        <p>Free accounts are subject to usage limits. Paid plans are billed monthly. You can cancel your subscription at any time from the pricing page.</p>
        <p>All payments are processed securely via Razorpay. We do not store your payment card details.</p>
      </Section>

      <Section title="7. Service Availability">
        <p>We strive to maintain 99% uptime but do not guarantee uninterrupted service. We are not liable for any losses due to service downtime.</p>
      </Section>

      <Section title="8. Termination">
        <p>We reserve the right to suspend or terminate accounts that violate these terms. You can delete your account at any time from settings.</p>
      </Section>

      <Section title="9. Contact">
        <p>For questions about these Terms, contact us at <a href="mailto:support@ebookcreator.app" className="text-primary underline">support@ebookcreator.app</a>.</p>
      </Section>
    </main>
  </div>
)

export default TermsPage
