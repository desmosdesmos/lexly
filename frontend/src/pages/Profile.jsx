import { useState, useEffect } from 'react'
import { User, FileText, CreditCard, Shield, Clock, CheckCircle, ExternalLink, MessageSquare, Crown, AlertTriangle, ArrowRight, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { PaywallModal } from '../components/ui/PaywallModal'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export function Profile() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPaywall, setShowPaywall] = useState(false)

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
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center border border-white/10">
              <User className="w-8 h-8 text-white/70" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.full_name || 'Пользователь'}</h2>
              <p className="text-white/50">{user?.email || '—'}</p>
            </div>
            <div className="ml-auto">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                currentPlan === 'pro' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20' :
                currentPlan === 'business' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/20' :
                'bg-white/5 text-white/40 border border-white/10'
              }`}>
                {currentPlan === 'free' ? 'Бесплатный' : currentPlan === 'pro' ? 'Pro' : 'Бизнес'}
              </span>
            </div>
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
                <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm capitalize">
                        {doc.document_type === 'claim' ? 'Исковое заявление' : doc.document_type === 'complaint' ? 'Жалоба' : 'Претензия'}
                      </p>
                      <p className="text-xs text-white/40 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(doc.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-lg bg-green-500/10 text-green-400 flex items-center gap-1">
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

      {/* Plans */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            Тарифы
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-5 rounded-xl bg-gradient-to-br ${plan.color} border ${plan.border} ${
                  plan.id === currentPlan ? 'ring-2 ring-indigo-500/30' : ''
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2 right-3 text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium">
                    {plan.badge}
                  </span>
                )}
                {plan.id === currentPlan && (
                  <span className="absolute -top-2 left-3 text-xs px-2 py-0.5 rounded-full bg-indigo-500 text-white font-medium">
                    Текущий
                  </span>
                )}
                <h3 className="font-semibold mb-1">{plan.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  {plan.oldPrice && (
                    <span className="text-sm text-white/30 line-through">{plan.oldPrice}</span>
                  )}
                  <span className="text-xl font-bold">{plan.price}</span>
                </div>
                {plan.id === 'pro' && (
                  <p className="text-xs text-green-400 mb-3">✨ Цена для первых пользователей — навсегда</p>
                )}
                <ul className="space-y-1.5 text-sm text-white/50">
                  <li className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {plan.documents}</li>
                  <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> {plan.contracts}</li>
                  <li className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> {plan.ai}</li>
                </ul>
                {plan.id !== currentPlan && (
                  <button
                    onClick={() => setShowPaywall(true)}
                    className="mt-4 w-full btn-secondary text-sm"
                  >
                    {plan.id === 'free' ? 'Текущий' : 'Перейти'}
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-white/30 mt-4 leading-relaxed">
            Лимиты обновляются ежемесячно. При превышении — функции недоступны до следующего периода.
            AI-консультант на бесплатном тарифе: 3 вопроса/день.
            На тарифе Pro — безлимит (soft limit 300k токенов/мес).
          </p>
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
