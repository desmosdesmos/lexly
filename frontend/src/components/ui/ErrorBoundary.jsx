import { useState, useEffect } from 'react'
import { PaywallModal } from './PaywallModal'

/**
 * Перехватчик 402 ошибок.
 * Показывает PaywallModal при достижении лимитов.
 */
export function ErrorBoundary({ children }) {
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [paywallResource, setPaywallResource] = useState('documents')

  // Слушаем кастомное событие "limit-exceeded"
  useEffect(() => {
    const handler = (e) => {
      setPaywallResource(e.detail?.resource || 'documents')
      setPaywallOpen(true)
    }
    window.addEventListener('limit-exceeded', handler)
    return () => window.removeEventListener('limit-exceeded', handler)
  }, [])

  return (
    <>
      {children}
      <PaywallModal isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} resource={paywallResource} />
    </>
  )
}

/**
 * Хук для отправки события "limit-exceeded" при 402 ошибке.
 */
export function usePaywall() {
  return (resource = 'documents') => {
    window.dispatchEvent(new CustomEvent('limit-exceeded', { detail: { resource } }))
  }
}
