import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, ArrowRight, Check, Loader2 } from 'lucide-react'
import { Logo } from '../components/ui/Logo'
import { authAPI } from '../services/api'
import { toast } from 'react-toastify'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const emailFromUrl = searchParams.get('email') || ''
  
  const [email, setEmail] = useState(emailFromUrl)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [step, setStep] = useState(emailFromUrl ? 'code' : 'email')
  const [sent, setSent] = useState(false) // Start as false to trigger initial send

  // Auto-send code if coming from login page
  useEffect(() => {
    if (emailFromUrl && !sent) {
      const autoSend = async () => {
        setSending(true)
        try {
          await authAPI.sendVerificationCode(emailFromUrl)
          setSent(true)
          toast.success('Код подтверждения отправлен на email')
        } catch (err) {
          console.error('Auto-send failed:', err)
          // Don't toast error here to avoid double toast if they just registered
        } finally {
          setSending(false)
        }
      }
      autoSend()
    }
  }, [emailFromUrl])

  const handleSendCode = async (e) => {
    e.preventDefault()
    if (!email) { toast.error('Введите email'); return }
    
    setSending(true)
    try {
      await authAPI.sendVerificationCode(email)
      setSent(true)
      setStep('code')
      toast.success('Код отправлен на email!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка отправки кода')
    } finally {
      setSending(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!code || code.length < 6) { toast.error('Введите 6-значный код'); return }
    
    setLoading(true)
    try {
      await authAPI.verifyEmail({ email, code })
      toast.success('Email подтверждён! Теперь войдите.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Неверный код')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <Logo size="xl" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Подтверждение email</h1>
          <p className="text-white/40 text-sm">
            {step === 'email' ? 'Введите email для отправки кода' : 'Введите код подтверждения'}
          </p>
        </div>

        <div className="bg-[rgba(28,28,30,0.5)] backdrop-blur-[32px] border border-white/[0.06] rounded-[22px] shadow-[0_4px_24px_rgba(0,0,0,0.3)] p-8">
          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
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
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6] text-white font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                {sending ? <><Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Отправка...</> : 'Отправить код'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-white/60 text-sm mb-1">Код отправлен на</p>
                <p className="text-white font-medium">{email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white/50">Код подтверждения</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-center text-2xl tracking-[12px] font-mono placeholder-white/20 focus:bg-white/[0.08] focus:border-[#0A84FF] focus:ring-4 focus:ring-[#0A84FF]/10 outline-none transition-all"
                  required
                  autoFocus
                />
              </div>

              {code.length === 6 && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Check className="w-4 h-4" />
                  <span>Готово к проверке</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6] text-white font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Проверка...</> : (
                  <>Подтвердить email <ArrowRight className="w-4 h-4 inline ml-1" /></>
                )}
              </button>

              <button
                type="button"
                onClick={handleSendCode}
                disabled={sending}
                className="w-full py-2.5 text-sm text-white/40 hover:text-white/60 transition-colors disabled:opacity-40"
              >
                {sending ? 'Отправка...' : 'Отправить код повторно'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-white/35 hover:text-[#0A84FF] transition-colors"
            >
              ← Вернуться ко входу
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
