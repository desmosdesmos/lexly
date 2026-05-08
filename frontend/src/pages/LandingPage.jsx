import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight, Shield, Check, FileText, TrendingUp, MessageSquare, Scale, Sun, Moon } from 'lucide-react'
import { Logo } from '../components/ui/Logo'
import { useThemeMode } from '../context/ThemeModeContext'

export function LandingPage() {
  const { mode, toggleMode } = useThemeMode()
  const isLight = mode === 'light'
  
  const features = [
    { icon: FileText, title: 'Генерация документов', desc: 'Иски, жалобы, претензии за секунды' },
    { icon: Shield, title: 'Проверка договоров', desc: 'AI найдёт скрытые риски' },
    { icon: MessageSquare, title: 'AI-консультант', desc: 'Ответы на юридические вопросы' },
    { icon: Scale, title: 'Судебная практика', desc: 'Анализ решений судов' },
    { icon: TrendingUp, title: 'Мониторинг законов', desc: 'Отслеживание изменений' },
    { icon: Sparkles, title: 'Умные подсказки', desc: 'AI поможет с формулировками' },
  ]

  const plans = [
    { name: 'Бесплатный', price: '0 ₽', features: ['2 документа/мес', '1 проверка договора', '3 вопроса AI/день'], current: true },
    { name: 'Базовый', price: '490 ₽/мес', features: ['15 документов/мес', '10 проверок', '20 вопросов AI/день'] },
    { name: 'Pro', price: '1 490 ₽/мес', features: ['50 документов/мес', '25 проверок', '100 вопросов AI/день', 'Судебная практика', 'Мониторинг законов'], popular: true },
    { name: 'Бизнес', price: '4 990 ₽/мес', features: ['200 документов/мес', '100 проверок', '500 вопросов AI/день', 'API доступ', 'Приоритетная поддержка'] },
  ]

  return (
    <div className="min-h-screen" style={{ background: isLight ? 'var(--bg-primary)' : undefined }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: 'var(--header-bg)', borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center flex-shrink-0">
            <Logo size="md" className="sm:h-10 h-8" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleMode}
              className="p-2 sm:p-2.5 rounded-xl transition-colors flex-shrink-0"
              style={{ background: isLight ? 'var(--hover-bg)' : 'transparent' }}
              title={isLight ? 'Тёмная тема' : 'Светлая тема'}
            >
              {isLight ? <Moon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: 'var(--text-secondary)' }} /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />}
            </button>
            <Link to="/login" className="px-2 sm:px-4 py-2 text-xs sm:text-sm transition-colors flex-shrink-0" style={{ color: isLight ? 'var(--text-secondary)' : 'rgba(255,255,255,0.5)' }}>
              Войти
            </Link>
            <Link to="/register" className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6] flex-shrink-0">
              Регистрация
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-12 sm:pt-20 pb-12 sm:pb-16 text-center overflow-hidden">
        <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-sm mb-6 ${isLight ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-[#0A84FF]/8 border border-[#0A84FF]/15 text-[#0A84FF]'}`}>
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
          AI-юрист нового поколения
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 tracking-tight leading-tight" style={{ color: isLight ? 'var(--text-primary)' : undefined }}>
          Юридические документы
          <br />
          <span className="bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6] bg-clip-text text-transparent">с помощью AI</span>
        </h1>
        <p className="text-base sm:text-lg max-w-2xl mx-auto mb-8 px-4" style={{ color: 'var(--text-tertiary)' }}>
          Генерация исков, проверка договоров, анализ судебной практики — всё это с помощью искусственного интеллекта
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/register" className="group px-7 py-3.5 bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2">
            Начать бесплатно
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login" className={`px-7 py-3.5 rounded-xl transition-all ${isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200' : 'bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] text-white/80'}`}>
            Уже есть аккаунт
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-semibold mb-3" style={{ color: isLight ? 'var(--text-primary)' : 'rgba(255,255,255,0.8)' }}>Возможности</h2>
          <p style={{ color: 'var(--text-tertiary)' }}>Всё что нужно для юридической работы</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i} className={`p-6 rounded-[22px] border transition-all hover:-translate-y-1 ${isLight ? 'bg-white border-gray-100 shadow-sm hover:shadow-md' : 'bg-[rgba(28,28,30,0.4)] border-white/[0.04] hover:bg-[rgba(28,28,30,0.6)] hover:border-white/[0.06]'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${isLight ? 'bg-blue-50' : 'bg-white/[0.04]'}`}>
                <f.icon className={`w-6 h-6 transition-colors ${isLight ? 'text-[#0A84FF]' : 'text-white/40 group-hover:text-[#0A84FF]'}`} />
              </div>
              <h3 className="font-medium mb-1" style={{ color: isLight ? 'var(--text-primary)' : 'rgba(255,255,255,0.8)' }}>{f.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-semibold mb-3" style={{ color: isLight ? 'var(--text-primary)' : 'rgba(255,255,255,0.8)' }}>Тарифы</h2>
          <p style={{ color: 'var(--text-tertiary)' }}>Начните бесплатно, обновите когда нужно</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`p-6 rounded-[22px] border transition-all hover:-translate-y-1 ${plan.popular
                ? isLight ? 'bg-blue-50 border-blue-200 shadow-md' : 'bg-[rgba(10,132,255,0.08)] border-[#0A84FF]/20 shadow-lg shadow-blue-500/10'
                : isLight ? 'bg-white border-gray-100 shadow-sm' : 'bg-[rgba(28,28,30,0.3)] border-white/[0.04] hover:border-white/[0.06]'
              }`}
            >
              {plan.popular && (
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium mb-4 inline-block ${isLight ? 'bg-blue-100 text-blue-700' : 'bg-[#0A84FF]/15 text-[#0A84FF]'}`}>
                  Популярный
                </span>
              )}
              <h3 className="font-medium mb-1" style={{ color: isLight ? 'var(--text-primary)' : 'rgba(255,255,255,0.8)' }}>{plan.name}</h3>
              <div className="text-2xl font-semibold mb-4" style={{ color: isLight ? 'var(--text-primary)' : 'rgba(255,255,255,0.9)' }}>{plan.price}</div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-tertiary)' }}>
                    <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${isLight ? 'text-[#0A84FF]' : 'text-[#0A84FF]/50'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`block text-center text-sm py-2.5 rounded-xl transition-all ${plan.popular
                  ? 'bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6] text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30'
                  : isLight ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-100' : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08] border border-white/[0.04]'
                }`}
              >
                {plan.current ? 'Начать' : `Выбрать ${plan.name}`}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 pb-20 text-center">
        <div className={`p-6 sm:p-10 rounded-[22px] border ${isLight ? 'bg-white shadow-sm border-gray-100' : 'bg-[rgba(28,28,30,0.3)] border-white/[0.04]'}`}>
          <h2 className="text-xl sm:text-2xl font-semibold mb-3" style={{ color: isLight ? 'var(--text-primary)' : 'rgba(255,255,255,0.8)' }}>Начните бесплатно</h2>
          <p className="text-xs sm:text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>Без привязки карты. 2 документа бесплатно каждый месяц.</p>
          <Link to="/register" className="group px-7 py-3.5 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-all inline-flex items-center gap-2">
            Создать аккаунт
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12" style={{ borderColor: 'var(--border-subtle)', background: isLight ? 'var(--bg-secondary)' : 'rgba(28,28,30,0.2)' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <Logo size="md" />
              </Link>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                Первый в России AI-юрист для автоматизации правовой работы. 
                Мы объединяем передовые технологии ИИ с юридической экспертизой.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-sm" style={{ color: isLight ? 'var(--text-primary)' : 'white' }}>Правовая информация</h4>
              <div className="space-y-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                <p>Пащенко Егор Викторович</p>
                <p>ИНН: 644011277300</p>
                <p>Адрес: г. Саратов</p>
                <p className="pt-1 text-[10px] opacity-70">Сервера и базы данных локализованы в РФ (ФЗ-152).</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm" style={{ color: isLight ? 'var(--text-primary)' : 'white' }}>Поддержка</h4>
              <div className="space-y-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                <p>Email: <a href="mailto:desmosymail@gmail.com" className="hover:text-[#0A84FF]">desmosymail@gmail.com</a></p>
                <p>Часы работы: Пн-Пт, 10:00 – 19:00 (МСК)</p>
                <div className="pt-2 flex gap-4">
                  <Link to="/privacy" className="hover:text-[#0A84FF] transition-colors">Политика ПДн</Link>
                  <Link to="/terms" className="hover:text-[#0A84FF] transition-colors">Оферта</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>
              © 2026 Laxly Law AI. Все права защищены.
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
              Сделано в России для юристов нового поколения
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
