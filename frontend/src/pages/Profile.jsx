import { useState, useEffect } from 'react'
import { User, FileText, CreditCard, Shield, Clock, CheckCircle, ExternalLink, MessageSquare, Crown, AlertTriangle, ArrowRight, Zap, Edit2, Lock, Save, X, Phone, Building, Mail, KeyRound, Loader2, Ticket, ShieldCheck, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { PaywallModal } from '../components/ui/PaywallModal'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import api from '../services/api'

// Activation Code Section (Redesigned)
function ActivationCodeSection({ onActivated }) {
  const [code, setCode] = useState('')
  const [activating, setActivating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleActivate = async (e) => {
    e.preventDefault()
    if (!code.trim()) return

    setActivating(true)
    try {
      const res = await api.post('/payments/activate-code', { code: code.trim() })
      toast.success('Подписка активирована!')
      setCode('')
      setShowForm(false)
      if (onActivated) onActivated()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка активации')
    } finally {
      setActivating(false)
    }
  }
  
  return (
    <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
          <Ticket className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Активация кода</h2>
          <p className="text-sm text-white/40 font-medium">Введите промокод для подписки</p>
        </div>
      </div>
      
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-4 rounded-[22px] bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
        >
          <KeyRound className="w-4 h-4" />
          Ввести промокод
        </button>
      ) : (
        <form onSubmit={handleActivate} className="flex gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXX-XXXX"
            className="flex-1 bg-white/5 border border-white/10 rounded-[22px] px-6 py-4 text-white font-mono tracking-widest focus:outline-none focus:border-[#0A84FF]/50 transition-colors"
          />
          <button
            type="submit"
            disabled={activating || !code.trim()}
            className="px-8 bg-white text-black hover:bg-white/90 rounded-[22px] font-black transition-all disabled:opacity-50"
          >
            {activating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Ok'}
          </button>
        </form>
      )}
    </div>
  )
}

export function Profile() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPaywall, setShowPaywall] = useState(false)
  
  const [editMode, setEditMode] = useState(false)
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    company_name: '',
    company_inn: '',
  })
  const [savingProfile, setSavingProfile] = useState(false)
  
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [docsRes, usageRes] = await Promise.all([
          api.get('/documents', { params: { page: 1, limit: 50 } }),
          api.get('/user/usage'),
        ])
        setDocuments(docsRes.data.items || [])
        setUsage(usageRes.data)
      } catch (e) {
        console.error('Load error:', e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        company_name: user.company_name || '',
        company_inn: user.company_inn || '',
      })
    }
  }, [user])
  
  const reloadData = async () => {
    try {
      const [docsRes, usageRes] = await Promise.all([
        api.get('/documents', { params: { page: 1, limit: 50 } }),
        api.get('/user/usage'),
      ])
      setDocuments(docsRes.data.items || [])
      setUsage(usageRes.data)
    } catch (e) {
      console.error('Reload error:', e)
    }
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      await api.put('/user/profile', profileForm)
      toast.success('Профиль обновлен')
      setEditMode(false)
      window.location.reload()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка сохранения')
    } finally {
      setSavingProfile(false)
    }
  }
  
  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Пароли не совпадают')
      return
    }
    setChangingPassword(true)
    try {
      await api.post('/user/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      })
      toast.success('Пароль изменен')
      setShowPasswordForm(false)
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка смены пароля')
    } finally {
      setChangingPassword(false)
    }
  }

  const currentPlan = usage?.plan?.toLowerCase() || 'free'
  
  // Fix data paths: API returns flattened structure
  const docLimit = usage?.limits?.documents || usage?.documents
  const contractLimit = usage?.limits?.contracts || usage?.contracts

  const docPercent = docLimit ? (docLimit.max === -1 ? 100 : Math.min((docLimit.used / Math.max(docLimit.max, 1)) * 100, 100)) : 0
  const contractPercent = contractLimit ? (contractLimit.max === -1 ? 100 : Math.min((contractLimit.used / Math.max(contractLimit.max, 1)) * 100, 100)) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#0A84FF] animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 font-sans px-2 sm:px-0">
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} resource="documents" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-white">Профиль</h1>
          <p className="text-white/40 font-medium">Управление вашим аккаунтом и подпиской</p>
        </div>
        <div className="flex items-center gap-3">
           <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border ${
            currentPlan === 'pro' ? 'bg-[#0A84FF]/10 text-[#0A84FF] border-[#0A84FF]/20' :
            currentPlan === 'business' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
            currentPlan === 'enterprise' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none' :
            'bg-white/5 text-white/30 border-white/10'
          }`}>
            Тариф: {currentPlan === 'free' ? 'Бесплатный' : currentPlan === 'pro' ? 'Pro' : currentPlan === 'business' ? 'Бизнес' : 'Корпоративный'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User & Security */}
        <div className="lg:col-span-2 space-y-8">
          {/* User Card */}
          <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-[30px] bg-gradient-to-br from-[#0A84FF] to-[#5E5CE6] flex items-center justify-center border border-white/20 shadow-2xl">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white truncate max-w-[200px] sm:max-w-md">{user?.full_name || 'Пользователь'}</h2>
                  <p className="text-white/40 font-medium truncate max-w-[200px] sm:max-w-md">{user?.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditMode(!editMode)}
                className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-90"
              >
                {editMode ? <X className="w-5 h-5 text-white/50" /> : <Edit2 className="w-5 h-5 text-[#0A84FF]" />}
              </button>
            </div>

            {editMode ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-white/30 px-1">ФИО</label>
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-[#0A84FF]/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-white/30 px-1">Телефон</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-[#0A84FF]/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-white/30 px-1">Компания</label>
                    <input
                      type="text"
                      value={profileForm.company_name}
                      onChange={(e) => setProfileForm({...profileForm, company_name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-[#0A84FF]/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-white/30 px-1">ИНН</label>
                    <input
                      type="text"
                      value={profileForm.company_inn}
                      onChange={(e) => setProfileForm({...profileForm, company_inn: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-[#0A84FF]/50 transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="px-8 py-3.5 bg-[#0A84FF] text-white rounded-2xl font-black text-sm hover:bg-[#007AFF] transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    <Save className="w-4 h-4" />
                    Сохранить изменения
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] font-black uppercase text-white/20 mb-1">Документов</p>
                  <p className="text-xl font-bold text-white">{documents.length}</p>
                </div>
                <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] font-black uppercase text-white/20 mb-1">Статус</p>
                  <p className="text-xl font-bold text-green-400">Active</p>
                </div>
              </div>
            )}
          </div>

          {/* Security & Password */}
          <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white">Безопасность</h2>
              </div>
              <button 
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-xs font-black uppercase tracking-widest text-[#0A84FF] hover:text-white transition-colors"
              >
                {showPasswordForm ? 'Закрыть' : 'Сменить пароль'}
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handleChangePassword} className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <input
                  type="password"
                  placeholder="Текущий пароль"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50"
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="password"
                    placeholder="Новый пароль"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Повторите пароль"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10"
                >
                  {changingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Обновить пароль'}
                </button>
              </form>
            )}

            <div className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white/30" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-white/20">Ваша почта</p>
                  <p className="text-sm font-bold text-white/80">{user?.email}</p>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500/50" />
            </div>
          </div>
        </div>

        {/* Right Column: Subscription & Limits */}
        <div className="space-y-8">
          {/* Subscription Card */}
          <div 
            className={`
              p-8 rounded-[40px] border transition-all duration-500 relative overflow-hidden
              ${currentPlan === 'pro' ? 'bg-[#0A84FF]/5 border-[#0A84FF]/30' : 
                currentPlan === 'business' ? 'bg-amber-500/5 border-amber-500/30' : 
                'bg-white/[0.02] border-white/5'}
            `}
          >
            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 ${
              currentPlan === 'pro' ? 'bg-[#0A84FF]' : 
              currentPlan === 'business' ? 'bg-amber-500' : 
              'bg-white'
            }`}></div>

            <div className="flex items-center gap-4 mb-8">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                currentPlan === 'pro' ? 'bg-[#0A84FF]/20 text-[#0A84FF]' : 
                currentPlan === 'business' ? 'bg-amber-500/20 text-amber-500' : 
                'bg-white/10 text-white/30'
              }`}>
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Подписка</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Laxly Law Premium</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-[10px] font-black uppercase text-white/20 mb-1">Текущий план</p>
              <h3 className="text-3xl font-black text-white uppercase italic">
                {currentPlan === 'free' ? 'Free' : currentPlan === 'pro' ? 'Pro' : currentPlan === 'business' ? 'Business' : 'Corporate'}
              </h3>
            </div>

            <div className="space-y-5 mb-8">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-white/40">Документы</span>
                  <span className="text-white/80">{docLimit?.used || 0} / {docLimit?.max === -1 ? '∞' : docLimit?.max || 2}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${currentPlan === 'business' ? 'bg-amber-500' : 'bg-[#0A84FF]'}`} 
                    style={{ width: `${docPercent}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-white/40">Договоры</span>
                  <span className="text-white/80">{contractLimit?.used || 0} / {contractLimit?.max === -1 ? '∞' : contractLimit?.max || 1}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${currentPlan === 'business' ? 'bg-amber-500' : 'bg-[#0A84FF]'}`} 
                    style={{ width: `${contractPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <Link
              to="/dashboard/subscription"
              className={`w-full py-4 rounded-[22px] font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                currentPlan === 'free' ? 'bg-[#0A84FF] text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02]' : 
                'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              {currentPlan === 'free' ? 'Улучшить тариф' : 'Управление'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <ActivationCodeSection onActivated={reloadData} />
        </div>
      </div>

      {/* Documents History */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-bold text-white">Мои документы</h2>
          <Link to="/dashboard/documents" className="text-xs font-black uppercase tracking-widest text-[#0A84FF] hover:underline">Все файлы →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.length === 0 ? (
            <div className="col-span-full p-12 text-center rounded-[40px] bg-white/[0.01] border border-white/5">
              <FileText className="w-12 h-12 mx-auto mb-4 text-white/10" />
              <p className="text-white/30 font-medium italic">Вы еще не создали ни одного документа</p>
            </div>
          ) : (
            documents.slice(0, 4).map((doc) => (
              <div key={doc.id} className="group p-5 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-[#0A84FF]/30 transition-all duration-500 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[20px] bg-white/5 flex items-center justify-center group-hover:bg-[#0A84FF]/10 transition-colors">
                    <FileText className="w-5 h-5 text-white/30 group-hover:text-[#0A84FF]" />
                  </div>
                  <div>
                    <p className="font-bold text-white/80 capitalize">{doc.document_type === 'claim' ? 'Иск' : doc.document_type === 'complaint' ? 'Жалоба' : 'Претензия'}</p>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{new Date(doc.created_at).toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>
                <Link to="/dashboard/documents" className="p-3 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-all active:scale-90">
                  <ExternalLink className="w-4 h-4 text-[#0A84FF]" />
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
        <Link to="/privacy" className="group p-8 rounded-[40px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.03] transition-all">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-[22px] bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Конфиденциальность</h3>
              <p className="text-sm text-white/40 font-medium">Как мы защищаем ваши данные по ФЗ-152</p>
            </div>
          </div>
        </Link>
        <Link to="/terms" className="group p-8 rounded-[40px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.03] transition-all">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-[22px] bg-[#0A84FF]/10 flex items-center justify-center text-[#0A84FF] group-hover:scale-110 transition-transform">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Условия использования</h3>
              <p className="text-sm text-white/40 font-medium">Публичная оферта и правила сервиса</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
