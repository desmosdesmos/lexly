export function Logo({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
  }

  return (
    <svg
      viewBox="0 0 200 50"
      className={`${sizes[size]} w-auto logo-svg ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Icon - Scales of Justice */}
      <g transform="translate(2, 8)">
        {/* Base */}
        <rect x="12" y="28" width="10" height="4" rx="2" fill="url(#base-gradient)" />
        {/* Pillar */}
        <rect x="15" y="8" width="4" height="20" rx="2" fill="url(#pillar-gradient)" />
        {/* Beam */}
        <rect x="4" y="8" width="26" height="3" rx="1.5" fill="url(#beam-gradient)" />
        {/* Left pan */}
        <path d="M4 11 L1 22 Q4 24 7 22 Z" fill="url(#pan-gradient)" opacity="0.9" />
        <line x1="4" y1="11" x2="1" y2="22" stroke="white" stroke-opacity="0.6" stroke-width="0.5" />
        <line x1="4" y1="11" x2="7" y2="22" stroke="white" stroke-opacity="0.6" stroke-width="0.5" />
        {/* Right pan */}
        <path d="M30 11 L27 22 Q30 24 33 22 Z" fill="url(#pan-gradient)" opacity="0.9" />
        <line x1="30" y1="11" x2="27" y2="22" stroke="white" stroke-opacity="0.6" stroke-width="0.5" />
        <line x1="30" y1="11" x2="33" y2="22" stroke="white" stroke-opacity="0.6" stroke-width="0.5" />
        {/* Top dot */}
        <circle cx="17" cy="8" r="2" fill="white" opacity="0.9" />
      </g>

      {/* Text - Laxly */}
      <text
        x="48"
        y="34"
        font-family="'Google Sans', -apple-system, BlinkMacSystemFont, sans-serif"
        font-size="32"
        font-weight="700"
        fill="white"
        letter-spacing="-0.5"
      >
        Laxly
      </text>

      {/* Gradient definitions */}
      <defs>
        <linearGradient id="base-gradient" x1="12" y1="28" x2="22" y2="32" gradientUnits="userSpaceOnUse">
          <stop stop-color="#0A84FF" />
          <stop offset="1" stop-color="#5E5CE6" />
        </linearGradient>
        <linearGradient id="pillar-gradient" x1="15" y1="8" x2="19" y2="28" gradientUnits="userSpaceOnUse">
          <stop stop-color="#5E5CE6" />
          <stop offset="1" stop-color="#0A84FF" />
        </linearGradient>
        <linearGradient id="beam-gradient" x1="4" y1="8" x2="30" y2="11" gradientUnits="userSpaceOnUse">
          <stop stop-color="#0A84FF" />
          <stop offset="1" stop-color="#5E5CE6" />
        </linearGradient>
        <linearGradient id="pan-gradient" x1="1" y1="11" x2="7" y2="24" gradientUnits="userSpaceOnUse">
          <stop stop-color="#0A84FF" stop-opacity="0.3" />
          <stop offset="1" stop-color="#5E5CE6" stop-opacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
  )
}
