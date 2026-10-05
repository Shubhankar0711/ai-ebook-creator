import clsx from 'clsx'

const palette = {
 brand: 'bg-primary',
 violet: 'bg-primary',
 purple: 'bg-primary',
 blue: 'bg-blue-500',
 green: 'bg-emerald-500',
 orange: 'bg-orange-500',
 pink: 'bg-pink-500',
}

const StatCard = ({ icon: Icon, label, value, color = 'violet', subtitle, trend }) => (
 <div className="card p-4 flex items-center gap-3 hover:shadow-card-lg transition-shadow duration-200">
 <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', palette[color] || palette.violet)}>
 <Icon className="w-5 h-5 text-white" />
 </div>
 <div className="min-w-0">
 <p className="text-xs text-text-secondary dark:text-text-secondary font-medium">{label}</p>
 <p className="text-xl font-bold text-text dark:text-text-secondary leading-tight">{value}</p>
 {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
 {trend !== undefined && (
 <p className={clsx('text-xs font-medium', trend >= 0 ? 'text-emerald-500' : 'text-red-500')}>
 {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
 </p>
 )}
 </div>
 </div>
)

export default StatCard

