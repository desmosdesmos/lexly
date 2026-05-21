export function Logo({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-14',
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 40 40"
        className={`${sizes[size]} w-auto logo-svg-icon`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Modern Abstract Icon: A shield-like 'L' with AI glow */}
        <path
          d="M32 10V26C32 28.2091 30.2091 30 28 30H12L8 34V10C8 7.79086 9.79086 6 12 6H28C30.2091 6 32 7.79086 32 10Z"
          fill="url(#logo-gradient)"
        />
        {/* The 'L' cut-out */}
        <path
          d="M16 14V22H24"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* AI Sparkle */}
        <circle cx="28" cy="12" r="3" fill="white" className="animate-pulse" />
        
        <defs>
          <linearGradient id="logo-gradient" x1="8" y1="6" x2="32" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0A84FF" />
            <stop offset="1" stopColor="#5E5CE6" />
          </linearGradient>
        </defs>
      </svg>
      
      <span 
        className="font-bold tracking-tight text-white select-none"
        style={{ 
          fontSize: size === 'sm' ? '18px' : size === 'md' ? '22px' : size === 'lg' ? '28px' : '36px',
          fontFamily: "'Google Sans', sans-serif"
        }}
      >
        Laxly<span className="text-[#0A84FF]">.</span>
      </span>
    </div>
  )
}
