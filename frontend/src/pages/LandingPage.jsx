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
  AlertTriangle,
  RefreshCw,
  Zap,
  Lock,
  Layers,
  ChevronRight
} from 'lucide-react'
import { Logo } from '../components/ui/Logo'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

export function LandingPage() {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scanStep, setScanStep] = useState(0)

  // Simulation of the AI Legal Scanner
  useEffect(() => {
    const timer = setInterval(() => {
      setScanStep((prev) => (prev + 1) % 3)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#070A13] text-slate-100 selection:bg-[#0A84FF]/30 overflow-x-hidden font-sans">
      {/* Background Ambient Glows & Grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Cyber dot grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-60" />
        
        {/* Dynamic glowing radial spheres */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse-glow" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/5 blur-[100px] rounded-full animate-pulse-glow" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-[#5E5CE6]/5 blur-[100px] rounded-full animate-pulse-glow" style={{ animationDelay: '6s' }} />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isMenuOpen ? 'bg-[#070A13]/85 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Logo size="md" className="hover:opacity-90 transition-opacity" />
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Как это работает</a>
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Возможности</a>
            <a href="#quick-tools" className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
              Разовые решения
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            </a>
            <Link to="/blog" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">База знаний</Link>
            <a href="#tariffs" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Тарифы</a>
            <div className="h-4 w-px bg-white/10 mx-2" />
            {user ? (
              <Link to="/dashboard">
                <Button className="h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/25">Личный кабинет</Button>
              </Link>
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Войти</Link>
                <Link to="/register">
                  <Button className="h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/25">Начать работу</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white p-2 hover:bg-white/5 rounded-xl transition-colors border border-white/5 bg-white/[0.02] backdrop-blur-md"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#070A13]/98 backdrop-blur-2xl border-b border-white/5 py-8 px-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
            <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-slate-300 hover:text-white">Как это работает</a>
            <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-slate-300 hover:text-white">Возможности</a>
            <a href="#quick-tools" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-blue-400 hover:text-blue-300">Быстрые решения (БЕЗ ПОДПИСКИ)</a>
            <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-slate-300 hover:text-white">База знаний</Link>
            <a href="#tariffs" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-slate-300 hover:text-white">Тарифы</a>
            <div className="h-px bg-white/5" />
            {user ? (
              <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full h-12 rounded-xl font-bold uppercase tracking-wider">Личный кабинет</Button>
              </Link>
            ) : (
              <div className="flex flex-col gap-4">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-center py-3 text-slate-400 font-medium hover:text-white">Войти</Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full h-12 rounded-xl font-bold uppercase tracking-wider">Начать работу</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-44 pb-20 sm:pb-32 px-6 z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left column: Headings and CTAs */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Технологии AI на страже ваших интересов</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] font-sans">
            Ваш персональный <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient">
              интеллектуальный юрист
            </span>
          </h1>
          
          <p className="text-slate-400 text-lg sm:text-xl font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Автоматизация правовых задач любой сложности: от мгновенного аудита договоров до подготовки исков с судебной практикой. База знаний обновлена на 2026 год.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <Link to={user ? "/dashboard" : "/register"} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-10 rounded-2xl font-bold text-sm gap-2.5 bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6] hover:from-[#409CFF] hover:to-[#7E7CFF] shadow-2xl shadow-blue-500/20 transform hover:-translate-y-0.5 duration-150">
                Начать бесплатно <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto h-14 px-10 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md flex items-center justify-center text-sm font-semibold hover:bg-white/5 transition-all hover:border-white/20 transform hover:-translate-y-0.5 duration-150">
              Как это работает
            </a>
          </div>

          {/* Model Trust Badges */}
          <div className="pt-8 flex flex-wrap justify-center lg:justify-start items-center gap-6 opacity-60">
            <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">GigaChat PRO</span>
            <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">GPT-4.5 Custom</span>
            <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">LegalBase v2</span>
          </div>
        </div>

        {/* Right column: Interactive AI scanner widget */}
        <div className="lg:col-span-5 relative flex justify-center">
          {/* Back glows behind the widget */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl opacity-70" />
          
          {/* Main Widget Container */}
          <div className="w-full max-w-[440px] bg-[#0E1325]/90 border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-6 shadow-2xl shadow-black/80 relative overflow-hidden animate-float-slow">
            
            {/* Window Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${scanStep === 0 ? 'bg-blue-400 animate-ping' : scanStep === 1 ? 'bg-red-400' : 'bg-green-400'}`} />
                {scanStep === 0 ? 'Анализ документа...' : scanStep === 1 ? 'Обнаружены риски' : 'Исправления готовы'}
              </div>
            </div>

            {/* Document body mockup */}
            <div className="bg-[#080B16] rounded-2xl p-4 border border-white/5 relative h-[210px] overflow-hidden flex flex-col justify-between">
              
              {/* Scan Laser effect (only visible during scanning phase 0) */}
              {scanStep === 0 && (
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_8px_rgba(10,132,255,1)] animate-scan z-10" />
              )}

              {/* Text lines */}
              <div className="space-y-3">
                <div className="h-3 w-1/3 bg-slate-800 rounded-md" />
                <div className="h-2 w-full bg-slate-900 rounded-sm" />
                
                {/* Paragraph 1: Risk or corrected */}
                <div className={`p-2 rounded-lg border transition-all duration-500 ${
                  scanStep === 0 
                    ? 'bg-transparent border-transparent' 
                    : scanStep === 1 
                      ? 'bg-red-950/20 border-red-500/20 text-red-200/90' 
                      : 'bg-green-950/20 border-green-500/20 text-green-200/90'
                }`}>
                  <div className="text-[10px] font-medium leading-relaxed">
                    {scanStep === 0 && "9.3. В случае просрочки оплаты Арендатор уплачивает штраф в размере 10% от суммы долга за каждый день."}
                    {scanStep === 1 && "⚠️ 9.3. В случае просрочки Арендатор уплачивает штраф 10% за каждый день (Несоразмерная неустойка)."}
                    {scanStep === 2 && "✅ 9.3. В случае просрочки неустойка рассчитывается в размере 0.1% в день согласно ст. 333 ГК РФ."}
                  </div>
                </div>

                <div className="h-2 w-5/6 bg-slate-900 rounded-sm" />

                {/* Paragraph 2: Second risk */}
                <div className={`p-2 rounded-lg border transition-all duration-500 ${
                  scanStep === 0 
                    ? 'bg-transparent border-transparent' 
                    : scanStep === 1 
                      ? 'bg-red-950/10 border-red-500/10 text-red-300/80' 
                      : 'bg-green-950/15 border-green-500/15 text-green-300/80'
                }`}>
                  <div className="text-[10px] font-medium leading-relaxed">
                    {scanStep === 0 && "12.1. Арендодатель имеет право расторгнуть настоящий договор в одностороннем порядке за 3 дня."}
                    {scanStep === 1 && "⚠️ 12.1. Расторжение арендодателем в одностороннем порядке в короткий срок (3 дня)."}
                    {scanStep === 2 && "✅ 12.1. Арендодатель уведомляет о расторжении не менее чем за 30 календарных дней."}
                  </div>
                </div>
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px] text-slate-500 font-semibold uppercase">
                <span>Договор_аренды.docx</span>
                <span className={scanStep === 0 ? 'text-blue-400' : scanStep === 1 ? 'text-red-400' : 'text-green-400'}>
                  {scanStep === 0 ? 'Сканирование...' : scanStep === 1 ? 'Внимание' : 'Проверено'}
                </span>
              </div>
            </div>

            {/* AI Action Card Overlay */}
            <div className="mt-4 transition-all duration-500 transform translate-y-0">
              {scanStep === 0 && (
                <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                  <div>
                    <h4 className="text-xs font-bold text-white">ИИ анализирует текст</h4>
                    <p className="text-[10px] text-slate-400">Сверяем с кодексами и судебной практикой РФ...</p>
                  </div>
                </div>
              )}

              {scanStep === 1 && (
                <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 shadow-lg shadow-red-500/5">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Обнаружено 2 риска</h4>
                    <p className="text-[10px] text-slate-400">Критическая неустойка и кабальный срок расторжения.</p>
                  </div>
                </div>
              )}

              {scanStep === 2 && (
                <div className="bg-green-600/10 border border-green-500/20 rounded-2xl p-4 flex items-start gap-3 shadow-lg shadow-green-500/5">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0 animate-bounce" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Документ исправлен</h4>
                    <p className="text-[10px] text-slate-400">Риски устранены, формулировки приведены к стандарту.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 sm:py-32 px-6 relative z-10 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Как работает Laxly AI</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-base">Всего три простых шага для автоматического решения юридического вопроса</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop only) */}
            <div className="hidden md:block absolute top-[52px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-500/10 via-indigo-500/20 to-purple-500/10" />
            
            {[
              { 
                icon: Upload, 
                title: 'Загрузка', 
                desc: 'Прикрепите договор в любом формате или кратко опишите суть вашей проблемы.',
                badge: 'Шаг 1'
              },
              { 
                icon: Cpu, 
                title: 'Интеллектуальный анализ', 
                desc: 'Алгоритмы изучают детали, сопоставляют условия с законами РФ и ищут скрытые ловушки.',
                badge: 'Шаг 2'
              },
              { 
                icon: FileCheck, 
                title: 'Готовое решение', 
                desc: 'Скачайте юридически верный документ или получите детальное заключение с шагами.',
                badge: 'Шаг 3'
              },
            ].map((step, i) => (
              <div key={i} className="relative bg-[#0E1222]/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl hover:border-blue-500/30 transition-all duration-300 group hover:translate-y-[-4px] shadow-lg shadow-black/20">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center justify-center mb-6 shadow-inner transition-transform group-hover:scale-110">
                  <step.icon className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">{step.badge}</span>
                <h3 className="text-xl font-bold text-white mt-4 mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audiences: Business vs. Citizen */}
      <section className="py-20 sm:py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* For Business card */}
          <div className="p-8 sm:p-12 rounded-[32px] bg-gradient-to-br from-blue-950/20 via-slate-900/40 to-transparent border border-blue-500/10 hover:border-blue-500/30 transition-all duration-300 group hover:shadow-2xl hover:shadow-blue-500/5">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-8 shadow-xl">
              <Building2 className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">Для бизнеса</h3>
            <p className="text-slate-400 mb-8 leading-relaxed text-sm sm:text-base">
              Оптимизируйте расходы на юристов. Наш AI проверит контракт на поставку или аренду за секунды, выявит финансовые риски и защитит от недобросовестных подрядчиков.
            </p>
            <ul className="space-y-4 mb-10">
              {['Мгновенный аудит и сверка контрактов', 'Оценка рисков по 149-ФЗ и ГК РФ', 'Генерация соглашений и претензий'].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link to="/register">
              <Button variant="secondary" className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-wider border border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all">Подробнее для бизнеса</Button>
            </Link>
          </div>

          {/* For Citizens card */}
          <div className="p-8 sm:p-12 rounded-[32px] bg-gradient-to-br from-purple-950/15 via-slate-900/40 to-transparent border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300 group hover:shadow-2xl hover:shadow-purple-500/5">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-8 shadow-xl">
              <User className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">Для граждан</h3>
            <p className="text-slate-400 mb-8 leading-relaxed text-sm sm:text-base">
              Решайте личные юридические споры самостоятельно. Сформируйте претензию продавцу, иск в суд, обжалуйте штраф или получите мгновенный совет эксперта в сложных делах.
            </p>
            <ul className="space-y-4 mb-10">
              {['Составление жалоб, исков и претензий', 'Консультации по защите прав потребителей', 'Удобный юридический архив документов'].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link to="/register">
              <Button variant="secondary" className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-wider border border-purple-500/20 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all">Подробнее для граждан</Button>
            </Link>
          </div>

        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 sm:py-32 px-6 relative z-10 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 space-y-4 text-center lg:text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-500">Технологический стек</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Единая экосистема правовых решений</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                title: 'Конструктор исков', 
                desc: 'Создавайте юридически сильные судебные иски, досудебные претензии и жалобы по вашим вводным за 30 секунд.',
                // Custom glowing SVG for Document/Quill
                svg: (
                  <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current" fill="none" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                ),
                color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
              },
              { 
                title: 'Анализ договоров', 
                desc: 'Моментально проверяйте любые документы на кабальные условия, невыгодную неустойку и риски одностороннего разрыва.',
                // Custom glowing SVG for Shield/Check
                svg: (
                  <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current" fill="none" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 11 2 2 4-4" />
                  </svg>
                ),
                color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              },
              { 
                title: 'AI Консультант', 
                desc: 'Задавайте правовые вопросы и получайте аргументированные ответы с точными ссылками на законы и кодексы РФ.',
                // Custom glowing SVG for Chat/AI
                svg: (
                  <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current" fill="none" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="10" r="1" />
                    <circle cx="8" cy="10" r="1" />
                    <circle cx="16" cy="10" r="1" />
                  </svg>
                ),
                color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
              },
              { 
                title: 'База практики', 
                desc: 'Интеллектуальный поиск по миллионам судебных дел РФ. Укрепите свою позицию схожими выигранными делами.',
                // Custom glowing SVG for Gavel
                svg: (
                  <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current" fill="none" strokeWidth="2">
                    <path d="m14 13-5-5 7-7 5 5-7 7z" />
                    <path d="m3 21 6-6" />
                    <path d="m9 21 6-6" />
                    <path d="M19 16v3" />
                  </svg>
                ),
                color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
              },
              { 
                title: 'Правовой мониторинг', 
                desc: 'Система вовремя оповещает об изменениях в федеральных законах и постановлениях, влияющих на ваш профиль.',
                // Custom glowing SVG for Pulse/Activity
                svg: (
                  <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current" fill="none" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ),
                color: 'text-pink-400 bg-pink-500/10 border-pink-500/20'
              },
              { 
                title: 'Архив файлов', 
                desc: 'Надежное шифрованное хранилище документов. Доступ по защищенному протоколу 24/7 с автоматическим PWA.',
                // Custom glowing SVG for HardDrive/Vault
                svg: (
                  <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current" fill="none" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                    <line x1="6" y1="6" x2="6.01" y2="6" />
                    <line x1="6" y1="18" x2="6.01" y2="18" />
                  </svg>
                ),
                color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
              },
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-3xl bg-[#0C0F1D]/60 border border-white/5 hover:border-blue-500/20 transition-all duration-300 group hover:translate-y-[-4px]">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${f.color}`}>
                  {f.svg}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Solutions (One-off tools) */}
      <section id="quick-tools" className="py-20 sm:py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
              <Zap className="w-3.5 h-3.5" /> БЕЗ ПОДПИСКИ
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Решите конкретную проблему за минуты</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-base">
              Специализированные микро-инструменты для мгновенной генерации узких юридических документов.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Для селлеров WB/Ozon', 
                desc: 'Составим сильную досудебную претензию маркетплейсу за утерю товара, порчу или неверно начисленные штрафы.',
                link: '/tools/marketplace-claim',
                price: '490 ₽',
                badge: 'Популярно',
                badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
                icon: Building2
              },
              { 
                title: 'Защита потребителей', 
                desc: 'Шаблонный возврат денег за дорогостоящие онлайн-курсы, некачественные гаджеты или невыполненные работы.',
                link: '/tools/consumer-claim',
                price: '299 ₽',
                badge: 'Быстро',
                badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
                icon: Shield
              },
              { 
                title: 'Отмена автоштрафов', 
                desc: 'Быстрое обжалование ошибочных штрафов ГИБДД, МАДИ или платных парковок. Готовая форма для отправки онлайн.',
                link: '/tools/auto-fine',
                price: '190 ₽',
                badge: 'Экономия',
                badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/25',
                icon: Gavel
              }
            ].map((tool, i) => (
              <div key={i} className="bg-[#0E1222]/80 border border-white/[0.06] p-8 rounded-3xl hover:border-blue-500/30 hover:shadow-xl hover:shadow-black/40 transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                      <tool.icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{tool.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">{tool.desc}</p>
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Стоимость</span>
                    <span className="text-2xl font-black text-white">{tool.price}</span>
                  </div>
                  <Link to={user ? '/dashboard/documents' : '/register'}>
                    <Button variant="primary" className="h-11 px-5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      Оформить <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tariffs Section */}
      <section id="tariffs" className="py-20 sm:py-32 px-6 relative z-10 bg-white/[0.01] border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Тарифные планы</h2>
            <p className="text-slate-400 text-base max-w-xl mx-auto">Полный доступ к AI юристу по подписке или бесплатный старт</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {[
              { 
                name: 'Базовый', 
                price: '0 ₽', 
                desc: 'Подойдет для ознакомления и простых правовых задач',
                color: 'text-slate-400', 
                features: ['2 документа в месяц', '2 экспресс-проверки договоров', 'Базовая база знаний РФ'] 
              },
              { 
                name: 'Professional', 
                price: '290 ₽', 
                desc: 'Идеален для фрилансеров, ИП и частых личных дел',
                color: 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400', 
                popular: true, 
                features: ['50 документов в месяц', '25 глубоких аудитов договоров', 'Приоритетная скорость обработки', 'Поиск по судебной практике'] 
              },
              { 
                name: 'Корпоративный', 
                price: '990 ₽', 
                desc: 'Мощное решение для полноценного юридического отдела компании',
                color: 'text-amber-400', 
                features: ['200 документов в месяц', '100 проверок контрактов', 'Интеграция по API (Beta)', 'Выделенный лимит токенов'] 
              },
            ].map((t, i) => (
              <div 
                key={i} 
                className={`p-8 sm:p-10 rounded-[32px] border transition-all duration-300 flex flex-col justify-between text-left relative ${
                  t.popular 
                    ? 'bg-blue-600/[0.04] border-blue-500/40 md:scale-105 z-10 shadow-2xl shadow-blue-500/10' 
                    : 'bg-[#0E1222]/50 border-white/5'
                }`}
              >
                {t.popular && (
                  <span className="absolute top-0 right-8 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-lg">
                    Рекомендуем
                  </span>
                )}
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.name}</h3>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className={`text-4xl sm:text-5xl font-black ${t.color}`}>{t.price}</span>
                      <span className="text-xs font-semibold text-slate-500">/ месяц</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-3 leading-relaxed">{t.desc}</p>
                  </div>
                  
                  <div className="h-px bg-white/5" />
                  
                  <ul className="space-y-4">
                    {t.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-slate-300">
                        <CheckCircle className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" /> 
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <Link to="/register">
                    <Button 
                      variant={t.popular ? 'primary' : 'secondary'} 
                      className={`w-full h-12 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-150 ${
                        t.popular 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white' 
                          : 'border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      Выбрать {t.name}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-[#04060C] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-4 flex flex-col items-center md:items-start">
            <Logo size="md" />
            <p className="text-[11px] text-slate-500 font-medium max-w-[220px] text-center md:text-left leading-relaxed">
              Интеллектуальный помощник для правовых и юридических задач любой сложности.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-xs font-semibold text-slate-400">
            <Link to="/terms" className="hover:text-white transition-colors">Условия использования</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Политика конфиденциальности</Link>
            <Link to="/recommendations" className="hover:text-white transition-colors">Рекомендательные технологии</Link>
            <a href="#" className="hover:text-white transition-colors">Контакты</a>
          </div>
          
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
            © 2026 Laxly AI Law.
          </div>
        </div>
      </footer>
    </div>
  )
}
