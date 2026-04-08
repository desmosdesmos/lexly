/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        foreground: '#f5f5f7',
        card: 'rgba(255, 255, 255, 0.05)',
        'card-foreground': '#f5f5f7',
        primary: {
          DEFAULT: '#6366f1',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          foreground: '#f5f5f7',
        },
        muted: {
          DEFAULT: 'rgba(255, 255, 255, 0.06)',
          foreground: 'rgba(245, 245, 247, 0.5)',
        },
        accent: {
          DEFAULT: '#818cf8',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        border: 'rgba(255, 255, 255, 0.08)',
        ring: '#6366f1',
        sidebar: {
          DEFAULT: 'rgba(255, 255, 255, 0.03)',
          foreground: '#f5f5f7',
          primary: '#6366f1',
          'primary-foreground': '#ffffff',
          accent: 'rgba(255, 255, 255, 0.08)',
          'accent-foreground': '#f5f5f7',
          border: 'rgba(255, 255, 255, 0.06)',
          ring: '#6366f1',
        },
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-in': 'slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
