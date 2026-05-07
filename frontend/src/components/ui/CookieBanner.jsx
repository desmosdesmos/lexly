import { useState, useEffect } from 'react'
import { X, Shield, Info } from 'lucide-react'
import { Link } from 'react-router-dom'

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({
    necessary: true,
    analytics: true,
    marketing: false
  })

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    const consentData = {
      necessary: true,
      analytics: true,
      marketing: true,
      date: new Date().toISOString()
    }
    localStorage.setItem('cookie-consent', JSON.stringify(consentData))
    setIsVisible(false)
  }

  const handleSaveSettings = () => {
    const consentData = {
      ...settings,
      necessary: true, // Always true
      date: new Date().toISOString()
    }
    localStorage.setItem('cookie-consent', JSON.stringify(consentData))
    setIsVisible(false)
  }

  const handleDeclineAll = () => {
    const consentData = {
      necessary: true,
      analytics: false,
      marketing: false,
      date: new Date().toISOString()
    }
    localStorage.setItem('cookie-consent', JSON.stringify(consentData))
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[100] md:left-auto md:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#1C1C1E] border border-white/[0.08] rounded-2xl shadow-2xl p-6 backdrop-blur-xl">
        {!showSettings ? (
          <>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Мы используем файлы cookie</h3>
                <p className="text-white/50 text-xs leading-relaxed">
                  Они помогают нам обеспечивать работу сервиса, анализировать трафик и делать AI-юриста лучше. 
                  Оставаясь на сайте, вы соглашаетесь с нашей{' '}
                  <Link to="/privacy" className="text-blue-400 hover:underline">Политикой обработки ПДн</Link>.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-medium transition-colors"
              >
                Принять все
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white/80 rounded-xl text-xs font-medium transition-colors"
              >
                Настроить
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Настройка Cookies</h3>
              <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-white font-medium">Необходимые</div>
                  <div className="text-[10px] text-white/40">Обеспечивают работу сайта</div>
                </div>
                <div className="w-8 h-4 bg-blue-500 rounded-full relative opacity-50">
                  <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-white font-medium">Аналитические</div>
                  <div className="text-[10px] text-white/40">Помогают нам улучшать сервис</div>
                </div>
                <button 
                  onClick={() => setSettings(s => ({...s, analytics: !s.analytics}))}
                  className={`w-8 h-4 rounded-full relative transition-colors ${settings.analytics ? 'bg-blue-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${settings.analytics ? 'right-0.5' : 'left-0.5'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-white font-medium">Маркетинговые</div>
                  <div className="text-[10px] text-white/40">Для персонализации рекламы</div>
                </div>
                <button 
                  onClick={() => setSettings(s => ({...s, marketing: !s.marketing}))}
                  className={`w-8 h-4 rounded-full relative transition-colors ${settings.marketing ? 'bg-blue-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${settings.marketing ? 'right-0.5' : 'left-0.5'}`}></div>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleSaveSettings}
                className="w-full px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-medium transition-colors"
              >
                Сохранить настройки
              </button>
              <button
                onClick={handleDeclineAll}
                className="w-full px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white/80 rounded-xl text-xs font-medium transition-colors"
              >
                Только необходимые
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
