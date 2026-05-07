import { useState } from 'react'
import { X, Sparkles, Check, ArrowRight, Crown, Zap, Shield } from 'lucide-react'
import { toast } from 'react-toastify'

export function PaywallModal({ isOpen, onClose, resource = 'documents' }) {
  const [selectedPlan, setSelectedPlan] = useState('pro')

  if (!isOpen) return null

  const resourceNames = {
    documents: 'генерации документов',
    contracts: 'проверки договоров',
    ai_consultant: 'AI-консультанта',
    court_practice: 'судебной практики',
    law_monitoring: 'мониторинга законов',
  }

  const plans = [
    {
      id: 'free',
      name: 'Бесплатный',
      price: '0 ₽',
      oldPrice: null,
      popular: false,
      features: [
        '2 документа / месяц',
        '1 проверка договора / месяц',
        '3 вопроса AI / день',
        '2 запроса судебной практики / день',
        '2 запроса мониторинга / день',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '690 ₽/мес',
      oldPrice: '990 ₽/мес',
      popular: true,
      features: [
        'До 50 юридических документов в месяц',
        '15 проверок договоров с выявлением рисков',
        'AI-юрист 24/7 без ограничений',
        'Полный доступ к судебной практике',
        'Полный мониторинг изменений законов',
        'Приоритетная обработка запросов',
      ],
    },
    {
      id: 'business',
      name: 'Бизнес',
      price: '2 990 ₽/мес',
      oldPrice: '4 990 ₽/мес',
      popular: false,
      features: [
        'Безлимитные документы и договоры',
        'Безлимитный AI-консультант',
        'API доступ для интеграций',
        'Приоритетная очередь обработки',
        'Расширенное хранение данных',
        'Fair Use Policy — без скрытых лимитов',
      ],
    },
  ]

  const handleUpgrade = () => {
    toast.info('Подключение оплаты в разработке. Свяжитесь с desmosymail@gmail.com')
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
        <div className="glass p-0 overflow-hidden">
          {/* Header */}
          <div className="relative p-6 pb-4 border-b border-white/5">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition-colors text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Лимит исчерпан</h2>
                <p className="text-sm text-white/50">
                  Вы достигли лимита {resourceNames[resource] || 'использования'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <p className="text-white/60 text-sm leading-relaxed">
              Разблокируйте полный доступ к Laxly. Перейдите на Pro и получите
              безлимитные возможности для юридической работы.
            </p>

            {/* Plans */}
            <div className="space-y-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all border ${
                    selectedPlan === plan.id
                      ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                      : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{plan.name}</h3>
                        {plan.popular && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium">
                            Популярный
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {plan.oldPrice && (
                          <span className="text-sm text-white/30 line-through">{plan.oldPrice}</span>
                        )}
                        <span className="text-lg font-bold">{plan.price}</span>
                      </div>
                      {plan.oldPrice && plan.id === 'pro' && (
                        <p className="text-xs text-green-400 mb-2">
                          ✨ Цена для первых пользователей — навсегда
                        </p>
                      )}
                      <ul className="space-y-1">
                        {plan.features.map((f, i) => (
                          <li key={i} className="text-xs text-white/50 flex items-start gap-1.5">
                            <Check className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 ${
                      selectedPlan === plan.id
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-white/20'
                    }`}>
                      {selectedPlan === plan.id && (
                        <div className="w-2 h-2 rounded-full bg-white mx-auto mt-1.5"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* CTA */}
            {selectedPlan !== 'free' && (
              <button
                onClick={handleUpgrade}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
              >
                {selectedPlan === 'pro' ? <Zap className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                Перейти на {plans.find(p => p.id === selectedPlan)?.name}
                <ArrowRight className="w-5 h-5" />
              </button>
            )}

            {selectedPlan === 'free' && (
              <p className="text-center text-sm text-white/40">
                На бесплатном тарифе лимиты ограничены. Обновитесь для полного доступа.
              </p>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-white/30 text-center leading-relaxed">
              Оплата списывается ежемесячно. Отмена подписки в любой момент.
              Сервис не является юридической консультацией.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
