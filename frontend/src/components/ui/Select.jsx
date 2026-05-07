export function Select({ children, className = '', ...props }) {
  return (
    <select
      className={`
        bg-white/[0.06] border border-white/[0.06]
        rounded-xl px-4 py-3 text-[15px]
        text-white
        focus:bg-white/[0.08] focus:border-[#0A84FF]
        focus:ring-4 focus:ring-[#0A84FF]/10
        outline-none transition-all duration-150 ease-out
        backdrop-blur-[8px] appearance-none
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
  )
}
