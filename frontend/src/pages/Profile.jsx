import { useState, useEffect } from 'react'
import { User, FileText, CreditCard, Shield, Clock, CheckCircle, ExternalLink, MessageSquare, Crown, AlertTriangle, ArrowRight, Zap, Edit2, Lock, Save, X, Phone, Building, Mail, KeyRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { PaywallModal } from '../components/ui/PaywallModal'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import api from '../services/api'

// Компонент активации подписки по коду
function ActivationCodeSection({ onActivated }) {
  const [code, setCode] = useState('')
  const [activating, setActivating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleActivate = async (e) => {
    e.preventDefault()
    if (!code.trim()) {
      toast.error('Введите код')
      return
    }

    setActivating(true)
    try {
      const token = localStorage.getItem('access_token')
      const res = await api.post('/payments/activate-code', { code: code.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success(res.data.message)
      setCode('')
      setShowForm(false)
      // Обновляем данные без перезагрузки
      if (onActivated) onActivated()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка активации')
    } finally {
      setActivating(false)
    }
  }
  
  if (!showForm) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            Активация подписки
          </h2>
        </CardHeader>
        <CardBody>
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <p className="text-sm font-medium">Активировать код</p>
                <p className="text-xs text-white/40">Введите код, полученный после оплаты</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/30" />
          </button>
        </CardBody>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-amber-400" />
          Активация подписки
        </h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleActivate} className="space-y-3">
          <div>
            <label className="block text-sm text-white/60 mb-1">Код активации</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX"
              maxLength={9}
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white text-center tracking-widest text-lg font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={activating}
              className="btn-primary flex items-center gap-2 flex-1 justify-center"
            >
              <KeyRound className="w-4 h-4" />
              {activating ? 'Активация...' : 'Активировать'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setCode('')
              }}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}

export function Profile() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPaywall, setShowPaywall] = useState(false)
  
  // Редактирование профиля
  const [editMode, setEditMode] = useState(false)
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    company_name: user?.company_name || '',
    company_inn: user?.company_inn || '',
  })
  const [savingProfile, setSavingProfile] = useState(false)
  
  // Смена пароля
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
        const token = localStorage.getItem('access_token')
        const [docsRes, usageRes] = await Promise.all([
          api.get('/documents', { params: { page: 1, limit: 50 }, headers: { Authorization: `Bearer ${token}` } }),
          api.get('/user/usage', { headers: { Authorization: `Bearer ${token}` } }),
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

  const reloadData = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const [docsRes, usageRes] = await Promise.all([
        api.get('/documents', { params: { page: 1, limit: 50 }, headers: { Authorization: `Bearer ${token}` } }),
        api.get('/user/usage', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      setDocuments(docsRes.data.items || [])
      setUsage(usageRes.data)
    } catch (e) {
      console.error('Reload error:', e)
    }
  }
  
  // Инициализация формы при включении редактирования
  useEffect(() => {
    if (editMode && user) {
      setProfileForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        company_name: user.company_name || '',
        company_inn: user.company_inn || '',
      })
    }
  }, [editMode, user])
  
  // Сохранение профиля
  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const token = localStorage.getItem('access_token')
      await api.put('/user/profile', profileForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Профиль обновлен')
      setEditMode(false)
      // Обновляем данные в localStorage если нужно
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка сохранения')
    } finally {
      setSavingProfile(false)
    }
  }
  
  // Смена пароля
  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Пароли не совпадают')
      return
    }
    
    if (passwordForm.new_password.length < 8) {
      toast.error('Пароль минимум 8 символов')
      return
    }
    
    setChangingPassword(true)
    try {
      const token = localStorage.getItem('access_token')
      await api.post('/user/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      }, {
        headers: { Authorization: `Bearer ${token}` }
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

  const plans = [
    {
      id: 'free', name: 'Бесплатный', price: '0 ₽/мес',
      documents: '2 документа', contracts: '1 проверка', ai: '3 вопроса/день',
      color: 'from-gray-500/20 to-gray-600/20', border: 'border-gray-500/20',
    },
    {
      id: 'pro', name: 'Pro', price: '690 ₽/мес', oldPrice: '990 ₽/мес',
      documents: '50 документов', contracts: '15 проверок', ai: 'Безлимит',
      color: 'from-indigo-500/20 to-purple-500/20', border: 'border-indigo-500/20',
      badge: 'Популярный',
    },
    {
      id: 'business', name: 'Бизнес', price: '2 990 ₽/мес', oldPrice: '4 990 ₽/мес',
      documents: 'Безлимит', contracts: 'Безлимит', ai: 'Безлимит + API',
      color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/20',
    },
  ]

  const currentPlan = usage?.plan || 'free'
  const docPercent = usage?.limits?.documents ? Math.min((usage.limits.documents.used / Math.max(usage.limits.documents.max, 1)) * 100, 100) : 0
  const contractPercent = usage?.limits?.contracts ? Math.min((usage.limits.contracts.used / Math.max(usage.limits.contracts.max, 1)) * 100, 100) : 0

  return (
    <div className="space-y-6">
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} resource="documents" />

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <User className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-semibold">Профиль</h1>
        </div>
        <p className="text-white/50">Управление аккаунтом, подпиской и документами</p>
      </div>

      {/* User Info */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center border border-white/10 flex-shrink-0">
                <User className="w-8 h-8 text-white/70" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold truncate">{user?.full_name || 'Пользователь'}</h2>
                <p className="text-white/50 truncate">{user?.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium capitalize ${
                currentPlan === 'pro' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20' :
                currentPlan === 'business' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/20' :
                currentPlan === 'basic' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/20' :
                'bg-white/5 text-white/40 border border-white/10'
              }`}>
                {currentPlan === 'free' ? 'Бесплатный' : 
                 currentPlan === 'basic' ? 'Базовый' : 
                 currentPlan === 'pro' ? 'Pro' : 
                 currentPlan === 'business' ? 'Бизнес' : currentPlan}
              </span>
              <button
                onClick={() => setEditMode(!editMode)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                {editMode ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {/* Форма редактирования */}
          {editMode && (
            <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Редактировать профиль
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Имя *</label>
                  <input
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Телефон
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    placeholder="+7 (999) 123-45-67"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1 flex items-center gap-1">
                    <Building className="w-3 h-3" /> Компания
                  </label>
                  <input
                    type="text"
                    value={profileForm.company_name}
                    onChange={(e) => setProfileForm({...profileForm, company_name: e.target.value})}
                    placeholder="ООО Ромашка"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">ИНН</label>
                  <input
                    type="text"
                    value={profileForm.company_inn}
                    onChange={(e) => setProfileForm({...profileForm, company_inn: e.target.value})}
                    placeholder="1234567890"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {savingProfile ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Безопасность */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            Безопасность
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {/* Email */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <Mail className="w-5 h-5 text-white/40" />
              <div className="flex-1">
                <p className="text-sm text-white/60">Email</p>
                <p className="text-sm">{user?.email}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            
            {/* Смена пароля */}
            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-white/40" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Сменить пароль</p>
                    <p className="text-xs text-white/40">Обновите пароль для безопасности</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-white/30" />
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="p-4 rounded-xl bg-white/5 space-y-3">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Текущий пароль</label>
                  <input
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                    required
                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Новый пароль</label>
                  <input
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                    required
                    minLength={8}
                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Подтвердите пароль</label>
                  <input
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                    required
                    minLength={8}
                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    <Lock className="w-4 h-4" />
                    {changingPassword ? 'Сохранение...' : 'Сохранить пароль'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false)
                      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
                    }}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Моя подписка */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            Моя подписка
          </h2>
        </CardHeader>
        <CardBody>
          {/* Текущий тариф */}
          <div className={`p-5 rounded-xl bg-gradient-to-br ${
            currentPlan === 'pro' ? 'from-indigo-500/20 to-purple-500/20 border border-indigo-500/30' :
            currentPlan === 'business' || currentPlan === 'enterprise' ? 'from-amber-500/20 to-orange-500/20 border border-amber-500/30' :
            'from-white/5 to-white/10 border border-white/10'
          } mb-6`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-white/50">Текущий тариф</p>
                <h3 className="text-2xl font-bold capitalize">
                  {currentPlan === 'free' ? 'Бесплатный' :
                   currentPlan === 'basic' ? 'Базовый' :
                   currentPlan === 'pro' ? 'Pro' :
                   currentPlan === 'business' ? 'Бизнес' : currentPlan}
                </h3>
              </div>
              <Crown className={`w-12 h-12 ${
                currentPlan === 'pro' ? 'text-indigo-400' :
                currentPlan === 'business' || currentPlan === 'enterprise' ? 'text-amber-400' :
                'text-white/20'
              }`} />
            </div>

            {/* Дата окончания подписки */}
            {usage?.subscription_end && (
              <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                <Clock className="w-4 h-4" />
                <span>Действует до: <strong>{new Date(usage.subscription_end).toLocaleDateString('ru-RU')}</strong></span>
              </div>
            )}
          </div>

          {/* Кнопки действий */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <a
              href="/dashboard/subscription"
              className="flex items-center justify-center gap-2 p-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
            >
              <Crown className="w-5 h-5" />
              {currentPlan === 'free' ? 'Выбрать тариф' : 'Сменить тариф'}
            </a>
            <a
              href="https://t.me/yanvtg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[#0088cc] hover:bg-[#0077b3] text-white font-medium transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              Написать в Telegram
            </a>
          </div>

          {/* Контакт для оплаты */}
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-300 mb-1">💬 Оплата через Telegram:</p>
            <a
              href="https://t.me/yanvtg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              @yanvtg
            </a>
          </div>
        </CardBody>
      </Card>

      {/* Usage & Limits */}
      {usage && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              Использование и лимиты
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Documents */}
              <div className="p-4 rounded-xl bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">Документы</span>
                  <span className="text-sm font-medium">
                    {usage.limits?.documents?.used || 0} / {usage.limits?.documents?.max === -1 ? '∞' : usage.limits?.documents?.max || 2}
                  </span>
                </div>
                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${docPercent}%` }}></div>
                </div>
                {docPercent >= 100 && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Лимит исчерпан
                  </p>
                )}
                {docPercent >= 80 && docPercent < 100 && (
                  <p className="text-xs text-yellow-400">⚠ Использовано 80%+</p>
                )}
                {docPercent < 80 && usage.limits?.documents?.max !== -1 && (
                  <p className="text-xs text-white/30">
                    Осталось: {usage.limits?.documents?.remaining || 0}
                  </p>
                )}
              </div>

              {/* Contracts */}
              <div className="p-4 rounded-xl bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">Проверки договоров</span>
                  <span className="text-sm font-medium">
                    {usage.limits?.contracts?.used || 0} / {usage.limits?.contracts?.max === -1 ? '∞' : usage.limits?.contracts?.max || 1}
                  </span>
                </div>
                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500" style={{ width: `${contractPercent}%` }}></div>
                </div>
                {contractPercent >= 100 && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Лимит исчерпан
                  </p>
                )}
                {contractPercent >= 80 && contractPercent < 100 && (
                  <p className="text-xs text-yellow-400">⚠ Использовано 80%+</p>
                )}
                {contractPercent < 80 && usage.limits?.contracts?.max !== -1 && (
                  <p className="text-xs text-white/30">
                    Осталось: {usage.limits?.contracts?.remaining || 0}
                  </p>
                )}
              </div>
            </div>

            {currentPlan === 'free' && (
              <button
                onClick={() => setShowPaywall(true)}
                className="mt-4 btn-primary w-full flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5" />
                Разблокировать Pro — 690 ₽/мес
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </CardBody>
        </Card>
      )}

      {/* My Documents */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Мои документы
          </h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <p className="text-white/40 text-center py-8">Загрузка...</p>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-3 text-white/20" />
              <p className="text-white/40 mb-2">Документов пока нет</p>
              <Link to="/dashboard/documents" className="text-indigo-400 hover:underline text-sm">Создать первый документ →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm capitalize truncate">
                        {doc.document_type === 'claim' ? 'Исковое заявление' : doc.document_type === 'complaint' ? 'Жалоба' : 'Претензия'}
                      </p>
                      <p className="text-xs text-white/40 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(doc.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5 sm:border-none">
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-green-500/10 text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Готов
                    </span>
                    <Link to="/dashboard/documents" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                      Открыть <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Legal Links */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-white/40" />
            Правовая информация
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            <Link to="/privacy" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <Shield className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-sm font-medium">Политика конфиденциальности</p>
                <p className="text-xs text-white/40">ФЗ-152, обработка данных</p>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto text-white/30" />
            </Link>
            <Link to="/terms" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <FileText className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-sm font-medium">Пользовательское соглашение</p>
                <p className="text-xs text-white/40">Оферта, автопродление, Fair Use</p>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto text-white/30" />
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
