import { clsx } from 'clsx'

export function Alert({ className = '', children, variant = 'info' }) {
  const variants = {
    success: 'alert-success',
    error: 'alert-error',
    info: 'glass',
    warning: 'disclaimer',
  }

  return (
    <div className={clsx('flex items-center gap-3', variants[variant], className)}>
      {children}
    </div>
  )
}
