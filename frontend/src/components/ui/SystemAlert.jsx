import { useState, useEffect } from 'react'
import { Bell, X, Info, AlertTriangle, CheckCircle, ChevronRight, Megaphone } from 'lucide-react'
import api from '../../services/api'

export function SystemAlert() {
  const [notifications, setNotifications] = useState([])

  const loadNotifications = async () => {
    try {
      const res = await api.get('/user/notifications')
      setNotifications(res.data || [])
    } catch (error) {
      console.error('Failed to load system notifications')
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const markAsRead = async (id) => {
    try {
      await api.post(`/user/notifications/${id}/read`)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('Failed to mark notification as read')
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="space-y-3 mb-8 animate-in slide-in-from-top-4 duration-500">
      {notifications.map((n) => (
        <div 
          key={n.id}
          className={`
            relative p-5 rounded-[24px] border flex items-start gap-4 shadow-xl overflow-hidden group
            ${n.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' : 
              n.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-200' : 
              'bg-[#0A84FF]/10 border-[#0A84FF]/20 text-blue-100'}
          `}
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
             <Megaphone className="w-24 h-24" />
          </div>
          
          <div className={`p-3 rounded-2xl bg-white/5 flex-shrink-0`}>
             {n.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-500" /> : 
              n.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-500" /> : 
              <Info className="w-5 h-5 text-[#0A84FF]" />}
          </div>

          <div className="flex-1 pr-10">
            <h4 className="font-bold text-sm uppercase tracking-widest mb-1">{n.title}</h4>
            <p className="text-[13px] opacity-80 leading-relaxed font-medium">{n.message}</p>
            <div className="text-[9px] font-bold uppercase tracking-widest opacity-30 mt-3">
               Сообщение от администрации • {new Date(n.created_at).toLocaleDateString()}
            </div>
          </div>

          <button 
            onClick={() => markAsRead(n.id)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all opacity-40 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
