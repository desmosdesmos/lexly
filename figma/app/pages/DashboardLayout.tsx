import { Outlet, Link, useLocation } from 'react-router';
import {
  FileText,
  Shield,
  Scale,
  TrendingUp,
  User,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/Button';

export function DashboardLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: Scale, label: 'Обзор', exact: true },
    { path: '/dashboard/documents', icon: FileText, label: 'Генератор документов' },
    { path: '/dashboard/contracts', icon: Shield, label: 'Проверка договора' },
    { path: '/dashboard/case-law', icon: Scale, label: 'Судебная практика' },
    { path: '/dashboard/monitoring', icon: TrendingUp, label: 'Мониторинг законов' },
    { path: '/dashboard/profile', icon: User, label: 'Профиль' },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden bg-sidebar text-sidebar-foreground p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Scale className="w-6 h-6" />
          <span className="font-semibold">AI-Юрист</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
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
            w-64 bg-sidebar text-sidebar-foreground
            transition-transform duration-300 ease-in-out
            z-40 flex flex-col
          `}
        >
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border hidden lg:block">
            <div className="flex items-center gap-2">
              <Scale className="w-8 h-8 text-sidebar-primary" />
              <span className="text-xl font-semibold">AI-Юрист</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive(item.path, item.exact)
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                    : 'hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-sidebar-accent/50">
              <div className="w-10 h-10 bg-sidebar-primary rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">Пользователь</div>
                <div className="text-xs text-sidebar-foreground/60 truncate">
                  user@example.com
                </div>
              </div>
            </div>
            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-xl transition-colors">
              <LogOut className="w-4 h-4" />
              <span>Выйти</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
