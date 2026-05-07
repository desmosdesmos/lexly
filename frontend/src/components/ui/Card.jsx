export function Card({ children, className = '', hover = false }) {
  return (
    <div
      className={`
        bg-[rgba(28,28,30,0.5)] backdrop-blur-[32px]
        border border-white/[0.06]
        rounded-[22px]
        shadow-[0_4px_24px_rgba(0,0,0,0.3)]
        transition-all duration-300 ease-out
        ${hover ? 'hover:translate-y-[3px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-6 pt-5 pb-4 border-b border-white/[0.04] ${className}`}>
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
