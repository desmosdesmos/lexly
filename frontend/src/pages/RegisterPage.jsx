import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Scale, Loader2, Eye, EyeOff, Mail, Lock, User, Check, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
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

export function RegisterPage() {
  const { yandexLogin, vkLogin } = useAuth()
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    consent: false,
    marketing_consent: false,
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const navigate = useNavigate()

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!re.test(email)) return 'Неверный формат email'
    const domain = email.split('@')[1].toLowerCase()
    // Блокируем временные и фейковые почты
    const blocked = ['temp', 'fake', 'test', 'aaa', 'xxx', 'qwerty', 'mail.ru', 'example.com', 'test.com']
    if (blocked.some(s => domain.includes(s))) return 'Используйте реальную почту (Gmail, Yandex, Mail.ru)'
    return ''
  }

  const validateName = (name) => {
    if (!name || name.trim().length < 2) return 'Имя должно содержать минимум 2 символа'
    if (name.trim().length > 50) return 'Имя слишком длинное'
    if (/^[0-9]+$/.test(name.trim())) return 'Имя не может состоять только из цифр'
    return ''
  }

  const validatePassword = (password) => {
    if (password.length < 8) return 'Минимум 8 символов'
    if (password.length > 128) return 'Пароль слишком длинный'
    if (!/[A-Z]/.test(password)) return 'Добавьте хотя бы одну заглавную букву'
    if (!/\d/.test(password)) return 'Добавьте хотя бы одну цифру'
    if (!/[a-z]/.test(password)) return 'Добавьте хотя бы одну строчную букву'
    // Проверка на слабые пароли
    const weak = ['password', '12345678', 'qwerty123', 'admin123', 'letmein', 'welcome']
    if (weak.includes(password.toLowerCase())) return 'Слишком слабый пароль'
    return ''
  }

  const handleEmailBlur = () => {
    if (formData.email) setEmailError(validateEmail(formData.email))
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const passwordsMatch = formData.password && formData.confirm_password && formData.password === formData.confirm_password

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEmailError('')

    // Валидация имени
    const nameErr = validateName(formData.full_name)
    if (nameErr) { toast.error(nameErr); return }

    // Валидация email
    const emailErr = validateEmail(formData.email)
    if (emailErr) { setEmailError(emailErr); toast.error(emailErr); return }

    // Валидация пароля
    const pwErr = validatePassword(formData.password)
    if (pwErr) { toast.error(pwErr); return }

    // Проверка совпадения паролей
    if (formData.password !== formData.confirm_password) { toast.error('Пароли не совпадают'); return }

    // Проверка согласия
    if (!formData.consent) {
      toast.error('Необходимо согласие на обработку персональных данных')
      return
    }

    setLoading(true)
    try {
      const result = await authAPI.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name.trim(),
        user_type: 'individual',
        pdp_consent: true, // Personal Data Processing consent
        marketing_consent: formData.marketing_consent,
      })
      
      toast.success('Регистрация успешна!')
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`)
    } catch (err) {
      const msg = err.response?.data?.detail
      toast.error(typeof msg === 'string' ? msg : 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  const handleYandexLogin = () => {
    const clientId = import.meta.env.VITE_YANDEX_CLIENT_ID
    if (!clientId) {
      toast.info('Регистрация в демо-режиме Яндекс ID (ключи не настроены)...')
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
      toast.info('Регистрация в демо-режиме VK ID (ключи не настроены)...')
      setTimeout(() => {
        window.location.href = `${window.location.origin}/auth/vk?code=mock_vk_code`
      }, 800)
      return
    }
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/vk`)
    window.location.href = `https://oauth.vk.com/authorize?client_id=${clientId}&display=page&redirect_uri=${redirectUri}&scope=email&response_type=code&v=5.131`
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-6">
            <Logo size="xl" />
          </Link>
          <h1 className="text-2xl font-bold mb-1">Создать аккаунт</h1>
          <p className="text-white/40 text-sm">Заполните данные для регистрации</p>
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
            <span className="text-xs text-white/30">или через email</span>
            <div className="flex-1 h-px bg-white/[0.06]"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white/50">Имя</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none z-10" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  onBlur={() => {
                    if (formData.full_name) {
                      const err = validateName(formData.full_name)
                      if (err) toast.error(err)
                    }
                  }}
                  placeholder="Александр Сергеевич"
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/30 focus:bg-white/[0.08] focus:border-[#0A84FF] focus:ring-4 focus:ring-[#0A84FF]/10 outline-none transition-all"
                  required
                  autoComplete="name"
                  minLength={2}
                  maxLength={50}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white/50">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none z-10" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  placeholder="your@email.com"
                  className={`w-full bg-white/[0.06] border rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/30 focus:bg-white/[0.08] focus:ring-4 focus:ring-[#0A84FF]/10 outline-none transition-all ${emailError ? 'border-[#FF453A]/30' : 'border-white/[0.08] focus:border-[#0A84FF]'}`}
                  required
                  autoComplete="email"
                />
              </div>
              {emailError && <p className="mt-1 text-xs text-[#FF453A]">{emailError}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white/50">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none z-10" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Минимум 8 символов, A-Z и цифры"
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-white/30 focus:bg-white/[0.08] focus:border-[#0A84FF] focus:ring-4 focus:ring-[#0A84FF]/10 outline-none transition-all"
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors z-10"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password requirements */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-white/10'}`}>
                      {formData.password.length >= 8 && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-xs text-white/40">Минимум 8 символов</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-white/10'}`}>
                      {/[A-Z]/.test(formData.password) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-xs text-white/40">Заглавная буква</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${/\d/.test(formData.password) ? 'bg-green-500' : 'bg-white/10'}`}>
                      {/\d/.test(formData.password) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-xs text-white/40">Цифра</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white/50">Подтвердите пароль</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none z-10" />
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Повторите пароль"
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-12 pr-10 py-3.5 text-white placeholder-white/30 focus:bg-white/[0.08] focus:border-[#0A84FF] focus:ring-4 focus:ring-[#0A84FF]/10 outline-none transition-all"
                  required
                  autoComplete="new-password"
                />
                {formData.confirm_password && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                    {passwordsMatch ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <X className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Consent */}
            <div className="flex items-start gap-3 py-2">
              <div className="relative flex items-center h-5">
                <input
                  id="consent"
                  type="checkbox"
                  checked={formData.consent}
                  onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#0A84FF] focus:ring-[#0A84FF]/20 focus:ring-offset-0"
                  required
                />
              </div>
              <label htmlFor="consent" className="text-xs text-white/40 leading-normal cursor-pointer select-none">
                Я даю согласие на <Link to="/privacy" className="text-[#0A84FF] hover:underline">обработку персональных данных</Link> и принимаю условия <Link to="/terms" className="text-[#0A84FF] hover:underline">публичной оферты</Link>
              </label>
            </div>

            <div className="flex items-start gap-3 py-2">
              <div className="relative flex items-center h-5">
                <input
                  id="marketing_consent"
                  type="checkbox"
                  checked={formData.marketing_consent}
                  onChange={(e) => setFormData(prev => ({ ...prev, marketing_consent: e.target.checked }))}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#0A84FF] focus:ring-[#0A84FF]/20 focus:ring-offset-0"
                />
              </div>
              <label htmlFor="marketing_consent" className="text-xs text-white/40 leading-normal cursor-pointer select-none">
                Я согласен на получение информационной и рекламной рассылки
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6] text-white font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Регистрация...
                </span>
              ) : (
                'Зарегистрироваться'
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-white/35 text-sm">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-[#0A84FF] hover:text-[#409CFF] font-medium">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
