import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Shield, 
  FileText, 
  MessageSquare, 
  Gavel, 
  CheckCircle, 
  ArrowRight, 
  Globe, 
  ChevronRight,
  TrendingUp,
  Sparkles,
  Zap,
  HardDrive,
  Menu,
  X
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
    <div className="min-h-screen bg-[#000000] selection:bg-[#0A84FF]/30 overflow-x-hidden">
      {/* Фоновые градиенты */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
         <div className="absolute top-[-10%] right-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-[#0A84FF]/10 blur-[80px] sm:blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-indigo-500/10 blur-[80px] sm:blur-[120px] rounded-full" />
      </div>

      {/* Навигация */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isMenuOpen ? 'bg-black/90 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Logo size="md" />
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">Возможности</a>
            <a href="#tariffs" className="text-sm font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">Тарифы</a>
            {user ? (
              <Link to="/dashboard">
                <Button className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px]">Личный кабинет</Button>
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-bold uppercase tracking-widest text-white/40 hover:text-white px-4 py-2">Войти</Link>
                <Link to="/register">
                  <Button className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px]">Регистрация</Button>
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
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-2xl border-b border-white/5 py-8 px-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
            <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold uppercase tracking-widest text-white/60">Возможности</a>
            <a href="#tariffs" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold uppercase tracking-widest text-white/60">Тарифы</a>
            <div className="h-px bg-white/5" />
            {user ? (
              <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full h-14 rounded-xl font-black uppercase tracking-widest text-[10px]">Личный кабинет</Button>
              </Link>
            ) : (
              <div className="flex flex-col gap-4">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-center py-4 text-sm font-bold uppercase tracking-widest text-white/40">Войти</Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full h-14 rounded-xl font-black uppercase tracking-widest text-[10px]">Регистрация</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Главный блок */}
      <section className="relative pt-32 sm:pt-48 pb-16 sm:pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8 sm:space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
             <Sparkles className="w-4 h-4 text-[#0A84FF]" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Новое поколение юридической помощи</span>
          </div>
          
          <h1 className="text-5xl sm:text-8xl font-black text-white tracking-tighter uppercase italic leading-[1.1] sm:leading-none">
             Ваш персональный <br className="hidden sm:block" />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FF] via-[#0A84FF] to-[#7000FF]">
                AI Юрист.
             </span>
          </h1>
          
          <p className="text-white/40 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
             Автоматизируйте подготовку исков, проводите мгновенный аудит договоров и получайте консультации на базе актуальных законов РФ 2026 года.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Link to={user ? "/dashboard" : "/register"} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-16 px-12 rounded-[22px] font-black uppercase tracking-widest text-xs gap-3 shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
                 Начать бесплатно <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-4 text-white/30 text-[10px] font-black uppercase tracking-widest">
               <div className="flex -space-x-3">
                  {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-white/10" />)}
               </div>
               <span>Более 5000 пользователей</span>
            </div>
          </div>
        </div>
      </section>

      {/* Сетка возможностей */}
      <section id="features" className="py-20 sm:py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 sm:mb-20 space-y-4">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0A84FF]">Возможности сервиса</p>
             <h2 className="text-3xl sm:text-5xl font-black text-white uppercase italic tracking-tighter">Полный спектр услуг <br className="hidden sm:block" />в одном окне</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Конструктор исков', desc: 'Генерация готовых исковых заявлений, жалоб и претензий по вашим данным за 30 секунд.', icon: FileText, color: 'text-blue-400' },
              { title: 'Анализ договоров', desc: 'Мгновенный поиск рисков и «подводных камней» в любых контрактах с рекомендациями по защите.', icon: Shield, color: 'text-amber-400' },
              { title: 'AI Консультант', desc: 'Глубокие ответы на правовые вопросы со ссылками на статьи кодексов и актуальную практику.', icon: MessageSquare, color: 'text-purple-400' },
              { title: 'База практики', desc: 'Поиск по сотням миллионов судебных решений для усиления вашей правовой позиции.', icon: Gavel, color: 'text-indigo-400' },
              { title: 'Мониторинг', desc: 'Автоматическое отслеживание изменений в законодательстве, важных для вашего дела.', icon: TrendingUp, color: 'text-green-400' },
              { title: 'Архив файлов', desc: 'Надежное облачное хранилище для всех ваших документов с доступом 24/7.', icon: HardDrive, color: 'text-pink-400' },
            ].map((f, i) => (
              <div key={i} className="p-8 sm:p-10 rounded-[30px] sm:rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-[#0A84FF]/30 transition-all group">
                 <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 flex items-center justify-center ${f.color} mb-6 sm:mb-8 group-hover:scale-110 transition-transform`}>
                    <f.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                 </div>
                 <h3 className="text-lg sm:text-xl font-bold text-white mb-4 uppercase italic">{f.title}</h3>
                 <p className="text-white/40 text-sm leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Тарифы */}
      <section id="tariffs" className="py-20 sm:py-32 px-6">
         <div className="max-w-7xl mx-auto text-center space-y-12 sm:space-y-20">
            <div className="space-y-4">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0A84FF]">Стоимость использования</p>
               <h2 className="text-3xl sm:text-6xl font-black text-white uppercase italic tracking-tighter">Гибкие тарифные планы</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { name: 'Базовый', price: '0 ₽', color: 'text-white/40', features: ['2 документа', '2 проверки', 'AI Консультант'] },
                 { name: 'Pro', price: '290 ₽', color: 'text-indigo-400', popular: true, features: ['50 документов', '25 проверок', 'Приоритетная скорость'] },
                 { name: 'Бизнес', price: '990 ₽', color: 'text-amber-400', features: ['200 документов', '100 проверок', 'Полный API доступ'] },
               ].map((t, i) => (
                 <div key={i} className={`p-10 sm:p-12 rounded-[40px] sm:rounded-[45px] border transition-all flex flex-col justify-between h-full ${t.popular ? 'bg-[#0A84FF]/5 border-[#0A84FF]/20 md:scale-105 z-10' : 'bg-white/[0.01] border-white/5'}`}>
                    <div className="space-y-8">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{t.name}</p>
                          <div className={`text-4xl sm:text-5xl font-black italic uppercase ${t.color}`}>{t.price}</div>
                       </div>
                       <ul className="space-y-4 text-left">
                          {t.features.map((f, j) => (
                            <li key={j} className="flex items-center gap-3 text-sm font-medium text-white/60">
                               <CheckCircle className="w-4 h-4 text-[#0A84FF]" /> {f}
                            </li>
                          ))}
                       </ul>
                    </div>
                    <Link to="/register" className="mt-10 sm:mt-12">
                       <Button variant={t.popular ? 'primary' : 'secondary'} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                          Выбрать тариф
                       </Button>
                    </Link>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Футер */}
      <footer className="py-16 sm:py-20 px-6 border-t border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <Logo size="md" />
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-[10px] font-black uppercase tracking-widest text-white/20">
             <Link to="/terms" className="hover:text-white transition-colors">Условия использования</Link>
             <Link to="/privacy" className="hover:text-white transition-colors">Конфиденциальность</Link>
             <a href="#" className="hover:text-white transition-colors">Поддержка</a>
          </div>
          <div className="text-[10px] font-bold text-white/10 uppercase tracking-widest text-center">
             © 2026 Laxly AI Law. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  )
}
