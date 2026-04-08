import { clsx } from 'clsx'

export function Loader({ className = '', size = 'md' }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div className={clsx(sizes[size], 'relative')}>
        <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
        <div 
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin"
          style={{ animationDuration: '1s' }}
        ></div>
      </div>
    </div>
  )
}
