import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Scale, Loader2, Eye, EyeOff, Check, X } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { Card, CardBody } from '../components/ui/Card'
import { toast } from 'react-toastify'
import { authAPI } from '../services/api'

export function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const navigate = useNavigate()

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!re.test(email)) return 'Неверный формат email'
    const domain = email.split('@')[1].toLowerCase()
    const suspicious = ['temp', 'fake', 'test', 'aaa', 'xxx', 'qwerty']
    if (suspicious.some(s => domain.includes(s))) return 'Используйте реальный email'
    return ''
  }

  const handleEmailBlur = () => {
    if (formData.email) setEmailError(validateEmail(formData.email))
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const pw = formData.password
  const pwLevel = !pw ? 0 : pw.length < 6 ? 1 : pw.length < 8 ? 2 : (/[A-Z]/.test(pw) && /\d/.test(pw)) ? 3 : 2
  const pwText = pwLevel === 1 ? 'Слабый' : pwLevel === 3 ? 'Хороший' : 'Средний'
  const pwColor = pwLevel === 1 ? 'text-red-400' : pwLevel === 3 ? 'text-green-400' : 'text-yellow-400'
  const passwordsMatch = formData.password && formData.confirm_password && formData.password === formData.confirm_password

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEmailError('')

    const emailErr = validateEmail(formData.email)
    if (emailErr) { setEmailError(emailErr); toast.error(emailErr); return }
    if (formData.password !== formData.confirm_password) { toast.error('Пароли не совпадают'); return }
    if (formData.password.length < 8) { toast.error('Пароль минимум 8 символов'); return }

    setLoading(true)
    try {
      await authAPI.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        user_type: 'individual',
      })
      toast.success('Регистрация успешна! Теперь войдите.')
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data?.detail
      toast.error(typeof msg === 'string' ? msg : 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true)
    try {
      const res = await authAPI.googleAuth(credentialResponse.credential)
      localStorage.setItem('access_token', res.access_token)
      localStorage.setItem('refresh_token', res.refresh_token)
      toast.success('Регистрация через Google завершена!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка Google авторизации')
    } finally {
      setLoading(false)
    }
  }

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const googleEnabled = !!GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID.length > 10

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }}></div>
      </div>

      <div className="w-full max-w-md relative animate-fadeIn">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 mb-4">
            <Scale className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-1">Регистрация</h1>
          <p className="text-white/40 text-sm">Создайте аккаунт бесплатно за 30 секунд</p>
        </div>

        <Card>
          <CardBody className="p-8">
            {/* Google */}
            {googleEnabled ? (
              <>
                <div className="flex justify-center mb-6">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Ошибка Google авторизации')}
                    text="signup_with"
                    locale="ru"
                    shape="pill"
                    size="large"
                    width="100%"
                  />
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-white/10"></div>
                  <span className="text-xs text-white/30">или через email</span>
                  <div className="flex-1 h-px bg-white/10"></div>
                </div>
              </>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/60">Имя</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Иван Иванов" className="glass-input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/60">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleEmailBlur} placeholder="user@example.com" className="glass-input" required />
                {emailError && <p className="mt-1 text-xs text-red-400">{emailError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/60">Пароль</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Минимум 8 символов" className="glass-input pr-12" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${pwLevel === 1 ? 'w-1/3 bg-red-400' : pwLevel === 2 ? 'w-2/3 bg-yellow-400' : 'w-full bg-green-400'}`}></div>
                    </div>
                    <span className={`text-xs ${pwColor}`}>{pwText}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/60">Подтверждение пароля</label>
                <div className="relative">
                  <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} placeholder="Повторите пароль" className="glass-input pr-10" required />
                  {formData.confirm_password && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {passwordsMatch ? <Check className="w-5 h-5 text-green-400" /> : <X className="w-5 h-5 text-red-400" />}
                    </div>
                  )}
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Создание...</> : 'Зарегистрироваться'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/40 text-sm">
                Уже есть аккаунт?{' '}
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Войти</Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
