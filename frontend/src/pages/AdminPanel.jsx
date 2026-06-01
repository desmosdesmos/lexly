import { useState, useEffect, useRef } from 'react'
import { 
  Users, CreditCard, TrendingUp, Shield, Trash2, 
  Search, Filter, Check, X, Loader2, AlertTriangle, 
  ArrowUpRight, BarChart3, Settings, Crown, Key,
  Mail, Megaphone, Database, Activity, ChevronRight,
  Download, Plus, Star, Zap, Terminal, FileText,
  Send, Clock, Gavel, Globe, MessageSquare, Headset, Camera
} from 'lucide-react'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { toast } from 'react-toastify'
import api from '../services/api'

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [payments, setPayments] = useState([])
  const [promocodes, setPromocodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updatingUser, setUpdatingUser] = useState(null)
  
  // Support state
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [replyText, setReplyText] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [chatsLoading, setChatsLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [replySending, setReplySending] = useState(false)
  const [chatSearch, setChatSearch] = useState('')

  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)
  
  // Forms state
  const [promoForm, setPromoGenerate] = useState({ prefix: 'LAXLY', plan_id: 'pro', months: 1, count: 5 })
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', type: 'info' })
  const [submitting, setSubmitting] = useState(false)

  const loadChats = async (silent = false) => {
    if (!silent) setChatsLoading(true)
    try {
      const res = await api.get('/admin/support/chats')
      if (Array.isArray(res?.data)) {
        setChats(res.data)
      }
    } catch (err) {
      console.error('Failed to load support chats:', err)
      if (!silent) toast.error('Не удалось загрузить список чатов')
    } finally {
      if (!silent) setChatsLoading(false)
    }
  }

  const loadChatMessages = async (userId, silent = false) => {
    if (!userId) return
    if (!silent) setMessagesLoading(true)
    try {
      const res = await api.get(`/admin/support/chats/${userId}/messages`)
      if (Array.isArray(res?.data)) {
        setChatMessages(res.data)
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err)
      if (!silent) toast.error('Не удалось загрузить историю сообщений')
    } finally {
      if (!silent) setMessagesLoading(false)
    }
  }

  const handleSendReply = async (e) => {
    if (e) e.preventDefault()
    if (!selectedChat || (!replyText.trim() && !selectedImage) || replySending) return
    
    const formData = new FormData()
    if (replyText.trim()) formData.append('message', replyText.trim())
    if (selectedImage) formData.append('image', selectedImage)
    
    const currentMsg = replyText
    setReplyText('')
    setSelectedImage(null)
    setImagePreview(null)
    setReplySending(true)
    
    try {
      await api.post(`/admin/support/chats/${selectedChat.user_id}/message`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      await loadChatMessages(selectedChat.user_id, true)
      loadChats(true)
    } catch (err) {
      console.error('Failed to send reply:', err)
      setReplyText(currentMsg)
      toast.error('Не удалось отправить сообщение')
    } finally {
      setReplySending(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Файл слишком большой (макс. 5МБ)')
        return
      }
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      try {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
      } catch (e) {
        messagesEndRef.current.scrollIntoView(false)
      }
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (activeTab === 'support' && selectedChat && chatMessages.length > 0) {
      scrollToBottom()
    }
  }, [chatMessages.length, activeTab, selectedChat])

  // Polling for support chats list
  useEffect(() => {
    if (activeTab === 'support') {
      const interval = setInterval(() => {
        loadChats(true)
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [activeTab])

  // Polling for selected chat messages
  useEffect(() => {
    if (activeTab === 'support' && selectedChat) {
      loadChatMessages(selectedChat.user_id)
      const interval = setInterval(() => {
        loadChatMessages(selectedChat.user_id, true)
      }, 4000)
      return () => clearInterval(interval)
    } else {
      setChatMessages([])
    }
  }, [activeTab, selectedChat?.user_id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: null })),
        api.get('/admin/users').catch(() => ({ data: [] }))
      ])
      
      setStats(statsRes?.data || null)
      setUsers(Array.isArray(usersRes?.data) ? usersRes.data : [])
      
      // Load specific tab data if needed
      if (activeTab === 'payments') {
        const payRes = await api.get('/admin/payments').catch(() => ({ data: [] }))
        setPayments(Array.isArray(payRes?.data) ? payRes.data : [])
      } else if (activeTab === 'promocodes') {
        const promoRes = await api.get('/admin/promocodes').catch(() => ({ data: [] }))
        setPromocodes(Array.isArray(promoRes?.data) ? promoRes.data : [])
      }
    } catch (error) {
      console.error('Admin load error:', error)
      toast.error('Ошибка доступа или сервера')
    } finally {
      loadChats(true)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [activeTab])

  const handleUpdatePlan = async (userId, planId) => {
    setUpdatingUser(userId)
    try {
      await api.post('/admin/update-plan', { user_id: userId, plan_id: planId })
      toast.success('Тариф обновлен')
      loadData()
    } catch (error) {
      toast.error('Ошибка обновления')
    } finally {
      setUpdatingUser(null)
    }
  }

  const handleGeneratePromos = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/admin/promocodes/generate', promoForm)
      toast.success('Коды успешно созданы')
      loadData()
    } catch (error) {
      toast.error('Ошибка генерации')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendBroadcast = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.post('/admin/broadcast', broadcastForm)
      toast.success(`Уведомление отправлено ${res?.data?.delivered_to || 0} пользователям`)
      setBroadcastForm({ title: '', message: '', type: 'info' })
    } catch (error) {
      toast.error('Ошибка рассылки')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadBackup = async () => {
    try {
      const res = await api.get('/admin/backup', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `laxly_backup_${new Date().toISOString().split('T')[0]}.db`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Бекап скачан успешно')
    } catch (error) {
      toast.error('Ошибка при скачивании бекапа')
    }
  }

  const filteredUsers = Array.isArray(users) ? users.filter(u => 
    (u.email || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.full_name || '').toLowerCase().includes(search.toLowerCase())
  ) : []

  const tabs = [
    { id: 'dashboard', label: 'Дашборд', icon: BarChart3 },
    { id: 'users', label: 'Пользователи', icon: Users },
    { id: 'payments', label: 'Платежи', icon: CreditCard },
    { id: 'promocodes', label: 'Промокоды', icon: Key },
    { id: 'broadcast', label: 'Рассылка', icon: Megaphone },
    { id: 'support', label: 'Поддержка', icon: Headset },
    { id: 'system', label: 'Система', icon: Database },
  ]

  const totalUnreadSupport = chats.reduce((sum, c) => sum + (c.unread_count || 0), 0)

  // Safety for popularity chart
  const popularityValues = stats?.docs_popularity ? Object.values(stats.docs_popularity) : []
  const maxPopularity = popularityValues.length > 0 ? Math.max(...popularityValues) : 1

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-8 pt-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
             Control Center 2.0
          </h1>
          <p className="text-white/30 font-medium text-sm uppercase tracking-widest">Администрирование системы</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
           {tabs.map(tab => {
             const showBadge = tab.id === 'support' && totalUnreadSupport > 0
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all relative ${
                   activeTab === tab.id ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white/70'
                 }`}
               >
                 <tab.icon className="w-4 h-4" />
                 <span className="hidden sm:inline">{tab.label}</span>
                 {showBadge && (
                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[16px] h-[16px]">
                      {totalUnreadSupport}
                   </span>
                 )}
               </button>
             )
           })}
        </div>
      </div>

      {loading && activeTab !== 'dashboard' ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
           <Loader2 className="w-10 h-10 text-[#0A84FF] animate-spin" />
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Загрузка данных...</span>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500">
          
          {/* --- DASHBOARD TAB --- */}
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 flex items-center justify-between group">
                     <div className="space-y-2">
                        <div className="text-3xl font-black text-white">{stats?.total_users || 0}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Пользователей</div>
                     </div>
                     <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                        <Users className="w-7 h-7" />
                     </div>
                  </div>
                  <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 flex items-center justify-between group">
                     <div className="space-y-2">
                        <div className="text-3xl font-black text-white">{stats?.total_payments || 0}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Продаж</div>
                     </div>
                     <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                        <CreditCard className="w-7 h-7" />
                     </div>
                  </div>
                  <div className="p-8 rounded-[40px] bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 flex items-center justify-between group">
                     <div className="space-y-2">
                        <div className="text-3xl font-black text-white">{stats?.total_revenue?.toLocaleString() || 0} ₽</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-green-500/60">Выручка</div>
                     </div>
                     <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-7 h-7" />
                     </div>
                  </div>
               </div>

               {/* Document Analytics */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="rounded-[40px] border-white/5 bg-white/[0.01]">
                     <CardBody className="p-8 space-y-8">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                           <FileText className="w-4 h-4" /> Популярность документов
                        </h3>
                        <div className="space-y-6">
                           {stats?.docs_popularity && Object.entries(stats.docs_popularity).length > 0 ? (
                             Object.entries(stats.docs_popularity).map(([type, count]) => (
                               <div key={type} className="space-y-2">
                                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                     <span className="text-white/60">{type}</span>
                                     <span className="text-white">{count}</span>
                                  </div>
                                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                     <div className="h-full bg-[#0A84FF] opacity-50" style={{ width: `${(count / maxPopularity) * 100}%` }} />
                                  </div>
                               </div>
                             ))
                           ) : (
                             <p className="text-center py-10 text-white/20 italic text-sm">Нет данных по документам</p>
                           )}
                        </div>
                     </CardBody>
                  </Card>

                  <Card className="rounded-[40px] border-white/5 bg-white/[0.01]">
                     <CardBody className="p-8 flex flex-col justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                           <Terminal className="w-4 h-4" /> Статус систем
                        </h3>
                        <div className="space-y-4 pt-10">
                           {[
                             { name: 'Core API', status: 'Active', color: 'bg-green-500' },
                             { name: 'Database', status: 'Online', color: 'bg-green-500' },
                             { name: 'AI Engines', status: 'Stable', color: 'bg-green-500' },
                             { name: 'YooKassa Webhook', status: 'Ready', color: 'bg-blue-500' },
                           ].map(sys => (
                             <div key={sys.name} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                <span className="text-xs font-bold text-white/60">{sys.name}</span>
                                <div className="flex items-center gap-2">
                                   <div className={`w-1.5 h-1.5 rounded-full ${sys.color} animate-pulse`} />
                                   <span className="text-[10px] font-black uppercase text-white/40">{sys.status}</span>
                                </div>
                             </div>
                           ))}
                        </div>
                     </CardBody>
                  </Card>
               </div>
            </div>
          )}

          {/* --- USERS TAB --- */}
          {activeTab === 'users' && (
            <Card className="rounded-[40px] border-white/5 bg-white/[0.01] overflow-hidden">
               <div className="p-8 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/[0.01]">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input 
                      placeholder="Поиск по email или имени..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-11 bg-white/5 border-white/10 rounded-2xl h-14"
                    />
                  </div>
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/20">
                     Найдено: {filteredUsers.length}
                  </div>
               </div>
               <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-white/20">Пользователь</th>
                        <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-white/20">Тариф</th>
                        <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-white/20 text-right">Управление</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {filteredUsers.map((u) => (
                        <tr key={u?.id || Math.random()} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                          <td className="py-6 px-8">
                            <div className="space-y-1">
                              <div className="font-bold text-white group-hover:text-[#0A84FF] transition-colors">{u?.full_name || '—'}</div>
                              <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{u?.email}</div>
                            </div>
                          </td>
                          <td className="py-6 px-8">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              u?.plan === 'enterprise' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                              u?.plan === 'business' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                              u?.plan === 'pro' ? 'bg-[#0A84FF]/10 text-[#0A84FF] border-[#0A84FF]/20' :
                              'bg-white/5 text-white/20 border-white/5'
                            }`}>
                              {u?.plan}
                            </span>
                          </td>
                          <td className="py-6 px-8 text-right">
                             <div className="flex items-center justify-end gap-2">
                                {['free', 'pro', 'business', 'enterprise'].map(p => (
                                  <button
                                    key={p}
                                    onClick={() => handleUpdatePlan(u.id, p)}
                                    disabled={updatingUser === u?.id || u?.plan === p}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                      u?.plan === p ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/60 hover:bg-white/5'
                                    }`}
                                  >
                                    {p === updatingUser ? '...' : p}
                                  </button>
                                ))}
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </Card>
          )}

          {/* --- PAYMENTS TAB --- */}
          {activeTab === 'payments' && (
            <Card className="rounded-[40px] border-white/5 bg-white/[0.01] overflow-hidden">
               <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Транзакции ЮKassa</h3>
               </div>
               <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-white/20">Клиент</th>
                        <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-white/20">Сумма</th>
                        <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-white/20">Статус</th>
                        <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-white/20">Дата</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {payments.length === 0 ? (
                        <tr><td colSpan="4" className="py-20 text-center text-white/20 italic">Нет зарегистрированных платежей</td></tr>
                      ) : (
                        payments.map((p) => (
                          <tr key={p?.id || Math.random()} className="border-b border-white/5 hover:bg-white/[0.01] transition-all">
                             <td className="py-6 px-8">
                                <div className="text-xs font-bold text-white/80">{p?.user_email}</div>
                                <div className="text-[9px] font-medium text-white/20 uppercase tracking-widest mt-1">Тариф: {p?.plan_id}</div>
                             </td>
                             <td className="py-6 px-8">
                                <div className="text-base font-black text-white">{p?.amount || 0} ₽</div>
                             </td>
                             <td className="py-6 px-8">
                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] ${
                                  p?.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                  p?.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                  'bg-red-500/10 text-red-500'
                                }`}>
                                   {p?.status}
                                </span>
                             </td>
                             <td className="py-6 px-8 text-[10px] font-bold text-white/20 uppercase">
                                {p?.created_at ? new Date(p.created_at).toLocaleString() : '—'}
                             </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
               </div>
            </Card>
          )}

          {/* --- PROMOCODES TAB --- */}
          {activeTab === 'promocodes' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
               <div className="lg:col-span-1 space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/20 ml-4">Генератор кодов</h3>
                  <Card className="rounded-[40px] border-white/5 bg-white/[0.02]">
                     <CardBody className="p-8">
                        <form onSubmit={handleGeneratePromos} className="space-y-6">
                           <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 ml-2">Префикс</label>
                              <Input 
                                value={promoForm.prefix}
                                onChange={e => setPromoGenerate({...promoForm, prefix: e.target.value.toUpperCase()})}
                                className="bg-white/5 border-white/10 rounded-2xl h-14 font-black uppercase italic"
                              />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 ml-2">Тариф</label>
                                 <select 
                                   value={promoForm.plan_id}
                                   onChange={e => setPromoGenerate({...promoForm, plan_id: e.target.value})}
                                   className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-xs font-bold text-white outline-none"
                                 >
                                    <option value="pro" className="bg-black">Pro</option>
                                    <option value="business" className="bg-black">Business</option>
                                    <option value="enterprise" className="bg-black">Enterprise</option>
                                 </select>
                              </div>
                              <div>
                                 <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 ml-2">Месяцев</label>
                                 <Input 
                                   type="number"
                                   value={promoForm.months}
                                   onChange={e => setPromoGenerate({...promoForm, months: parseInt(e.target.value) || 1})}
                                   className="bg-white/5 border-white/10 rounded-2xl h-14"
                                 />
                              </div>
                           </div>
                           <Button type="submit" disabled={submitting} className="w-full h-16 rounded-[24px] uppercase font-black tracking-widest text-xs gap-3 shadow-lg shadow-white/5">
                              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                              Сгенерировать
                           </Button>
                        </form>
                     </CardBody>
                  </Card>
               </div>
               <div className="lg:col-span-2 space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/20 ml-4">Последние коды</h3>
                  <Card className="rounded-[40px] border-white/5 bg-white/[0.01] overflow-hidden">
                     <div className="overflow-y-auto max-h-[600px] no-scrollbar">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="border-b border-white/5 sticky top-0 bg-black z-10">
                                 <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-white/20">Код</th>
                                 <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-white/20">План</th>
                                 <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-white/20 text-right">Статус</th>
                              </tr>
                           </thead>
                           <tbody className="text-sm font-medium text-white/80">
                              {promocodes.length === 0 ? (
                                <tr><td colSpan="3" className="py-20 text-center text-white/10 italic">Промокоды не найдены</td></tr>
                              ) : (
                                promocodes.map(c => (
                                  <tr key={c?.id || Math.random()} className="border-b border-white/5 hover:bg-white/[0.01]">
                                     <td className="py-5 px-8 font-black italic tracking-widest">{c?.code}</td>
                                     <td className="py-5 px-8 uppercase text-[10px] text-white/40">{c?.plan_id} ({c?.months} мес)</td>
                                     <td className="py-5 px-8 text-right">
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${c?.is_used ? 'text-red-500' : 'text-green-500'}`}>
                                           {c?.is_used ? 'Использован' : 'Активен'}
                                        </span>
                                     </td>
                                  </tr>
                                ))
                              )}
                           </tbody>
                        </table>
                     </div>
                  </Card>
               </div>
            </div>
          )}

          {/* --- BROADCAST TAB --- */}
          {activeTab === 'broadcast' && (
            <div className="max-w-2xl mx-auto space-y-8">
               <div className="text-center space-y-4">
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Массовое оповещение</h3>
                  <p className="text-white/20 text-sm italic font-medium tracking-widest uppercase">Будет отправлено всей базе пользователей</p>
               </div>
               <Card className="rounded-[45px] border-white/5 bg-white/[0.02] p-4">
                  <CardBody className="p-8">
                     <form onSubmit={handleSendBroadcast} className="space-y-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 ml-2">Заголовок</label>
                           <Input 
                             required
                             placeholder="Обновление системы 2.0"
                             value={broadcastForm.title}
                             onChange={e => setBroadcastForm({...broadcastForm, title: e.target.value})}
                             className="bg-white/5 border-white/10 rounded-2xl h-14 font-bold"
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 ml-2">Текст сообщения</label>
                           <Textarea 
                             required
                             placeholder="Текст уведомления..."
                             rows={6}
                             value={broadcastForm.message}
                             onChange={e => setBroadcastForm({...broadcastForm, message: e.target.value})}
                             className="bg-white/5 border-white/10 rounded-[30px] p-6 text-sm font-medium leading-relaxed"
                           />
                        </div>
                        <div className="flex items-center justify-between gap-6">
                           <div className="flex gap-4">
                              {['info', 'warning', 'success'].map(type => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => setBroadcastForm({...broadcastForm, type})}
                                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                    broadcastForm.type === type ? 'bg-white text-black border-white' : 'text-white/20 border-white/5 hover:border-white/20'
                                  }`}
                                >
                                   {type}
                                </button>
                              ))}
                           </div>
                           <Button type="submit" disabled={submitting} className="h-16 px-10 rounded-[24px] uppercase font-black tracking-widest text-xs gap-3 flex-1 shadow-lg shadow-white/5">
                              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                              Отправить всем
                           </Button>
                        </div>
                     </form>
                  </CardBody>
               </Card>
            </div>
          )}

          {/* --- SYSTEM TAB --- */}
          {activeTab === 'system' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <Card className="rounded-[45px] border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group p-6">
                  <CardBody className="p-10 text-center space-y-8">
                     <div className="w-24 h-24 rounded-[35px] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-2xl">
                        <Database className="w-10 h-10 text-blue-500" />
                     </div>
                     <div className="space-y-3">
                        <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">База данных</h4>
                        <p className="text-white/30 text-sm font-medium leading-relaxed">
                           Экспорт `law_ai_agent.db`. Рекомендуется делать бекап перед крупными обновлениями.
                        </p>
                     </div>
                     <button 
                       onClick={handleDownloadBackup}
                       className="w-full h-16 rounded-[28px] bg-white text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-xl"
                     >
                        <Download className="w-5 h-5" /> Скачать SQLite
                     </button>
                  </CardBody>
               </Card>

               <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/20 ml-4">Статус систем</h3>
                  <div className="space-y-4">
                     {[
                       { label: 'Uptime', value: '99.98%', icon: Clock, color: 'text-green-500' },
                       { label: 'AI Health', value: 'Optimal', icon: AlertTriangle, color: 'text-green-500' },
                       { label: 'Database Latency', value: '12ms', icon: Activity, color: 'text-[#0A84FF]' },
                       { label: 'API Version', value: 'v2.6.5', icon: Zap, color: 'text-purple-500' },
                     ].map(metric => (
                       <div key={metric.label} className="p-6 rounded-[30px] bg-white/[0.02] border border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="p-2.5 rounded-xl bg-white/5">
                                <metric.icon className="w-4 h-4 text-white/30" />
                             </div>
                             <span className="text-xs font-bold text-white/60">{metric.label}</span>
                          </div>
                          <span className={`text-sm font-black italic tracking-widest ${metric.color}`}>{metric.value}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}

          {/* --- SUPPORT TAB --- */}
          {activeTab === 'support' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[750px] animate-in fade-in duration-500">
               {/* Chats Sidebar */}
               <div className="lg:col-span-4 flex flex-col h-full bg-white/[0.01] border border-white/5 rounded-[40px] overflow-hidden">
                  {/* Search Header */}
                  <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                     <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <Input 
                          placeholder="Поиск по имени/email..." 
                          value={chatSearch}
                          onChange={(e) => setChatSearch(e.target.value)}
                          className="pl-11 bg-white/5 border-white/10 rounded-2xl h-12 text-sm"
                        />
                     </div>
                  </div>
                  
                  {/* Chats List */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                     {chatsLoading && chats.length === 0 ? (
                       <div className="h-full flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-[#0A84FF] animate-spin" />
                       </div>
                     ) : chats.length === 0 ? (
                       <div className="h-full flex flex-col items-center justify-center p-8 text-center text-white/20">
                          <MessageSquare className="w-10 h-10 mb-4 opacity-50" />
                          <p className="text-xs font-bold uppercase tracking-widest">Нет активных чатов</p>
                       </div>
                     ) : (
                       chats
                         .filter(c => 
                           (c.user_name || '').toLowerCase().includes(chatSearch.toLowerCase()) ||
                           (c.user_email || '').toLowerCase().includes(chatSearch.toLowerCase())
                         )
                         .map(c => {
                           const isSelected = selectedChat?.user_id === c.user_id
                           return (
                             <button
                               key={c.user_id}
                               type="button"
                               onClick={() => setSelectedChat(c)}
                               className={`w-full text-left p-4 rounded-3xl border transition-all flex items-start gap-4 relative group ${
                                 isSelected 
                                   ? 'bg-white/[0.05] border-white/15 shadow-xl' 
                                   : 'bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/5'
                               }`}
                             >
                               <div className="relative flex-shrink-0">
                                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0A84FF]/10 to-[#5E5CE6]/10 border border-white/5 flex items-center justify-center text-white font-bold text-sm">
                                     {(c.user_name || c.user_email || '?')[0].toUpperCase()}
                                  </div>
                                  {c.unread_count > 0 && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF3B30] border-2 border-black rounded-full flex items-center justify-center text-[9px] font-black text-white">
                                       {c.unread_count}
                                    </div>
                                  )}
                               </div>
                               <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex items-center justify-between">
                                     <span className="font-bold text-xs text-white truncate max-w-[70%] group-hover:text-[#0A84FF] transition-colors">
                                        {c.user_name || 'Пользователь'}
                                     </span>
                                     <span className="text-[9px] font-bold text-white/20 uppercase">
                                        {c.last_message ? new Date(c.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                     </span>
                                  </div>
                                  <p className="text-[10px] text-white/40 truncate font-semibold font-mono">{c.user_email}</p>
                                  <div className="flex items-center justify-between gap-2 mt-1">
                                     <p className="text-xs text-white/30 truncate flex-1 leading-normal">
                                        {c.last_message?.sender === 'support' ? <span className="text-[#0A84FF] mr-1">Вы:</span> : ''}
                                        {c.last_message?.text || (c.last_message?.image_url ? '📎 [Фото]' : '')}
                                     </p>
                                     <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border flex-shrink-0 ${
                                       c.user_plan === 'enterprise' ? 'text-purple-400 border-purple-500/20 bg-purple-500/5' :
                                       c.user_plan === 'business' ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' :
                                       c.user_plan === 'pro' ? 'text-[#0A84FF] border-[#0A84FF]/20 bg-[#0A84FF]/5' :
                                       'text-white/20 border-white/5 bg-white/5'
                                     }`}>
                                        {c.user_plan}
                                     </span>
                                  </div>
                               </div>
                             </button>
                           )
                         })
                     )}
                  </div>
               </div>
               
               {/* Chat Detail / Messages History */}
               <div className="lg:col-span-8 flex flex-col h-full bg-white/[0.01] border border-white/5 rounded-[40px] overflow-hidden relative">
                  {selectedChat ? (
                    <div className="flex flex-col h-full">
                       {/* Chat Header */}
                       <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0A84FF]/20 to-[#5E5CE6]/20 border border-white/10 flex items-center justify-center text-white font-bold text-base shadow-xl">
                                {(selectedChat.user_name || selectedChat.user_email || '?')[0].toUpperCase()}
                             </div>
                             <div>
                                <h4 className="font-bold text-sm text-white">{selectedChat.user_name || 'Пользователь'}</h4>
                                <p className="text-xs text-white/30 font-medium mt-0.5 font-mono">{selectedChat.user_email}</p>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                             <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                               selectedChat.user_plan === 'enterprise' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                               selectedChat.user_plan === 'business' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                               selectedChat.user_plan === 'pro' ? 'bg-[#0A84FF]/10 text-[#0A84FF] border-[#0A84FF]/20' :
                               'bg-white/5 text-white/20 border-white/5'
                             }`}>
                                Тариф: {selectedChat.user_plan}
                             </span>
                          </div>
                       </div>
                       
                       {/* Messages View */}
                       <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/10">
                          {messagesLoading && chatMessages.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                               <Loader2 className="w-8 h-8 text-[#0A84FF] animate-spin" />
                            </div>
                          ) : (
                            chatMessages.map(msg => (
                              <div key={msg.id} className={`flex flex-col ${msg.sender === 'support' ? 'items-end' : 'items-start'}`}>
                                 <div className={`max-w-[75%] p-4 rounded-[24px] shadow-sm relative group border ${
                                   msg.sender === 'support' 
                                     ? 'bg-[#0A84FF] border-[#0A84FF]/20 text-white rounded-tr-none shadow-[#0A84FF]/10' 
                                     : 'bg-white/[0.02] border-white/5 text-slate-200 rounded-tl-none'
                                 }`}>
                                    {msg.image_url && (
                                      <div className="mb-2 rounded-xl overflow-hidden border border-white/10 shadow-inner group">
                                         <img 
                                           src={msg.image_url} 
                                           alt="Attachment" 
                                           className="max-w-full max-h-[300px] object-cover cursor-zoom-in hover:scale-[1.02] transition-transform duration-500"
                                           onClick={() => window.open(msg.image_url, '_blank')}
                                         />
                                      </div>
                                    )}
                                    {msg.text && <p className="whitespace-pre-wrap break-words text-sm font-medium leading-relaxed font-sans">{msg.text}</p>}
                                 </div>
                                 <div className="flex items-center gap-1.5 mt-1.5 px-2">
                                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                                       {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {msg.sender === 'support' && (
                                      <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest">
                                         · {msg.is_read ? 'Прочитано' : 'Отправлено'}
                                      </span>
                                    )}
                                 </div>
                              </div>
                            ))
                          )}
                          <div ref={messagesEndRef} />
                       </div>
                       
                       {/* Image Preview */}
                       {imagePreview && (
                         <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                               <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                               <button 
                                 type="button"
                                 onClick={() => {setSelectedImage(null); setImagePreview(null)}}
                                 className="absolute top-1 right-1 bg-black/80 rounded-full p-1 text-white hover:bg-red-500 transition-colors"
                               >
                                  <X className="w-3 h-3" />
                               </button>
                            </div>
                            <div className="flex-1">
                               <p className="text-white text-xs font-bold truncate">{selectedImage.name}</p>
                               <p className="text-[#0A84FF] text-[10px] font-black uppercase tracking-wider mt-1">Прикреплено изображение</p>
                            </div>
                         </div>
                       )}
                       
                       {/* Chat Input */}
                       <form onSubmit={handleSendReply} className="p-6 bg-white/[0.01] border-t border-white/5">
                          <div className="flex items-end gap-4 bg-white/[0.02] border border-white/5 rounded-3xl p-3 focus-within:border-[#0A84FF]/30 transition-all">
                             <button
                               type="button"
                               onClick={() => fileInputRef.current?.click()}
                               className="w-11 h-11 rounded-2xl hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white/70 transition-all active:scale-95 flex-shrink-0"
                             >
                                <Camera className="w-5 h-5" />
                             </button>
                             <input 
                               type="file" 
                               ref={fileInputRef} 
                               onChange={handleImageChange} 
                               accept="image/*" 
                               className="hidden" 
                             />
                             
                             <textarea
                               rows="1"
                               value={replyText}
                               onChange={(e) => {
                                 setReplyText(e.target.value)
                                 e.target.style.height = 'auto'
                                 e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
                               }}
                               onKeyDown={(e) => {
                                 if (e.key === 'Enter' && !e.shiftKey) {
                                   e.preventDefault()
                                   handleSendReply(e)
                                 }
                               }}
                               placeholder="Напишите ответ..."
                               className="flex-1 bg-transparent border-none px-1 py-3 text-sm text-white placeholder-white/20 focus:ring-0 resize-none max-h-[100px] custom-scrollbar font-medium font-sans"
                             />
                             
                             <button
                               type="submit"
                               disabled={(!replyText.trim() && !selectedImage) || replySending}
                               className="w-11 h-11 rounded-2xl bg-white disabled:bg-white/10 text-black disabled:text-white/20 flex items-center justify-center disabled:scale-95 active:scale-95 transition-all flex-shrink-0 shadow-xl"
                             >
                                {replySending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                             </button>
                          </div>
                       </form>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-white/20">
                       <div className="w-24 h-24 rounded-[35px] bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6 shadow-2xl">
                          <MessageSquare className="w-10 h-10 opacity-40 text-white" />
                       </div>
                       <h4 className="text-white font-bold text-base mb-2">Обращения в поддержку</h4>
                       <p className="text-white/40 text-xs font-semibold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                          Выберите чат из левого списка для начала переписки с пользователем
                       </p>
                    </div>
                  )}
               </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
