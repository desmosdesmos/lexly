import { useState, useEffect } from 'react'
import { Crown, Check, X, ArrowRight, CreditCard, Zap, Shield, Star, Ticket, ShieldCheck, Truck } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { toast } from 'react-toastify'
import api from '../services/api'

export function SubscriptionPage() {
  const [promoCode, setPromoCode] = useState('')
  const [applyingPromo, setApplyingPromo] = useState(false)
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUsage = async () => {
      try {
        const response = await api.get('/user/usage')
        setUsage(response.data)
      } catch (error) {
        console.error('Failed to load usage:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUsage()
  }, [])

  const currentPlan = usage?.plan?.toLowerCase() || 'free'

  const plans = [
    {
      id: 'free',
      name: 'Бесплатный',
      price: 0,
      description: 'Для знакомства с платформой',
      features: [
        { text: '2 документа/мес', included: true },
        { text: '1 проверка договора/мес', included: true },
        { text: '3 AI вопроса/день', included: true },
        { text: 'Базовая поддержка', included: true },
      ],
      color: 'from-gray-500/20 to-gray-600/20',
      border: 'border-gray-500/20',
      button: 'bg-white/10 hover:bg-white/15',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 290,
      description: 'Для фрилансеров и профи',
      features: [
        { text: '30 документов/мес', included: true },
        { text: '15 проверок договоров/мес', included: true },
        { text: '50 AI вопросов/день', included: true },
        { text: 'Приоритетная поддержка', included: true },
      ],
      color: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/20',
      button: 'bg-blue-600 hover:bg-blue-700',
      popular: true,
    },
    {
      id: 'business',
      name: 'Бизнес',
      price: 990,
      description: 'Полный безлимит для дел',
      features: [
        { text: 'Безлимитные документы', included: true },
        { text: 'Безлимитные проверки', included: true },
        { text: 'Безлимитный AI', included: true },
        { text: 'API доступ', included: true },
      ],
      color: 'from-amber-500/20 to-orange-500/20',
      border: 'border-amber-500/20',
      button: 'bg-amber-600 hover:bg-amber-700',
    }
  ]

  const handleSubscribe = async (planId) => {
    if (planId === currentPlan) {
      toast.info('У вас уже этот тариф')
      return
    }

    const plan = plans.find(p => p.id === planId)
    if (!plan) return

    const message = encodeURIComponent(
      `Здравствуйте! Хочу оформить подписку на тариф "${plan.name}" (${plan.price.toLocaleString('ru-RU')} ₽/мес). Как оплатить?`
    )

    window.open(`https://t.me/yanvtg?text=${message}`, '_blank')
    toast.success('Открываю Telegram для связи...')
  }

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Введите промокод')
      return
    }

    setApplyingPromo(true)
    try {
      await api.post('/payments/activate-code', { code: promoCode.trim() })
      toast.success('Промокод успешно активирован! 🎉')
      setPromoCode('')
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      const detail = err.response?.data?.detail || 'Неверный промокод'
      toast.error(typeof detail === 'string' ? detail : 'Ошибка активации')
    } finally {
      setApplyingPromo(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Crown className="w-8 h-8 text-amber-400" />
          <h1 className="text-3xl font-semibold">Тарифы и подписка</h1>
        </div>
        <p className="text-white/50">Выберите подходящий тарифный план для ваших задач</p>
      </div>

      {/* Промокод */}
      <Card className="border-amber-500/20">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Ticket className="w-6 h-6 text-amber-400" />
                <h2 className="text-lg font-semibold">Активировать промокод</h2>
              </div>
              <p className="text-sm text-white/40">
                Введите код для мгновенной активации подписки или получения бонусов
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX"
                className="glass-input flex-1 md:w-48 uppercase font-mono tracking-wider text-center"
                maxLength={20}
              />
              <button
                onClick={handleApplyPromo}
                disabled={applyingPromo || !promoCode.trim()}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {applyingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Активировать
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative flex flex-col transition-all duration-300 ${plan.id === currentPlan ? 'ring-2 ring-[#0A84FF] shadow-[0_0_30px_rgba(10,132,255,0.1)]' : 'hover:scale-[1.02]'}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-[10px] font-black uppercase tracking-widest text-white z-10 shadow-lg">
                Популярный
              </div>
            )}
            {plan.id === currentPlan && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#0A84FF] text-[10px] font-black uppercase tracking-widest text-white z-10 shadow-lg">
                Текущий
              </div>
            )}
            <CardBody className="p-8 flex flex-col flex-1">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-3">{plan.name}</h3>
                <p className="text-sm text-white/30 h-10">{plan.description}</p>
                <div className="mt-6 flex items-center justify-center gap-1">
                  {plan.price > 0 ? (
                    <>
                      <span className="text-5xl font-black">{plan.price}</span>
                      <div className="text-left">
                        <span className="block text-xl font-bold leading-none">₽</span>
                        <span className="text-[10px] text-white/30 uppercase font-bold">в месяц</span>
                      </div>
                    </>
                  ) : (
                    <span className="text-4xl font-black tracking-tight">Free</span>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${feature.included ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/20'}`}>
                      {feature.included ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-[14px] ${feature.included ? 'text-white/80 font-medium' : 'text-white/20'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={plan.id === currentPlan}
                className={`w-full py-4 rounded-[18px] font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  plan.id === currentPlan
                    ? 'bg-white/5 text-white/20 cursor-not-allowed'
                    : `${plan.button} text-white shadow-lg active:scale-95`
                }`}
              >
                {plan.id === currentPlan ? (
                  'Активен'
                ) : (
                  <>
                    Выбрать тариф
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Сравнение тарифов */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold">Подробное сравнение</h2>
        </div>
        
        <Card className="overflow-hidden">
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5">
                    <th className="text-left py-5 px-6 text-white/40 font-bold uppercase tracking-widest text-[11px]">Возможности</th>
                    <th className="text-center py-5 px-6 text-white/80 font-bold">Бесплатный</th>
                    <th className="text-center py-5 px-6 text-[#0A84FF] font-bold">Pro</th>
                    <th className="text-center py-5 px-6 text-amber-400 font-bold">Бизнес</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-medium">Генерация документов</td>
                    <td className="text-center py-4 px-6 text-white/40">2 / мес</td>
                    <td className="text-center py-4 px-6 font-bold">30 / мес</td>
                    <td className="text-center py-4 px-6 text-amber-400 font-black italic">Безлимит</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-medium">Проверка договоров</td>
                    <td className="text-center py-4 px-6 text-white/40">1 / мес</td>
                    <td className="text-center py-4 px-6 font-bold">15 / мес</td>
                    <td className="text-center py-4 px-6 text-amber-400 font-black italic">Безлимит</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-medium">AI Консультации</td>
                    <td className="text-center py-4 px-6 text-white/40">3 / день</td>
                    <td className="text-center py-4 px-6 font-bold">50 / день</td>
                    <td className="text-center py-4 px-6 text-amber-400 font-black italic">Безлимит</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-medium">Скорость ответов</td>
                    <td className="text-center py-4 px-6 text-white/40">Стандарт</td>
                    <td className="text-center py-4 px-6 text-blue-400">Высокая</td>
                    <td className="text-center py-4 px-6 text-amber-400 font-bold">Максимальная</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-medium">API Доступ</td>
                    <td className="text-center py-4 px-6"><X className="w-4 h-4 mx-auto text-white/10" /></td>
                    <td className="text-center py-4 px-6"><X className="w-4 h-4 mx-auto text-white/10" /></td>
                    <td className="text-center py-4 px-6"><Check className="w-5 h-5 mx-auto text-green-400" /></td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-medium">Хранение данных</td>
                    <td className="text-center py-4 px-6 text-white/40">30 дней</td>
                    <td className="text-center py-4 px-6">1 год</td>
                    <td className="text-center py-4 px-6 text-amber-400 font-bold">Бессрочно</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Legal Footer for Payments */}
      <div className="mt-12 p-8 rounded-[32px] bg-white/[0.02] border border-white/5 text-center">
        <div className="flex flex-wrap justify-center gap-8 mb-6 opacity-40">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#0A84FF]" />
            <span className="text-[10px] font-black uppercase tracking-widest">Безопасная оплата</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Мгновенный доступ</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Защита данных</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Цифровая доставка</span>
          </div>
        </div>
        <p className="text-white/30 text-[11px] leading-relaxed max-w-2xl mx-auto font-medium">
          Оплата производится через защищенный шлюз ЮKassa. Мы не храним данные ваших банковских карт. 
          Доступ к функциям тарифа предоставляется в автоматическом режиме (цифровая доставка) сразу после подтверждения платежа. 
          По всем вопросам пишите в поддержку или на <span className="text-white/50 underline">desmosymail@gmail.com</span>.
        </p>
      </div>

      {/* FAQ Small */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="p-6 rounded-[24px] bg-white/5 border border-white/5">
          <h4 className="font-bold text-white/90 mb-2">Как изменить тариф?</h4>
          <p className="text-sm text-white/40 leading-relaxed">Вы можете перейти на более высокий тариф в любое время. При переходе остаток текущего периода будет учтен в стоимости новой подписки.</p>
        </div>
        <div className="p-6 rounded-[24px] bg-white/5 border border-white/5">
          <h4 className="font-bold text-white/90 mb-2">Возврат средств</h4>
          <p className="text-sm text-white/40 leading-relaxed">Поскольку услуга является цифровой, возврат возможен в случае технической неисправности сервиса согласно условиям Оферты.</p>
        </div>
      </div>
    </div>
  )
}
