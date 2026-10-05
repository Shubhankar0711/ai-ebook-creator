import clsx from 'clsx'

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
 const sizes = {
 sm: 'w-4 h-4 border-2',
 md: 'w-6 h-6 border-2',
 lg: 'w-9 h-9 border-2',
 xl: 'w-14 h-14 border-[3px]',
 }
 return (
 <div className={clsx(
 'inline-block rounded-full border-current border-t-transparent animate-spin',
 'text-primary',
 sizes[size],
 className
 )} />
 )
}

export const PageLoader = () => (
 <div className="min-h-screen flex items-center justify-center bg-background">
 <div className="text-center space-y-4">
 <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto">
 <span className="text-2xl">📖</span>
 </div>
 <LoadingSpinner size="lg" />
 <p className="text-sm text-text-secondary">Loading…</p>
 </div>
 </div>
)

export default LoadingSpinner

