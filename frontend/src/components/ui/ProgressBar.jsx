import { clsx } from 'clsx'

export function ProgressBar({ value, max = 100, label, className = '' }) {
  const percentage = Math.min((value / max) * 100, 100)
  
  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-sm text-muted-foreground">{value} / {max}</span>
        </div>
      )}
      <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-accent h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
