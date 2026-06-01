import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Shield, 
  FileText, 
  MessageSquare, 
  Gavel, 
  CheckCircle, 
  ArrowRight, 
  TrendingUp,
  Sparkles,
  HardDrive,
  Menu,
  X,
  Upload,
  Cpu,
  FileCheck,
  Building2,
  User,
  ChevronDown
} from 'lucide-react'
import { Logo } from '../components/ui/Logo'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

export function LandingPage() {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 selection:bg-[#0A84FF]/30 overflow-x-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full" />
         <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] bg-indigo-600/5 blur-[80px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isMenuOpen ? 'bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Logo size="md" />
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Как это работает</a>
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Возможности</a>
            <a href="#quick-tools" className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">Разовые решения</a>
            <Link to="/blog" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">База знаний</Link>
            <a href="#tariffs" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Тарифы</a>
            <div className="h-4 w-px bg-white/10 mx-2" />
            {user ? (
              <Link to="/dashboard">
                <Button className="h-10 px-6 rounded-lg text-xs font-semibold">Личный кабинет</Button>
              </Link>
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Войти</Link>
                <Link to="/register">
                  <Button className="h-10 px-6 rounded-lg text-xs font-semibold">Начать работу</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#0B0F19] border-b border-white/5 py-8 px-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
            <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-slate-300">Как это работает</a>
            <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-slate-300">Возможности</a>
            <a href="#quick-tools" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-blue-400">Быстрые решения (БЕЗ ПОДПИСКИ)</a>
            <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-slate-300">База знаний</Link>
            <a href="#tariffs" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-slate-300">Тарифы</a>
            <div className="h-px bg-white/5" />
            {user ? (
              <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full h-12 rounded-lg font-semibold">Личный кабинет</Button>
              </Link>
            ) : (
              <div className="flex flex-col gap-4">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-center py-3 text-slate-400 font-medium">Войти</Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full h-12 rounded-lg font-semibold">Начать работу</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-48 pb-20 sm:pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
             <Sparkles className="w-3.5 h-3.5 text-blue-400" />
             <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">Технологии AI на страже ваших интересов</span>
          </div>
          
          <h1 className="text-4xl sm:text-7xl font-bold text-white tracking-tight leading-[1.15]">
             Ваш персональный <br className="hidden sm:block" />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                интеллектуальный юрист
             </span>
          </h1>
          
          <p className="text-slate-400 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
             Автоматизация правовых задач: от мгновенного анализа договоров до подготовки сложных исков. База знаний актуальна на 2026 год.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to={user ? "/dashboard" : "/register"} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-10 rounded-xl font-bold text-sm gap-2">
                 Начать бесплатно <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto h-14 px-10 rounded-xl border border-white/10 flex items-center justify-center text-sm font-semibold hover:bg-white/5 transition-colors">
               Узнать больше
            </a>
          </div>

          <div className="pt-8 flex flex-wrap justify-center items-center gap-8 opacity-40 grayscale">
             <span className="text-xs font-bold tracking-widest uppercase">GigaChat PRO</span>
             <span className="text-xs font-bold tracking-widest uppercase">GPT-4.5 Legacy</span>
             <span className="text-xs font-bold tracking-widest uppercase">LegalBase v2</span>
          </div>
        </div>
      </section>

      {/* NEW: How it Works Section */}
      <section id="how-it-works" className="py-20 sm:py-32 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
             <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Как это работает</h2>
             <p className="text-slate-400 max-w-xl mx-auto">Всего три шага отделяют вас от профессионального юридического документа</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            
            {[
              { icon: Upload, title: 'Загрузка', desc: 'Загрузите документ или опишите ситуацию своими словами.' },
              { icon: Cpu, title: 'Анализ', desc: 'AI изучает детали, находит риски и сверяется с кодексами РФ.' },
              { icon: FileCheck, title: 'Результат', desc: 'Получите готовый файл или развернутую консультацию.' },
            ].map((step, i) => (
              <div key={i} className="relative text-center space-y-6">
                 <div className="w-20 h-20 rounded-2xl bg-[#0F172A] border border-blue-500/20 flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/5 relative z-10">
                    <step.icon className="w-8 h-8 text-blue-400" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white">{i+1}</div>
                 </div>
                 <h3 className="text-xl font-bold text-white">{step.title}</h3>
                 <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Who is it for Section */}
      <section className="py-20 sm:py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="p-8 sm:p-12 rounded-[32px] bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/10 group hover:border-blue-500/30 transition-all">
             <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-8 shadow-xl shadow-blue-600/20">
                <Building2 className="w-7 h-7 text-white" />
             </div>
             <h3 className="text-2xl font-bold text-white mb-4">Для бизнеса</h3>
             <p className="text-slate-400 mb-8 leading-relaxed">
                Снижайте затраты на юридический отдел. Наш AI проверит договор аренды за 15 секунд, выявит скрытые неустойки и предложит безопасные формулировки.
             </p>
             <ul className="space-y-3 mb-10">
                {['Мгновенный аудит контрактов', 'Оценка правовых рисков', 'Генерация типовых документов'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                     <CheckCircle className="w-4 h-4 text-blue-400" /> {f}
                  </li>
                ))}
             </ul>
             <Link to="/register">
                <Button variant="secondary" className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-widest">Подробнее для бизнеса</Button>
             </Link>
          </div>

          <div className="p-8 sm:p-12 rounded-[32px] bg-gradient-to-br from-slate-800/20 to-transparent border border-white/5 group hover:border-white/20 transition-all">
             <div className="w-14 h-14 rounded-2xl bg-slate-700 flex items-center justify-center mb-8">
                <User className="w-7 h-7 text-white" />
             </div>
             <h3 className="text-2xl font-bold text-white mb-4">Для граждан</h3>
             <p className="text-slate-400 mb-8 leading-relaxed">
                Защищайте свои права без дорогих адвокатов. Составим досудебную претензию, исковое заявление или просто ответим на сложный правовой вопрос.
             </p>
             <ul className="space-y-3 mb-10">
                {['Составление исков и жалоб', 'Консультации по ЖКХ и Трудовому праву', 'База судебной практики'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                     <CheckCircle className="w-4 h-4 text-slate-500" /> {f}
                  </li>
                ))}
             </ul>
             <Link to="/register">
                <Button variant="secondary" className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-widest">Подробнее для граждан</Button>
             </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 sm:py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 space-y-4">
             <p className="text-xs font-bold uppercase tracking-widest text-blue-500">Технологический стек</p>
             <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Экосистема юридических инструментов</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Конструктор исков', desc: 'Генерация готовых исковых заявлений и претензий по вашим данным за 30 секунд.', icon: FileText, color: 'text-blue-400' },
              { title: 'Анализ договоров', desc: 'Мгновенный поиск рисков и «подводных камней» в любых контрактах с рекомендациями.', icon: Shield, color: 'text-amber-400' },
              { title: 'AI Консультант', desc: 'Глубокие ответы на правовые вопросы со ссылками на статьи актуальных кодексов РФ.', icon: MessageSquare, color: 'text-purple-400' },
              { title: 'База практики', desc: 'Поиск по миллионам судебных решений для усиления вашей правовой позиции.', icon: Gavel, color: 'text-indigo-400' },
              { title: 'Мониторинг', desc: 'Автоматическое отслеживание изменений в законодательстве, важных для вашего профиля.', icon: TrendingUp, color: 'text-green-400' },
              { title: 'Архив файлов', desc: 'Надежное зашифрованное хранилище для всех ваших документов с доступом 24/7.', icon: HardDrive, color: 'text-pink-400' },
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] hover:border-blue-500/20 transition-all group">
                 <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${f.color} mb-6 transition-transform group-hover:scale-110`}>
                    <f.icon className="w-6 h-6" />
                 </div>
                 <h3 className="text-lg font-bold text-white mb-3">{f.title}</h3>
                 <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Help / Niche Generators */}
      <section id="quick-tools" className="py-20 sm:py-32 px-6 bg-blue-600/5">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Решите проблему мгновенно</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Узкоспециализированные ИИ-инструменты для самых частых юридических задач. Без подписки.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Для селлеров WB/Ozon', 
                desc: 'Верните деньги за утерю товара или оспорьте штраф маркетплейса.',
                link: '/tools/marketplace-claim',
                price: '490 ₽',
                icon: Building2
              },
              { 
                title: 'Защита потребителей', 
                desc: 'Возврат денег за онлайн-курсы, технику или некачественные услуги.',
                link: '/tools/consumer-claim',
                price: '299 ₽',
                icon: Shield
              },
              { 
                title: 'Отмена автоштрафов', 
                desc: 'Автоматическая жалоба на штрафы ГИБДД, МАДИ и АМПП.',
                link: '/tools/auto-fine',
                price: '190 ₽',
                icon: Gavel
              }
            ].map((tool, i) => (
              <div key={i} className="bg-[#0F172A] p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all text-left flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6">
                    <tool.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{tool.title}</h3>
                  <p className="text-slate-400 text-sm mb-6">{tool.desc}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xl font-bold text-white">{tool.price}</span>
                  <Link to={user ? '/dashboard/documents' : '/register'}>
                    <Button variant="primary" className="h-10 px-4 rounded-lg text-xs font-bold">Попробовать</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Тарифы */}
      <section id="tariffs" className="py-20 sm:py-32 px-6 bg-white/[0.01]">
         <div className="max-w-7xl mx-auto text-center space-y-16">
            <div className="space-y-4">
               <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Тарифные планы</h2>
               <p className="text-slate-400">Прозрачная стоимость без скрытых платежей</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { name: 'Базовый', price: '0 ₽', color: 'text-slate-400', features: ['2 документа в месяц', '2 проверки договоров', 'AI Консультант (Limited)'] },
                 { name: 'Pro', price: '290 ₽', color: 'text-blue-400', popular: true, features: ['50 документов в месяц', '25 проверок договоров', 'Приоритетная скорость AI'] },
                 { name: 'Бизнес', price: '990 ₽', color: 'text-amber-400', features: ['200 документов в месяц', '100 проверок договоров', 'Полный API доступ'] },
               ].map((t, i) => (
                 <div key={i} className={`p-10 rounded-[32px] border transition-all flex flex-col justify-between h-full ${t.popular ? 'bg-blue-600/5 border-blue-500/30 md:scale-105 z-10 shadow-2xl shadow-blue-500/10' : 'bg-white/[0.02] border-white/5'}`}>
                    <div className="space-y-8 text-left">
                       <div className="space-y-1">
                          <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">{t.name}</p>
                          <div className={`text-4xl font-bold ${t.color}`}>{t.price}</div>
                       </div>
                       <ul className="space-y-4">
                          {t.features.map((f, j) => (
                            <li key={j} className="flex items-center gap-3 text-sm text-slate-400">
                               <CheckCircle className="w-4 h-4 text-blue-500" /> {f}
                            </li>
                          ))}
                       </ul>
                    </div>
                    <Link to="/register" className="mt-12">
                       <Button variant={t.popular ? 'primary' : 'secondary'} className="w-full h-12 rounded-xl font-bold text-xs uppercase tracking-widest">
                          Выбрать {t.name}
                       </Button>
                    </Link>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-[#080B14]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-4 flex flex-col items-center md:items-start">
             <Logo size="md" />
             <p className="text-[11px] text-slate-500 font-medium max-w-[200px] text-center md:text-left">
                Интеллектуальный помощник для правовых и юридических задач любого уровня сложности.
             </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-10 text-xs font-semibold text-slate-400">
             <Link to="/terms" className="hover:text-white transition-colors">Условия</Link>
             <Link to="/privacy" className="hover:text-white transition-colors">Приватность</Link>
             <a href="#" className="hover:text-white transition-colors">Помощь</a>
          </div>
          
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
             © 2026 Laxly AI Law.
          </div>
        </div>
      </footer>
    </div>
  )
}
