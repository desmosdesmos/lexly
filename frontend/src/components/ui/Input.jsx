export function Input({ className = '', ...props }) {
  return (
    <input
      className={`
        bg-white/[0.06] border border-white/[0.06]
        rounded-xl px-4 py-3 text-[15px]
        text-white placeholder:text-white/30
        focus:bg-white/[0.08] focus:border-[#0A84FF]
        focus:ring-4 focus:ring-[#0A84FF]/10
        outline-none transition-all duration-150 ease-out
        backdrop-blur-[8px]
        ${className}
      `}
      {...props}
    />
  )
}
