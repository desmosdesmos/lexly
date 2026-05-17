import { useState, useEffect } from 'react'
import { Crown, Check, X, ArrowRight, CreditCard, Zap, Shield, Star, Ticket } from 'lucide-react'
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
        const data = await api.get('/user/usage')
        setUsage(data)
      } catch (error) {
        console.error('Failed to load usage:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUsage()
  }, [])

  const currentPlan = usage?.plan || 'free'

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

    if (planId === 'free') {
      toast.info('Вы на бесплатном тарифе')
      return
    }

    const plan = plans.find(p => p.id === planId)
    if (!plan) return

    // Формируем сообщение для Telegram
    const message = encodeURIComponent(
      `Здравствуйте! Хочу оформить подписку на тариф "${plan.name}" (${plan.price.toLocaleString('ru-RU')} ₽/мес). Как оплатить?`
    )

    // Редирект в Telegram
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
      // Обновляем страницу через 2 секунды
      setTimeout(() => window.location.reload(), 2000)
    } catch (err) {
      const detail = err.response?.data?.detail || 'Неверный промокод'
      toast.error(typeof detail === 'string' ? detail : 'Ошибка активации промокода')
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
        <p className="text-white/50">Выберите подходящий тарифный план</p>
      </div>

      {/* Преимущества Pro */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20">
                <Zap className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Быстрая генерация</h3>
                <p className="text-sm text-white/50">Документы за секунды через GigaChat AI</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Безопасность данных</h3>
                <p className="text-sm text-white/50">Все данные хранятся в РФ (152-ФЗ)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Star className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Поддержка 24/7</h3>
                <p className="text-sm text-white/50">Помощь в любое время</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Промокод */}
      <Card className="border-amber-500/20">
        <CardBody>
          <div className="flex items-center gap-3 mb-4">
            <Ticket className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg font-semibold">Активировать промокод</h2>
          </div>
          <p className="text-sm text-white/50 mb-4">
            Введите промокод для получения бесплатных дней или скидки на подписку
          </p>
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Например: LAXLY2026"
              className="glass-input flex-1 uppercase font-mono tracking-wider"
              maxLength={20}
            />
            <button
              onClick={handleApplyPromo}
              disabled={applyingPromo || !promoCode.trim()}
              className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {applyingPromo ? 'Проверка...' : 'Активировать'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.id === currentPlan ? 'ring-2 ring-indigo-500/50' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-medium text-white z-10">
                Популярный
              </div>
            )}
            {plan.id === currentPlan && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-xs font-medium text-white z-10">
                Текущий
              </div>
            )}
            <CardBody className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-white/50 mb-4">{plan.description}</p>
                <div className="mb-4">
                  {plan.price > 0 ? (
                    <>
                      <span className="text-4xl font-bold">{plan.price.toLocaleString('ru-RU')}</span>
                      <span className="text-white/50 ml-1">₽/мес</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold">Бесплатно</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-white/20 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-white/70' : 'text-white/30'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={plan.id === currentPlan}
                className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  plan.id === currentPlan
                    ? 'bg-white/5 text-white/30 cursor-not-allowed'
                    : `${plan.button} text-white`
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {plan.id === currentPlan ? (
                  'Текущий тариф'
                ) : plan.price > 0 ? (
                  <>
                    Написать для оплаты
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  'Текущий тариф'
                )}
              </button>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Сравнение тарифов */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            Сравнение тарифов
          </h2>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Возможность</th>
                  <th className="text-center py-3 px-4 text-white/60 font-medium">Бесплатный</th>
                  <th className="text-center py-3 px-4 text-blue-400 font-medium">Базовый</th>
                  <th className="text-center py-3 px-4 text-indigo-400 font-medium">Pro</th>
                  <th className="text-center py-3 px-4 text-amber-400 font-medium">Корпоративный</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-3 px-4">Документы/мес</td>
                  <td className="text-center py-3 px-4 text-white/50">2</td>
                  <td className="text-center py-3 px-4">15</td>
                  <td className="text-center py-3 px-4">50</td>
                  <td className="text-center py-3 px-4">200</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Проверки договоров/мес</td>
                  <td className="text-center py-3 px-4 text-white/50">1</td>
                  <td className="text-center py-3 px-4">10</td>
                  <td className="text-center py-3 px-4">25</td>
                  <td className="text-center py-3 px-4">100</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">AI вопросы/день</td>
                  <td className="text-center py-3 px-4 text-white/50">3</td>
                  <td className="text-center py-3 px-4">20</td>
                  <td className="text-center py-3 px-4">100</td>
                  <td className="text-center py-3 px-4">500</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">API доступ</td>
                  <td className="text-center py-3 px-4"><X className="w-4 h-4 mx-auto text-white/20" /></td>
                  <td className="text-center py-3 px-4"><X className="w-4 h-4 mx-auto text-white/20" /></td>
                  <td className="text-center py-3 px-4"><Check className="w-4 h-4 mx-auto text-green-400" /></td>
                  <td className="text-center py-3 px-4"><Check className="w-4 h-4 mx-auto text-green-400" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Поддержка</td>
                  <td className="text-center py-3 px-4 text-white/50">Базовая</td>
                  <td className="text-center py-3 px-4">Email</td>
                  <td className="text-center py-3 px-4">Приоритетная</td>
                  <td className="text-center py-3 px-4">Выделенная</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
