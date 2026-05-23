import React, { useState, useEffect } from 'react'
import { PaywallModal } from './PaywallModal'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from './Button'

/**
 * Перехватчик 402 ошибок.
 * Показывает PaywallModal при достижении лимитов.
 */
export function PaywallProvider({ children }) {
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [paywallResource, setPaywallResource] = useState('documents')

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
 * Настоящий React Error Boundary для отлова критических сбоев рендеринга.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Crash Captured:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-white uppercase italic">Произошла ошибка в интерфейсе</h1>
            <p className="text-white/40 text-sm font-medium leading-relaxed">
              Что-то пошло не так при отрисовке страницы. Попробуйте обновить сайт.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 rounded-2xl bg-white text-black font-bold gap-2"
            >
              <RefreshCcw className="w-4 h-4" /> Обновить страницу
            </Button>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-6 p-4 bg-white/5 rounded-xl text-left text-[10px] text-red-400 overflow-auto max-h-40">
                {this.state.error?.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return (
      <PaywallProvider>
        {this.props.children}
      </PaywallProvider>
    );
  }
}

/**
 * Хук для отправки события "limit-exceeded" при 402 ошибке.
 */
export function usePaywall() {
  return (resource = 'documents') => {
    window.dispatchEvent(new CustomEvent('limit-exceeded', { detail: { resource } }))
  }
}
