import { clsx } from 'clsx'

export function Button({ 
  className = '', 
  children, 
  variant = 'primary', 
  disabled = false,
  onClick,
  type = 'button',
  ...props 
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
  }

  return (
    <button
      type={type}
      className={clsx(variants[variant], className)}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
