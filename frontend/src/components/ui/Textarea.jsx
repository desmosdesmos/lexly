export function Textarea({ className = '', rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`input-field resize-y ${className}`}
      {...props}
    />
  )
}
