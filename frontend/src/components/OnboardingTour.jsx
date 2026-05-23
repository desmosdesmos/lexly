import { useState, useEffect } from 'react'
import { X, ArrowRight, Sparkles, Shield, HardDrive, Code, Zap } from 'lucide-react'
import { Button } from './ui/Button'

export function OnboardingTour() {
  const [isVisible, setIsVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('laxly_tour_seen')
    if (!hasSeenTour) {
      setTimeout(() => setIsVisible(true), 1500)
    }
  }, [])

  const steps = [
    {
      title: "Добро пожаловать в Laxly AI!",
      desc: "Ваш персональный юридический штаб на базе искусственного интеллекта. Давайте проведем краткий тур.",
      icon: Sparkles,
      color: "text-[#0A84FF]"
    },
    {
      title: "Генератор документов",
      desc: "Создавайте иски, жалобы и договоры за 30 секунд. Просто введите данные, а AI сделает остальное.",
      icon: Zap,
      color: "text-amber-500"
    },
    {
      title: "Умный Аудит",
      desc: "Загрузите любой договор, и мы подсветим опасные пункты, выставим Risk Score и предложим исправления.",
      icon: Shield,
      color: "text-red-500"
    },
    {
      title: "Ваше Хранилище",
      desc: "Все созданные файлы и результаты проверок автоматически сохраняются в вашем облачном Drive.",
      icon: HardDrive,
      color: "text-[#0A84FF]"
    },
    {
      title: "API для Бизнеса",
      desc: "Интегрируйте наши технологии в свои системы. Доступно для тарифов Бизнес и Корпоративный.",
      icon: Code,
      color: "text-purple-500"
    }
  ]

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      closeTour()
    }
  }

  const closeTour = () => {
    setIsVisible(false)
    localStorage.setItem('laxly_tour_seen', 'true')
  }

  if (!isVisible) return null

  const CurrentIcon = steps[step].icon

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
      <div className="relative max-w-lg w-full p-10 rounded-[50px] bg-black border border-white/10 shadow-[0_0_100px_rgba(10,132,255,0.15)] overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#0A84FF]/10 blur-[100px] rounded-full" />
        
        <button 
          onClick={closeTour}
          className="absolute top-8 right-8 p-2 rounded-full bg-white/5 text-white/20 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 space-y-8">
          <div className={`w-20 h-20 rounded-[30px] bg-white/5 flex items-center justify-center ${steps[step].color}`}>
            <CurrentIcon className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">{steps[step].title}</h2>
            <p className="text-white/40 text-lg font-medium leading-relaxed">
              {steps[step].desc}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4">
             <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-[#0A84FF]' : 'w-1.5 bg-white/10'}`} />
                ))}
             </div>
             <Button onClick={handleNext} className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-xs gap-3">
                {step === steps.length - 1 ? 'Начать работу' : 'Далее'}
                <ArrowRight className="w-4 h-4" />
             </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
