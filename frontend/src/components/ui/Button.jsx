export function Button({ children, variant = 'primary', className = '', disabled = false, type = 'button', onClick, ...props }) {
  const variants = {
    primary: 'bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6] text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5',
    secondary: 'bg-white/[0.06] text-white/80 border border-white/[0.06] hover:bg-white/[0.1]',
    danger: 'bg-[#FF453A]/10 text-[#FF453A] border border-[#FF453A]/20 hover:bg-[#FF453A]/15',
    ghost: 'text-white/50 hover:text-white hover:bg-white/[0.06]',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        px-5 py-2.5 rounded-xl
        font-medium text-sm
        transition-all duration-150 ease-out
        active:scale-[0.96]
        disabled:opacity-40 disabled:pointer-events-none
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
