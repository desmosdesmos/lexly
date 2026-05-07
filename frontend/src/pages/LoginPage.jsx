import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Scale, Loader2, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { Logo } from '../components/ui/Logo'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const { login, googleLogin } = useAuth()
  const navigate = useNavigate()

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

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true)
    setError('')
    try {
      await googleLogin(credentialResponse.credential)
      toast.success('Вход через Google выполнен!')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail
      setError(typeof msg === 'string' ? msg : 'Ошибка Google авторизации')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Ошибка Google авторизации. Попробуйте вход по email.')
  }

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '529068411405-lpiffe0n5pq007vfd7jvg1ne0p9qio47.apps.googleusercontent.com'
  const googleEnabled = !!GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID.length > 10

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
          {/* Google */}
          {googleEnabled ? (
            <>
              <div className="flex justify-center mb-6">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  text="continue_with"
                  locale="ru"
                  shape="pill"
                  size="large"
                  width="100%"
                />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-white/[0.06]"></div>
                <span className="text-xs text-white/30">или по email</span>
                <div className="flex-1 h-px bg-white/[0.06]"></div>
              </div>
            </>
          ) : (
            <div className="p-3 rounded-xl bg-[#FF9F0A]/8 border border-[#FF9F0A]/15 text-xs text-[#FF9F0A] mb-6 flex items-start gap-2">
              <span>Google авторизация не настроена</span>
            </div>
          )}

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
              disabled={loading || googleLoading}
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
