import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Scale, Loader2, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { Logo } from '../components/ui/Logo'

const YandexIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#FC3F1D"/>
    <path d="M56.4 75H47.1V39.4L33.7 66.8H26.3L42.5 35.1L30.9 23H40.2V51.6L52.8 23H60.2L47.7 50L60.9 75H56.4Z" fill="white"/>
  </svg>
)

const VkIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.025 2H8.975C4.025 2 2 4.025 2 8.975v6.05C2 19.975 4.025 22 8.975 22h6.05C19.975 22 22 19.975 22 15.025v-6.05C22 4.025 19.975 2 15.025 2zm3.84 12.385c.575.56 1.19 1.07 1.83 1.545.31.23.615.44.895.66.455.355.67.625.595 1.045-.09.5-.6.545-1.02.55h-2.58c-.83 0-1.505-.175-2.07-.635-.435-.35-.82-.78-1.215-1.2-.295-.315-.595-.625-.92-.76-.32-.135-.615-.09-.905.15-.465.385-.59.955-.63 1.575-.03.46-.145.75-.62.835-.91.165-1.84.14-2.735-.115-1.635-.47-2.91-1.485-3.99-2.79C3.42 12.16 2.19 9.38.98 6.55c-.215-.505-.07-.77.48-.775H4.1c.425 0 .73.195.895.59 1.055 2.505 2.455 4.8 4.415 6.72.18.175.385.35.61.435.34.125.56.01.685-.34.195-.545.285-1.12.29-1.705.01-1.46-.35-2.095-1.505-2.225-.335-.04-.265-.21-.115-.355.22-.215.58-.335 1.085-.335h3.69c.5 0 .735.25.795.78.115 1.03.11 2.065-.105 3.085-.075.355.07.565.41.6.28.03.525-.095.735-.295 1.405-1.355 2.39-3.09 3.255-4.925.17-.365.41-.53.82-.53h2.645c.675 0 .825.29.695.84-.33 1.4-1.25 2.56-2.14 3.73-.42.55-.86 1.085-1.27 1.645-.315.43-.285.73.09 1.13z"/>
  </svg>
)

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, yandexLogin, vkLogin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    let provider = params.get('provider')

    if (!provider) {
      if (window.location.pathname.includes('/auth/yandex')) {
        provider = 'yandex'
      } else if (window.location.pathname.includes('/auth/vk')) {
        provider = 'vk'
      }
    }

    if (code && provider) {
      handleOAuthCallback(code, provider)
    }
  }, [])

  const handleOAuthCallback = async (code, provider) => {
    setLoading(true)
    setError('')
    try {
      if (provider === 'yandex') {
        await yandexLogin(code)
        toast.success('Вход через Яндекс выполнен!')
      } else if (provider === 'vk') {
        const redirectUri = `${window.location.origin}/auth/vk`
        await vkLogin(code, redirectUri)
        toast.success('Вход через VK выполнен!')
      }
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.detail
      setError(typeof msg === 'string' ? msg : `Ошибка входа через ${provider === 'yandex' ? 'Яндекс' : 'VK'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleYandexLogin = () => {
    const clientId = import.meta.env.VITE_YANDEX_CLIENT_ID
    if (!clientId) {
      toast.info('Вход в демо-режиме Яндекс ID (ключи не настроены)...')
      setTimeout(() => {
        window.location.href = `${window.location.origin}/auth/yandex?code=mock_yandex_code`
      }, 800)
      return
    }
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/yandex`)
    window.location.href = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`
  }

  const handleVkLogin = () => {
    const clientId = import.meta.env.VITE_VK_CLIENT_ID
    if (!clientId) {
      toast.info('Вход в демо-режиме VK ID (ключи не настроены)...')
      setTimeout(() => {
        window.location.href = `${window.location.origin}/auth/vk?code=mock_vk_code`
      }, 800)
      return
    }
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/vk`)
    window.location.href = `https://oauth.vk.com/authorize?client_id=${clientId}&display=page&redirect_uri=${redirectUri}&scope=email&response_type=code&v=5.131`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      toast.success('Добро пожаловать!')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail
      if (msg === 'email_not_verified') {
        toast.info('Подтвердите email для входа')
        navigate(`/verify-email?email=${encodeURIComponent(email)}`)
      } else {
        const errorMsg = typeof msg === 'string' ? msg : 'Неверный email или пароль'
        setError(errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-6">
            <Logo size="xl" />
          </Link>
          <h1 className="text-2xl font-bold mb-1">Вход в аккаунт</h1>
          <p className="text-white/40 text-sm">Введите данные для продолжения</p>
        </div>

        {/* Card */}
        <div className="bg-[rgba(28,28,30,0.5)] backdrop-blur-[32px] border border-white/[0.06] rounded-[22px] shadow-[0_4px_24px_rgba(0,0,0,0.3)] p-8">
          {/* Russian OAuth Providers (149-ФЗ Compliant) */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={handleYandexLogin}
              className="flex items-center justify-center py-3 px-4 rounded-xl bg-white text-black font-semibold text-sm hover:bg-slate-100 active:scale-[0.98] transition-all border border-slate-200"
            >
              <YandexIcon />
              Яндекс
            </button>
            <button
              type="button"
              onClick={handleVkLogin}
              className="flex items-center justify-center py-3 px-4 rounded-xl bg-[#0077FF] text-white font-semibold text-sm hover:bg-[#0066DD] active:scale-[0.98] transition-all"
            >
              <VkIcon />
              ВКонтакте
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/[0.06]"></div>
            <span className="text-xs text-white/30">или по email</span>
            <div className="flex-1 h-px bg-white/[0.06]"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white/50">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none z-10" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/30 focus:bg-white/[0.08] focus:border-[#0A84FF] focus:ring-4 focus:ring-[#0A84FF]/10 outline-none transition-all"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white/50">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none z-10" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-white/30 focus:bg-white/[0.08] focus:border-[#0A84FF] focus:ring-4 focus:ring-[#0A84FF]/10 outline-none transition-all"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors z-10"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-[#0A84FF] hover:text-[#409CFF] transition-colors">
                Забыли пароль?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-[#FF453A]/8 border border-[#FF453A]/15 text-sm text-[#FF453A]">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6] text-white font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Вход...
                </span>
              ) : (
                'Войти'
              )}
            </button>
          </form>

          {/* Register link */}
          <div className="mt-6 text-center">
            <p className="text-white/35 text-sm">
              Нет аккаунта?{' '}
              <Link to="/register" className="text-[#0A84FF] hover:text-[#409CFF] font-medium">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
