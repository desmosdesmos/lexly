export function Select({ children, className = '', ...props }) {
  return (
    <select
      className={`input-field appearance-none ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}
