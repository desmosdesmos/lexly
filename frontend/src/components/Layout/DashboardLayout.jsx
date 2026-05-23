import { useState } from 'react'
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom'
import {
  FileText,
  Shield,
  Scale,
  TrendingUp,
  User,
  Menu,
  X,
  LogOut,
  Home,
  MessageSquare,
  Crown,
  Sun,
  Moon,
  HardDrive,
  Globe,
  Settings,
  Sparkles,
  LayoutDashboard
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useThemeMode } from '../../context/ThemeModeContext'
import { Logo } from '../ui/Logo'
import { OnboardingTour } from '../OnboardingTour'
import { SystemAlert } from '../ui/SystemAlert'

export function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { mode, toggleMode } = useThemeMode()

  const isAdmin = user?.email === 'yan.pashhenko6486@gmail.com' || user?.email === 'desmosymail@gmail.com'

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Обзор', exact: true },
    { path: '/dashboard/documents', icon: FileText, label: 'Документы' },
    { path: '/dashboard/contracts', icon: Shield, label: 'Договоры' },
    { path: '/dashboard/consultant', icon: MessageSquare, label: 'AI-консультант' },
    { path: '/dashboard/drive', icon: HardDrive, label: 'Мои файлы' },
    { path: '/dashboard/case-law', icon: Scale, label: 'Практика' },
    { path: '/dashboard/monitoring', icon: TrendingUp, label: 'Законы' },
    { path: '/dashboard/profile', icon: User, label: 'Профиль' },
    { path: '/dashboard/subscription', icon: Crown, label: 'Тарифы' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path
    return location.pathname.startsWith(item.path)
  }

  return (
    <div className="h-screen w-full flex bg-[var(--bg-primary)] overflow-hidden">
      <OnboardingTour />
      
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 flex flex-col flex-shrink-0
          backdrop-blur-xl
          border-r border-[var(--sidebar-border)]
          transform transition-transform duration-300 ease-out h-full
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 invisible lg:visible'}
        `}
        style={{ background: 'var(--sidebar-bg)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)] flex-shrink-0">
          <Link to="/dashboard" className="flex items-center">
            <Logo size="lg" />
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {/* Navigation - Scrollable part */}
        <nav className="flex-1 py-4 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl text-sm
                  transition-all duration-150 ease-out
                  ${active 
                    ? 'bg-[var(--accent-light)] text-[var(--accent)] font-medium' 
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 ${active ? 'text-[var(--accent)]' : ''}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
          
          {isAdmin && (
             <Link
               to="/dashboard/admin"
               onClick={() => setSidebarOpen(false)}
               className={`
                 flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl text-sm transition-all
                 ${location.pathname === '/dashboard/admin' 
                   ? 'bg-amber-500/10 text-amber-500 font-medium' 
                   : 'text-amber-500/60 hover:text-amber-500 hover:bg-amber-500/5'
                 }
               `}
             >
               <Sparkles className="w-5 h-5" />
               <span>Админ-панель</span>
             </Link>
          )}
        </nav>

        {/* User Section - Fixed at bottom */}
        <div className="p-4 border-t border-[var(--border-subtle)] bg-black/5 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-3 mb-3 rounded-xl bg-[var(--hover-bg)]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A84FF] to-blue-700 flex items-center justify-center font-bold text-xs text-white shadow-lg">
              {user?.full_name?.charAt(0) || 'Ю'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate text-[var(--text-primary)]">{user?.full_name || 'Пользователь'}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] truncate uppercase tracking-widest">{user?.subscription_type || 'FREE'}</div>
            </div>
          </div>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleMode}
            className="w-full flex items-center justify-between px-3 py-2.5 mb-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] rounded-xl transition-all"
          >
            <div className="flex items-center gap-2">
              {mode === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span>{mode === 'dark' ? 'Тёмная тема' : 'Светлая тема'}</span>
            </div>
            <div className={`w-10 h-5 rounded-full transition-all relative ${mode === 'dark' ? 'bg-[#0A84FF]' : 'bg-[#D1D1D6]'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${mode === 'dark' ? 'left-5' : 'left-0.5'}`} />
            </div>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Bar (Mobile only) */}
        <header className="lg:hidden flex-shrink-0 sticky top-0 z-20 backdrop-blur-xl border-b border-[var(--border-subtle)]" style={{ background: 'var(--header-bg)' }}>
          <div className="flex items-center justify-between px-4 py-3 sm:py-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl hover:bg-[var(--hover-bg)] transition-colors"
            >
              <Menu className="w-5 h-5 text-[var(--text-tertiary)]" />
            </button>
            <Logo size="sm" className="h-7" />
            <div className="w-10" />
          </div>
        </header>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <main className="p-4 lg:p-8 w-full max-w-full">
            <SystemAlert />
            <Outlet />
          </main>

          <footer className="px-4 lg:px-8 py-8 border-t border-[var(--border-subtle)]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] uppercase tracking-wider font-bold text-[var(--text-tertiary)]">
              <div className="flex flex-col gap-2">
                <div className="flex gap-6">
                  <Link to="/privacy" className="hover:text-[var(--accent)]">Политика ПДн</Link>
                  <Link to="/terms" className="hover:text-[var(--accent)]">Оферта</Link>
                  <span className="hidden md:inline">Пащенко Я.В., ИНН 644010686500</span>
                </div>
                <div className="flex gap-6 opacity-40">
                  <span>LegalID: LA0005406707</span>
                  <span>MerchantID: MA0006349722</span>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
                <div>© 2026 Laxly Law AI</div>
                <div className="flex gap-4 opacity-30 text-[9px] font-black">
                  <span>T-Pay</span>
                  <span>СБП</span>
                  <span>Мир</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
