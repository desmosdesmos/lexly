import { clsx } from 'clsx'

export function Card({ className = '', children, hover = false }) {
  return (
    <div
      className={clsx(
        'glass',
        hover && 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children }) {
  return (
    <div className={clsx('px-6 py-4 border-b border-white/5', className)}>
      {children}
    </div>
  )
}

export function CardBody({ className = '', children }) {
  return (
    <div className={clsx('p-6', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ className = '', children }) {
  return (
    <div className={clsx('px-6 py-4 border-t border-white/5', className)}>
      {children}
    </div>
  )
}
