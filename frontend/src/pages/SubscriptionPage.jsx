import { useState, useEffect } from 'react'
import { Crown, Check, X, ArrowRight, CreditCard, Zap, Shield, Star, Ticket, ShieldCheck, Truck, Loader2 } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { toast } from 'react-toastify'
import api from '../services/api'

export function SubscriptionPage() {
  const [promoCode, setPromoCode] = useState('')
  const [applyingPromo, setApplyingPromo] = useState(false)
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [backendPlans, setBackendPlans] = useState([])
  const [isSubscribing, setIsSubscribing] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usageRes, plansRes] = await Promise.all([
          api.get('/user/usage'),
          api.get('/payments/plans')
        ])
        setUsage(usageRes.data)
        setBackendPlans(plansRes.data.plans)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const currentPlan = usage?.plan?.toLowerCase() || 'free'

  // Маппинг иконок и стилей для планов из бэкенда
  const planStyles = {
    free: {
      description: 'Для базовых задач',
      buttonClass: 'bg-white/5 hover:bg-white/10 text-white/70',
      features: [
        '5 документов в месяц',
        '3 проверки договора',
        'Базовая поддержка',
      ]
    },
    basic: {
      description: 'Для активной работы',
      buttonClass: 'bg-[#0A84FF] hover:bg-[#007AFF] text-white shadow-[0_0_20px_rgba(10,132,255,0.3)]',
      popular: true,
      features: [
        '30 документов в месяц',
        '20 проверок договоров',
        'Приоритетная поддержка',
      ]
    },
    pro: {
      description: 'Профессиональный уровень',
      buttonClass: 'bg-[#0A84FF] hover:bg-[#007AFF] text-white shadow-[0_0_20px_rgba(10,132,255,0.3)]',
      features: [
        '200 документов в месяц',
        '100 проверок договоров',
        'Приоритетная поддержка',
        'API доступ',
      ]
    },
    business: {
      description: 'Максимум возможностей',
      buttonClass: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]',
      features: [
        'Безлимитные документы',
        'Безлимитные проверки',
        'Персональный менеджер',
        'Командный доступ',
      ]
    }
  }

  const handleSubscribe = async (planId) => {
    if (planId === currentPlan) {
      toast.info('У вас уже активирован этот тариф')
      return
    }

    if (planId === 'free') return

    setIsSubscribing(planId)
    try {
      const response = await api.post('/payments/subscribe', {
        plan_id: planId,
        payment_method: 'card'
      })
      
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url
      } else {
        toast.error('Не удалось получить ссылку на оплату')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error(error.response?.data?.detail || 'Ошибка при создании платежа')
    } finally {
      setIsSubscribing(null)
    }
  }

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return
    setApplyingPromo(true)
    try {
      await api.post('/payments/activate-code', { code: promoCode.trim() })
      toast.success('Тариф успешно активирован!')
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка кода')
    } finally {
      setApplyingPromo(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#0A84FF] animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-2 sm:px-0">
      {/* Header Section */}
      <div className="text-center space-y-4 pt-4">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">Выбор тарифа</h1>
        <p className="text-white/40 text-lg max-w-xl mx-auto">
          Прозрачные цены без скрытых платежей. Выберите план, который подходит именно вам.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {backendPlans.map((plan) => {
          const style = planStyles[plan.id.toLowerCase()] || planStyles.free
          const isCurrent = plan.id.toLowerCase() === currentPlan
          
          return (
            <div 
              key={plan.id}
              className={`
                relative flex flex-col p-8 rounded-[40px] border transition-all duration-500
                ${isCurrent 
                  ? 'bg-white/[0.03] border-[#0A84FF]/50 shadow-[0_0_40px_rgba(10,132,255,0.1)]' 
                  : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                }
              `}
            >
              {style.popular && !currentPlan.includes(plan.id.toLowerCase()) && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#0A84FF] text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                  Популярный
                </div>
              )}
              
              {isCurrent && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-green-500 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                  Ваш текущий тариф
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-white/30 font-medium">{style.description}</p>
              </div>

              <div className="mb-10 flex items-baseline gap-1">
                <span className="text-5xl font-black text-white">{plan.price}</span>
                <span className="text-lg text-white/40 font-bold">₽/мес</span>
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {(plan.features_list || style.features).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-[#0A84FF]/10 text-[#0A84FF]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="text-[15px] text-white/70 font-medium">
                      {typeof feature === 'string' ? feature : feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(plan.id.toLowerCase())}
                disabled={isCurrent || isSubscribing === plan.id.toLowerCase()}
                className={`
                  w-full py-4 rounded-[22px] font-bold text-sm transition-all duration-300 active:scale-95 flex items-center justify-center gap-2
                  ${isCurrent ? 'bg-white/5 text-white/20 cursor-default' : style.buttonClass}
                `}
              >
                {isSubscribing === plan.id.toLowerCase() ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCurrent ? (
                  'Уже подключено'
                ) : (
                  'Выбрать план'
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Promo & Legal Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Promo Code Card */}
        <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Промокод</h2>
              <p className="text-sm text-white/40 font-medium">Активируйте бонусы и скидки</p>
            </div>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX"
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-mono tracking-widest focus:outline-none focus:border-[#0A84FF]/50 transition-colors"
            />
            <button
              onClick={handleApplyPromo}
              disabled={applyingPromo || !promoCode.trim()}
              className="px-8 bg-white text-black hover:bg-white/90 rounded-2xl font-bold transition-all disabled:opacity-50"
            >
              {applyingPromo ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Ок'}
            </button>
          </div>
        </div>

        {/* Security Info Card */}
        <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-6">
          <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
            <div className="flex items-center gap-2 text-white/40">
              <CreditCard className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Безопасная оплата</span>
            </div>
            <div className="flex items-center gap-2 text-white/40">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Мгновенно</span>
            </div>
            <div className="flex items-center gap-2 text-white/40">
              <Truck className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Digital-доставка</span>
            </div>
            <div className="flex items-center gap-2 text-white/40">
              <span className="text-[10px] font-black uppercase tracking-widest">T-Pay</span>
            </div>
            <div className="flex items-center gap-2 text-white/40">
              <span className="text-[10px] font-black uppercase tracking-widest">СБП</span>
            </div>
          </div>
          <p className="text-white/30 text-xs leading-relaxed font-medium">
            Оплата производится через защищенный шлюз ЮKassa. Мы поддерживаем оплату картами, T-Pay и СБП. 
            Мы не храним данные ваших карт. 
            Доступ предоставляется автоматически сразу после подтверждения транзакции. 
            Служба поддержки: <span className="text-white/60 underline">desmosymail@gmail.com</span>
          </p>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="space-y-8 pt-10">
        <h2 className="text-2xl font-bold text-white text-center sm:text-left">Подробное сравнение</h2>
        <div className="rounded-[40px] border border-white/5 bg-white/[0.01] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-6 px-8 text-[11px] font-black uppercase tracking-[0.2em] text-white/30">Параметр</th>
                  <th className="py-6 px-8 text-sm font-bold text-white/60">Free</th>
                  <th className="py-6 px-8 text-sm font-bold text-[#0A84FF]">Pro</th>
                  <th className="py-6 px-8 text-sm font-bold text-amber-500">Бизнес</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                  <td className="py-5 px-8 text-white/70 font-medium">Документы / мес</td>
                  <td className="py-5 px-8 text-white/40">5</td>
                  <td className="py-5 px-8 text-white/90 font-bold">200</td>
                  <td className="py-5 px-8 text-amber-500 font-black italic">Безлимит</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                  <td className="py-5 px-8 text-white/70 font-medium">Проверки договоров</td>
                  <td className="py-5 px-8 text-white/40">3</td>
                  <td className="py-5 px-8 text-white/90 font-bold">100</td>
                  <td className="py-5 px-8 text-amber-500 font-black italic">Безлимит</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                  <td className="py-5 px-8 text-white/70 font-medium">Поддержка</td>
                  <td className="py-5 px-8 text-white/40">Стандарт</td>
                  <td className="py-5 px-8 text-[#0A84FF] font-bold">Приоритет</td>
                  <td className="py-5 px-8 text-amber-500 font-bold italic">Персонально</td>
                </tr>
                <tr className="hover:bg-white/[0.01] transition-colors">
                  <td className="py-5 px-8 text-white/70 font-medium">API Доступ</td>
                  <td className="py-5 px-8"><X className="w-4 h-4 text-white/10" /></td>
                  <td className="py-5 px-8"><Check className="w-5 h-5 text-green-500" /></td>
                  <td className="py-5 px-8"><Check className="w-5 h-5 text-green-500" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
