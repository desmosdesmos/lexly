import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Scale, FileText, Shield, Gavel, TrendingUp, ArrowRight, Sparkles, Check, MessageSquare, Clock, Zap, ChevronDown } from 'lucide-react'

export function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const features = [
    { icon: FileText, title: 'Генерация документов', desc: 'Иски, жалобы, претензии — с правильным оформлением и ссылками на законы РФ' },
    { icon: Shield, title: 'Проверка договоров', desc: 'AI найдёт риски, кабальные условия и проблемные места за секунды' },
    { icon: MessageSquare, title: 'AI-консультант', desc: 'Любой юридический вопрос — подробный ответ на основе законодательства' },
    { icon: Gavel, title: 'Судебная практика', desc: 'Поиск и анализ реальных решений судов с прямыми ссылками' },
    { icon: TrendingUp, title: 'Мониторинг законов', desc: 'Отслеживайте изменения в законодательстве и будьте в курсе нововведений' },
  ]

  return (
    <div className="min-h-screen relative">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[400px] bg-blue-500/6 rounded-full blur-[130px] animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300" style={{
          background: scrollY > 50 ? 'rgba(10, 10, 15, 0.8)' : 'transparent',
          backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        }}>
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Scale className="w-5 h-5 text-white/70" />
              </div>
              <span className="font-semibold text-white/90">Lexly</span>
            </div>
            <div className="flex gap-2">
              <Link to="/login" className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors">Войти</Link>
              <Link to="/register" className="px-4 py-2 text-sm bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg transition-colors">Регистрация</Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 pt-32 pb-20 lg:pt-40 lg:pb-32 text-center">
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              AI-юрист на основе законодательства РФ
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-semibold mb-6 leading-[1.1] text-white/90">
              Юридическая помощь<br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                с искусственным интеллектом
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-white/40 mb-10 max-w-2xl mx-auto leading-relaxed">
              Генерируйте документы, анализируйте договоры, получайте консультации
              и отслеживайте изменения в законах
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="group px-7 py-3.5 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5">
                Начать бесплатно
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#features" className="px-7 py-3.5 text-white/40 hover:text-white/70 transition-colors flex items-center justify-center gap-1">
                Узнать больше
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Trust badges */}
          <div className={`mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-white/25 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-400/50" /> 2 документа бесплатно</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-400/50" /> Без привязки карты</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-400/50" /> Экспорт в .docx</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-400/50" /> Законы РФ 2026</span>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-5xl mx-auto px-4 pb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-semibold mb-3 text-white/80">Возможности платформы</h2>
            <p className="text-white/40">Всё, что нужно для юридической работы — в одном месте</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="group p-6 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="w-11 h-11 rounded-lg bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/15 transition-colors">
                  <f.icon className="w-5 h-5 text-indigo-400/60 group-hover:text-indigo-400 transition-colors" />
                </div>
                <h3 className="font-medium text-sm mb-2 text-white/80">{f.title}</h3>
                <p className="text-xs text-white/30 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-3xl mx-auto px-4 pb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-semibold mb-3 text-white/80">Как это работает</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: '01', t: 'Регистрация', d: 'Создайте аккаунт за 30 секунд' },
              { n: '02', t: 'Выберите задачу', d: 'Документ, договор или консультация' },
              { n: '03', t: 'Результат', d: 'AI подготовит всё за секунды' },
            ].map((s, i) => (
              <div key={i} className="text-center group">
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/10 transition-colors">
                  <span className="text-lg font-medium text-indigo-400/60">{s.n}</span>
                </div>
                <h3 className="text-sm font-medium mb-1 text-white/70">{s.t}</h3>
                <p className="text-xs text-white/30">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-4xl mx-auto px-4 pb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Zap, value: '5', label: 'Функций' },
              { icon: Clock, value: '24/7', label: 'AI доступен' },
              { icon: Scale, value: 'РФ', label: 'Законодательство' },
              { icon: Sparkles, value: '70B', label: 'Параметров AI' },
            ].map((s, i) => (
              <div key={i} className="p-5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                <s.icon className="w-5 h-5 text-indigo-400/40 mx-auto mb-2" />
                <div className="text-xl font-semibold text-white/80">{s.value}</div>
                <p className="text-xs text-white/30 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="max-w-4xl mx-auto px-4 pb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-semibold mb-3 text-white/80">Тарифы</h2>
            <p className="text-white/40">Начните бесплатно, обновите когда нужно</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Бесплатный', price: '0 ₽', features: ['2 документа/мес', '1 проверка договора', '3 вопроса AI/день', '2 запроса практики'], current: true },
              { name: 'Pro', price: '690 ₽/мес', oldPrice: '990 ₽/мес', features: ['50 документов/мес', '15 проверок договоров', 'AI безлимит', 'Полная судебная практика', 'Мониторинг законов'], popular: true },
              { name: 'Бизнес', price: '2 990 ₽/мес', oldPrice: '4 990 ₽/мес', features: ['Безлимитные документы', 'API доступ', 'Приоритетная очередь', 'Расширенное хранение'], },
            ].map((plan, i) => (
              <div
                key={i}
                className={`p-6 rounded-xl border transition-all hover:-translate-y-0.5 ${
                  plan.popular
                    ? 'bg-white/5 border-white/15'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                }`}
              >
                {plan.popular && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium mb-3 inline-block">
                    Популярный
                  </span>
                )}
                <h3 className="font-medium mb-1 text-white/80">{plan.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  {plan.oldPrice && <span className="text-xs text-white/20 line-through">{plan.oldPrice}</span>}
                  <span className="text-2xl font-semibold text-white/90">{plan.price}</span>
                </div>
                {plan.popular && (
                  <p className="text-xs text-green-400/70 mb-4">✨ Цена для первых — навсегда</p>
                )}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="text-xs text-white/40 flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-400/40 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block text-center text-sm py-2.5 rounded-lg transition-all ${
                    plan.popular
                      ? 'bg-white text-black font-medium hover:bg-white/90'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {plan.current ? 'Начать' : plan.popular ? 'Выбрать Pro' : 'Выбрать Бизнес'}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-4 pb-20 text-center">
          <div className="p-10 rounded-xl bg-white/[0.03] border border-white/5">
            <h2 className="text-2xl font-semibold mb-3 text-white/80">Начните бесплатно</h2>
            <p className="text-white/40 text-sm mb-6">Без привязки карты. 2 документа бесплатно каждый месяц.</p>
            <Link to="/register" className="group px-7 py-3.5 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-all inline-flex items-center gap-2">
              Создать аккаунт
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8">
          <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white/30 text-sm">
              <Scale className="w-4 h-4" />
              <span>Lexly © 2026</span>
            </div>
            <div className="flex gap-6 text-xs text-white/30">
              <Link to="/privacy" className="hover:text-white/50 transition-colors">Конфиденциальность</Link>
              <Link to="/terms" className="hover:text-white/50 transition-colors">Соглашение</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
