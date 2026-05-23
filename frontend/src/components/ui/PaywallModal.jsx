import { useState } from 'react'
import { X, Sparkles, Check, ArrowRight, Crown, Zap, Shield, ArrowUpRight, Star, AlertTriangle } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../../services/api'

export function PaywallModal({ isOpen, onClose, resource = 'documents' }) {
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [isSubscribing, setIsSubscribing] = useState(false)

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
      id: 'pro',
      name: 'Pro',
      price: '290 ₽',
      period: '/ мес',
      icon: Star,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
      gradient: 'from-indigo-500/20 to-purple-500/20',
      popular: true,
      features: [
        '50 документов в месяц',
        '25 проверок договоров',
        'Приоритетная скорость',
      ],
    },
    {
      id: 'business',
      name: 'Бизнес',
      price: '990 ₽',
      period: '/ мес',
      icon: Crown,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      gradient: 'from-amber-500/20 to-orange-500/20',
      popular: false,
      features: [
        '200 документов в месяц',
        '100 проверок договоров',
        'Полный API доступ',
      ],
    },
    {
      id: 'enterprise',
      name: 'Корпоративный',
      price: '1 990 ₽',
      period: '/ мес',
      icon: Zap,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      popular: false,
      features: [
        'Полный безлимит на всё',
        'Доступ для всей команды',
        'Персональный менеджер',
      ],
    },
  ]

  const handleUpgrade = async () => {
    setIsSubscribing(true)
    try {
      const response = await api.post('/payments/subscribe', {
        plan_id: selectedPlan,
        payment_method: 'card'
      })
      
      if (response.data?.payment_url) {
        window.location.href = response.data.payment_url
      } else {
        toast.error('Не удалось получить ссылку на оплату')
        window.location.href = '/dashboard/subscription'
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error(error.response?.data?.detail || 'Ошибка при создании платежа')
      window.location.href = '/dashboard/subscription'
    } finally {
      setIsSubscribing(false)
    }
  }

  const activePlan = plans.find(p => p.id === selectedPlan) || plans[0]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto animate-in drop-shadow-2xl no-scrollbar">
        <div className="Card bg-[#0a0a0c] border border-white/10 rounded-[32px] overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Side: Info */}
          <div className="p-8 sm:p-10 md:w-2/5 border-b md:border-b-0 md:border-r border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#0A84FF]/10 blur-[80px] rounded-full" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight uppercase italic">Лимит<br/>исчерпан</h2>
              <p className="text-white/40 text-sm leading-relaxed mb-8">
                Вы достигли предела бесплатных возможностей для <strong className="text-white/70">{resourceNames[resource] || 'использования'}</strong>. 
                Выберите тарифный план для мгновенного снятия ограничений.
              </p>
              <div className="p-5 rounded-2xl bg-[#0A84FF]/5 border border-[#0A84FF]/20 text-[#0A84FF] text-xs font-medium leading-relaxed">
                <Sparkles className="w-4 h-4 mb-2" />
                Оплата разблокирует полный функционал на 30 дней. Все ваши данные сохранятся.
              </div>
            </div>
          </div>

          {/* Right Side: Plans */}
          <div className="p-8 sm:p-10 md:w-3/5 bg-black/20 relative flex flex-col">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest text-white/20">Доступные планы</h3>
            
            <div className="space-y-4 flex-1">
              {plans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`relative p-5 rounded-[24px] border transition-all cursor-pointer group ${
                    selectedPlan === p.id
                      ? `bg-gradient-to-r ${p.gradient} ${p.border} shadow-lg shadow-black/40`
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${p.bg} ${p.color} transition-transform group-hover:scale-110`}>
                        <p.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`font-bold text-lg ${selectedPlan === p.id ? 'text-white' : 'text-white/70'}`}>{p.name}</h4>
                          {p.popular && (
                            <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 uppercase tracking-widest border border-indigo-500/30">Top</span>
                          )}
                        </div>
                        <div className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-bold">
                          {p.features.slice(0, 2).join(' • ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                       <div className="text-right">
                          <div className="text-xl font-black text-white tracking-tight leading-none">{p.price}</div>
                          <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">{p.period}</div>
                       </div>
                       <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${selectedPlan === p.id ? 'border-white bg-white' : 'border-white/10'}`}>
                          {selectedPlan === p.id && <Check className="w-4 h-4 text-[#0A84FF]" strokeWidth={4} />}
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpgrade}
              disabled={isSubscribing}
              className="mt-8 w-full py-5 rounded-[20px] bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/5 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubscribing ? 'Генерация платежа...' : `Активировать ${activePlan.name}`} {!isSubscribing && <ArrowUpRight className="w-5 h-5" />}
            </button>
            
            <div className="mt-6 text-center">
               <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest">
                  Безопасный шлюз ЮKassa • Мгновенная активация
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
