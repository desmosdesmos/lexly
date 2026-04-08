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
  MessageSquare
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Обзор', exact: true },
    { path: '/dashboard/documents', icon: FileText, label: 'Документы' },
    { path: '/dashboard/contracts', icon: Shield, label: 'Договоры' },
    { path: '/dashboard/consultant', icon: MessageSquare, label: 'AI-консультант' },
    { path: '/dashboard/case-law', icon: Scale, label: 'Практика' },
    { path: '/dashboard/monitoring', icon: TrendingUp, label: 'Законы' },
    { path: '/dashboard/profile', icon: User, label: 'Профиль' },
  ]

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => logout()

  return (
    <div className="min-h-screen relative">
      {/* Mobile Header */}
      <header className="lg:hidden glass sticky top-0 z-50 px-4 py-3 flex items-center justify-between mx-4 mt-2">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold">Lexly</span>
        </button>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-white/5">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
            fixed lg:sticky top-0 left-0 h-screen
            w-72
            transition-transform duration-300 ease-in-out
            z-40 flex flex-col
            bg-white/[0.03] backdrop-blur-[60px]
            border-r border-white/[0.06]
          `}
        >
          {/* Logo — click to go to dashboard overview */}
          <button onClick={() => navigate('/dashboard')} className="p-6 border-b border-white/5 hidden lg:block w-full text-left hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Lexly</h1>
                <p className="text-xs text-white/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Legal Platform
                </p>
              </div>
            </div>
          </button>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive(item.path, item.exact)
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white shadow-sm border border-indigo-500/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 px-4 py-3 mb-3 rounded-xl bg-white/[0.05]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center border border-white/10">
                <User className="w-5 h-5 text-white/70" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{user?.full_name || 'Пользователь'}</div>
                <div className="text-xs text-white/40 truncate">
                  {user?.email || 'user@example.com'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-white/5 hover:border-white/10"
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
        <main className="flex-1 min-w-0">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
