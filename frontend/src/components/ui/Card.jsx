export function Card({ children, className = '', hover = false }) {
  return (
    <div
      className={`Card ${hover ? 'hover-lift' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-6 pt-5 pb-4 border-b border-[var(--border-subtle)] ${className}`}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  )
}
