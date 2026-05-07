import { createContext, useContext, useEffect, useState } from 'react'

const ThemeModeContext = createContext({ mode: 'dark', toggleMode: () => {} })

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('laxly-mode') || 'dark')

  const toggleMode = () => {
    setMode(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('laxly-mode', next)
      document.documentElement.setAttribute('data-mode', next)
      return next
    })
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode)
  }, [mode])

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ThemeModeContext.Provider>
  )
}

export function useThemeMode() {
  return useContext(ThemeModeContext)
}
