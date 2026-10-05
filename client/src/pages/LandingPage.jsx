import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  BookOpen, Lightbulb, Download, LayoutDashboard,
  ChevronDown, Star, Check, ArrowRight, Sparkles, Menu, X, Moon, Sun
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const features = [
  { icon: Lightbulb,       color: '#7c3aed', title: 'AI-Powered Writing',  desc: "Overcome writer's block with our smart assistant that helps you generate ideas, outlines, and content.", highlight: false },
  { icon: BookOpen,        color: '#3b82f6', title: 'Immersive Reader',    desc: 'Preview your ebook in a clean, read-only format. Adjust font sizes for a comfortable reading experience.', highlight: false },
  { icon: Download,        color: '#10b981', title: 'One-Click Export',    desc: 'Export your ebook to PDF and DOCX formats instantly, ready for publishing.', highlight: true },
  { icon: LayoutDashboard, color: '#ec4899', title: 'eBook Management',    desc: 'Organize all your ebook projects in a personal dashboard. Easily track progress and manage your library.', highlight: false },
]

const testimonials = [
  { name: 'Sarah M.',  role: 'Author',          avatar: 'S', text: "I published my first eBook in 3 days. The AI helped me through writer's block and the PDF export looks amazing." },
  { name: 'David K.',  role: 'Content Creator', avatar: 'D', text: 'The chapter management and AI rewrite tools save me hours every week. This is the future of writing.' },
  { name: 'Priya R.',  role: 'Entrepreneur',    avatar: 'P', text: 'Created a 40-chapter business guide in a weekend. The AI outline feature is incredibly useful.' },
]

const faqs = [
  { q: 'Which AI model is used?',       a: 'We use Groq (Llama 3) for fast, high-quality AI generation. Configure your preferred provider in settings.' },
  { q: 'Can I export to PDF?',          a: 'Yes — every book exports as a professionally formatted PDF with cover page, TOC, and styled chapters.' },
  { q: 'Is my data private?',           a: 'Books are private by default. You can optionally create public share links.' },
  { q: 'What languages are supported?', a: 'Write in 12+ languages including English, Hindi, Spanish, French, German, and more.' },
]

/* ── FAQ Item ─────────────────────────── */
const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
        style={{ background: 'transparent' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-accent)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <span className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{q}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--color-text-secondary)' }} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm leading-relaxed animate-fade-in"
          style={{ color: 'var(--color-text-secondary)' }}>{a}</div>
      )}
    </div>
  )
}

/* ── Navbar ───────────────────────────── */
const LandingNav = () => {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{ background: 'var(--color-card)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="page-container flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>AI eBook Creator</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {[['#features','Features'],['#testimonials','Testimonials']].map(([h,l]) => (
            <a key={h} href={h} className="px-3 py-1.5 text-sm rounded-lg transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text)'; e.currentTarget.style.background = 'var(--color-accent)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.background = 'transparent' }}>
              {l}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleDarkMode} className="p-2 rounded-xl transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <>
              <Link to="/dashboard" className="btn-secondary text-xs hidden sm:flex">Dashboard</Link>
              <button onClick={logout} className="btn-ghost text-xs hidden sm:block">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block text-sm font-medium px-3 py-1.5 transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}>
                Login
              </Link>
              <Link to="/register" className="btn-primary text-xs py-2 px-4">Get Started</Link>
            </>
          )}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-xl"
            style={{ color: 'var(--color-text-secondary)' }}>
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden px-4 py-3 space-y-1 animate-slide-up"
          style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
          {[['#features','Features'],['#testimonials','Testimonials']].map(([h,l]) => (
            <a key={h} href={h} onClick={() => setOpen(false)}
              className="block py-2 px-3 text-sm rounded-xl transition-colors"
              style={{ color: 'var(--color-text)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-accent)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {l}
            </a>
          ))}
          <div className="flex gap-2 pt-2">
            <Link to="/login" className="btn-secondary flex-1 text-center text-sm" onClick={() => setOpen(false)}>Login</Link>
            <Link to="/register" className="btn-primary flex-1 text-center text-sm" onClick={() => setOpen(false)}>Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

/* ── Landing Page ─────────────────────── */
const LandingPage = () => (
  <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
    <LandingNav />

    {/* Hero */}
    <section className="pt-28 pb-20" style={{ background: 'var(--color-background)' }}>
      <div className="page-container text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 animate-fade-in"
          style={{ background: 'var(--color-accent)', border: '1px solid var(--color-border)', color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" /> AI-Powered eBook Platform
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight animate-slide-up"
          style={{ color: 'var(--color-text)' }}>
          Write. Edit. Publish.<br />
          <span style={{ color: 'var(--color-primary)' }}>Your eBooks, Faster.</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg max-w-xl mx-auto animate-slide-up"
          style={{ color: 'var(--color-text-secondary)', animationDelay: '.08s' }}>
          Generate full chapters with AI, manage your content in a beautiful editor,
          and export stunning PDFs — all in one platform built for modern writers.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8 animate-slide-up"
          style={{ animationDelay: '.16s' }}>
          <Link to="/register" className="btn-primary text-base py-3 px-8">
            <Sparkles className="w-4 h-4" /> Start Writing Free
          </Link>
          <a href="#features" className="btn-secondary text-base py-3 px-8">
            See Features <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-10 mt-16 animate-fade-in" style={{ animationDelay: '.24s' }}>
          {[['10k+','Books Created'],['50+','AI Templates'],['12','Languages'],['4.9★','Rating']].map(([v,l]) => (
            <div key={l} className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{v}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section id="features" className="py-20" style={{ background: 'var(--color-accent)' }}>
      <div className="page-container">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: 'var(--color-card)', color: 'var(--color-primary)', border: '1px solid var(--color-border)' }}>
            • Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--color-text)' }}>
            Everything You Need to<br />
            <span style={{ color: 'var(--color-primary)' }}>Create Your Ebook</span>
          </h2>
          <p className="mt-4 text-sm max-w-md mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Our platform is packed with powerful features to help you write, design, and publish your ebook effortlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, color, title, desc, highlight }) => (
            <div key={title} className="rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'var(--color-card)',
                border: highlight ? `2px solid ${color}` : '1px solid var(--color-border)',
                boxShadow: highlight ? `0 4px 20px ${color}30` : undefined,
              }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: color }}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-sm mb-2"
                style={{ color: highlight ? color : 'var(--color-text)' }}>{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Testimonials */}
    <section id="testimonials" className="py-20" style={{ background: 'var(--color-background)' }}>
      <div className="page-container">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-secondary)' }}>Testimonials</p>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Loved by writers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map(({ name, role, avatar, text }) => (
            <div key={name} className="rounded-2xl p-6 transition-shadow duration-200"
              style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_,i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>"{text}"</p>
              <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold">{avatar}</div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Pricing — link to /pricing-plans */}
    <section className="py-20" style={{ background: 'var(--color-accent)' }}>
      <div className="page-container">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-secondary)' }}>Pricing</p>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Simple, transparent pricing</h2>
          <p className="mt-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Start free, upgrade when you need more.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {[
            { name:'Free',       price:'₹0',    period:'forever', features:['5 eBooks','10 AI/day','PDF export','Basic editor'],  highlight:false, cta:'Get Started'     },
            { name:'Pro',        price:'₹999',  period:'/month',  features:['Unlimited eBooks','500 AI/day','All tools','Analytics','Priority support'], highlight:true, cta:'Upgrade to Pro', badge:'Popular' },
            { name:'Enterprise', price:'₹3,999',period:'/month',  features:['Everything in Pro','Team workspace','API access','Dedicated support'], highlight:false, cta:'Get Enterprise' },
          ].map(({ name, price, period, features: f, highlight, cta, badge }) => (
            <div key={name} className="rounded-2xl p-6 flex flex-col"
              style={{
                background:   highlight ? '#7c3aed' : 'var(--color-card)',
                border:       highlight ? '2px solid #7c3aed' : '1px solid var(--color-border)',
                boxShadow:    highlight ? '0 8px 30px rgba(124,58,237,.3)' : undefined,
                position:     'relative',
              }}>
              {badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'white', color: '#7c3aed', border: '1px solid #ddd6fe' }}>
                  {badge}
                </div>
              )}
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: highlight ? 'rgba(255,255,255,.7)' : 'var(--color-text-secondary)' }}>{name}</p>
                <div className="flex items-end gap-1 mb-5">
                  <span className="text-3xl font-extrabold" style={{ color: highlight ? 'white' : 'var(--color-text)' }}>{price}</span>
                  <span className="text-sm mb-0.5" style={{ color: highlight ? 'rgba(255,255,255,.6)' : 'var(--color-text-secondary)' }}>{period}</span>
                </div>
                <ul className="space-y-2.5">
                  {f.map(feat => (
                    <li key={feat} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: highlight ? 'white' : '#22c55e' }} />
                      <span style={{ color: highlight ? 'rgba(255,255,255,.9)' : 'var(--color-text-secondary)' }}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/pricing-plans" className="mt-6 py-2.5 rounded-xl font-semibold text-center text-sm block transition-all"
                style={highlight ? { background: 'white', color: '#7c3aed' } : { background: 'var(--color-primary)', color: 'white' }}>
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* FAQ */}
    <section className="py-20" style={{ background: 'var(--color-background)' }}>
      <div className="page-container max-w-2xl">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-secondary)' }}>FAQ</p>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Common questions</h2>
        </div>
        <div className="space-y-2">
          {faqs.map(faq => <FAQItem key={faq.q} {...faq} />)}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 bg-primary">
      <div className="page-container text-center text-white">
        <h2 className="text-3xl font-bold mb-3">Ready to write your first eBook?</h2>
        <p className="mb-7 text-sm max-w-sm mx-auto" style={{ color: 'rgba(255,255,255,.8)' }}>
          Join thousands of writers. Start free, no credit card required.
        </p>
        <Link to="/register"
          className="inline-flex items-center gap-2 font-bold py-3 px-8 rounded-xl text-sm transition-colors"
          style={{ background: 'white', color: '#7c3aed' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f3e8ff'}
          onMouseLeave={e => e.currentTarget.style.background = 'white'}>
          <Sparkles className="w-4 h-4" /> Start Writing Free
        </Link>
      </div>
    </section>

    {/* Footer */}
    <footer style={{ background: 'var(--color-card)', borderTop: '1px solid var(--color-border)' }}>
      <div className="page-container py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>AI eBook Creator</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            © {new Date().getFullYear()} AI eBook Creator. Built with MERN Stack + Groq AI.
          </p>
          <div className="flex gap-4 text-xs items-center">
            <a href="mailto:supportebookcreator@gmail.com"
              className="transition-colors" style={{ color: 'var(--color-primary)' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              supportebookcreator@gmail.com
            </a>
            {[['Privacy','/privacy'],['Terms','/terms'],['Contact','/contact']].map(([l,to]) => (
              <Link key={l} to={to} className="transition-colors" style={{ color: 'var(--color-text-secondary)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}>
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  </div>
)

export default LandingPage
