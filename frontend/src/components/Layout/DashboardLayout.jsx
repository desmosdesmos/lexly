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
  Sparkles,
  MessageSquare,
  Crown,
  Sun,
  Moon,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useThemeMode } from '../../context/ThemeModeContext'
import { Logo } from '../ui/Logo'

export function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { mode, toggleMode } = useThemeMode()

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Обзор', exact: true },
    { path: '/dashboard/documents', icon: FileText, label: 'Документы' },
    { path: '/dashboard/contracts', icon: Shield, label: 'Договоры' },
    { path: '/dashboard/consultant', icon: MessageSquare, label: 'AI-консультант' },
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
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 flex flex-col
          backdrop-blur-xl
          border-r border-[var(--sidebar-border)]
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ background: 'var(--sidebar-bg)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
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

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
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
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-3 px-3 py-3 mb-3 rounded-xl bg-[var(--hover-bg)]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center ring-1 ring-[var(--glass-border)]">
              <User className="w-5 h-5 text-[var(--text-secondary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{user?.full_name || 'Пользователь'}</div>
              <div className="text-xs text-[var(--text-tertiary)] truncate">{user?.email || 'user@example.com'}</div>
            </div>
          </div>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleMode}
            className="w-full flex items-center justify-between px-3 py-2.5 mb-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] rounded-xl transition-all"
          >
            <div className="flex items-center gap-2">
              {mode === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span>{mode === 'dark' ? 'Тёмная' : 'Светлая'}</span>
            </div>
            <div className={`w-10 h-5 rounded-full transition-all relative ${mode === 'dark' ? 'bg-[#0A84FF]' : 'bg-[#007AFF]'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${mode === 'dark' ? 'bg-white left-5' : 'bg-white left-0.5'}`} />
            </div>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] rounded-xl transition-all"
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 backdrop-blur-xl border-b border-[var(--border-subtle)]" style={{ background: 'var(--header-bg)' }}>
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-[var(--hover-bg)] transition-colors"
            >
              <Menu className="w-5 h-5 text-[var(--text-tertiary)]" />
            </button>
            <div className="flex-1" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>

        {/* Minimal Dashboard Footer */}
        <footer className="px-4 lg:px-8 py-6 border-t border-[var(--border-subtle)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-wider font-medium text-[var(--text-tertiary)]">
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-[var(--accent)]">Политика ПДн</Link>
              <Link to="/terms" className="hover:text-[var(--accent)]">Оферта</Link>
              <span className="hidden md:inline">ООО «Лексли», ИНН 7707445720</span>
            </div>
            <div>© 2026 Laxly Law AI</div>
          </div>
        </footer>
      </div>
    </div>
  )
}
