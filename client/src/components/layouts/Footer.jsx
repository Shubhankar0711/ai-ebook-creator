import { BookOpen, Github, Twitter, Linkedin } from 'lucide-react'

const Footer = () => (
 <footer className="bg-card dark:bg-card text-text-secondary border-t border-border">
 <div className="page-container py-12">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
 {/* Brand */}
 <div className="md:col-span-2">
 <div className="flex items-center gap-2.5 mb-4">
 <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
 <BookOpen className="w-4 h-4 text-white" />
 </div>
 <span className="font-bold text-sm text-white">AI eBook Creator</span>
 </div>
 <p className="text-sm leading-relaxed max-w-xs text-text-secondary">
 Create professional eBooks with AI. Write, edit, and export stunning books in minutes.
 </p>
 <div className="flex items-center gap-2 mt-5">
 {[Github, Twitter, Linkedin].map((Icon, i) => (
 <a key={i} href="#"
 className="w-8 h-8 rounded-lg bg-card hover:bg-card flex items-center justify-center transition-colors">
 <Icon className="w-3.5 h-3.5" />
 </a>
 ))}
 </div>
 </div>

 <div>
 <h4 className="text-white text-sm font-semibold mb-3">Product</h4>
 <ul className="space-y-2 text-sm">
 {['Features', 'Pricing', 'Changelog', 'Roadmap'].map(item => (
 <li key={item}>
 <a href="#" className="hover:text-white transition-colors text-text-secondary">{item}</a>
 </li>
 ))}
 </ul>
 </div>

 <div>
 <h4 className="text-white text-sm font-semibold mb-3">Legal</h4>
 <ul className="space-y-2 text-sm">
 {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
 <li key={item}>
 <a href="#" className="hover:text-white transition-colors text-text-secondary">{item}</a>
 </li>
 ))}
 </ul>
 </div>
 </div>

 <div className="border-t border-border mt-10 pt-6 text-center text-xs text-text-secondary">
 © {new Date().getFullYear()} AI eBook Creator. Built with the MERN Stack + AI.
 </div>
 </div>
 </footer>
)

export default Footer

