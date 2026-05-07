export function Alert({ children, variant = 'info', className = '' }) {
  const variants = {
    info: 'bg-[#0A84FF]/8 border-[#0A84FF]/15 text-[#0A84FF]',
    success: 'bg-[#30D158]/8 border-[#30D158]/15 text-[#30D158]',
    warning: 'bg-[#FF9F0A]/8 border-[#FF9F0A]/15 text-[#FF9F0A]',
    error: 'bg-[#FF453A]/8 border-[#FF453A]/15 text-[#FF453A]',
  }

  return (
    <div
      className={`
        flex items-start gap-3
        p-4 rounded-xl
        backdrop-blur-xl
        border
        text-sm
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
