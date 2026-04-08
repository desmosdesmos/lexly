import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Scale, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { Card, CardBody } from '../components/ui/Card'
import { toast } from 'react-toastify'
import { authAPI } from '../services/api'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const { login } = useAuth()
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
      const errorMsg = typeof msg === 'string' ? msg : 'Неверный email или пароль'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true)
    setError('')
    try {
      const res = await authAPI.googleAuth(credentialResponse.credential)
      localStorage.setItem('access_token', res.access_token)
      localStorage.setItem('refresh_token', res.refresh_token)
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

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const googleEnabled = !!GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID.length > 10

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
      </div>

      <div className="w-full max-w-md relative animate-fadeIn">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 mb-4">
            <Scale className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-1">Вход в Lexly</h1>
          <p className="text-white/40 text-sm">Введите данные для входа в аккаунт</p>
        </div>

        <Card>
          <CardBody className="p-8">
            {/* Google Login */}
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
                  <div className="flex-1 h-px bg-white/10"></div>
                  <span className="text-xs text-white/30">или по email</span>
                  <div className="flex-1 h-px bg-white/10"></div>
                </div>
              </>
            ) : (
              <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10 text-xs text-yellow-400/70 mb-6 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  Google авторизация не настроена.
                  Для настройки создайте проект на{' '}
                  <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-300">
                    Google Cloud Console
                  </a>{' '}
                  и добавьте VITE_GOOGLE_CLIENT_ID в .env
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/60">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white/60">Пароль</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="glass-input pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="btn-primary w-full py-3"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Вход...</>
                ) : (
                  'Войти'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/40 text-sm">
                Нет аккаунта?{' '}
                <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>

        <p className="mt-6 text-center text-xs text-white/25">
          Демо: test@law.ai / Test1234!
        </p>
      </div>
    </div>
  )
}
