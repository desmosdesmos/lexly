import { Link } from 'react-router-dom'
import { FileText, Shield, Scale, TrendingUp, ArrowRight, Clock, CheckCircle, MessageSquare, Sparkles, ChevronRight, AlertTriangle } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import api from '../services/api'

export function DashboardHome() {
  const { user } = useAuth()
  const [usage, setUsage] = useState(null)
  const [recentDocs, setRecentDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUsage = async () => {
      try {
        const [usageData, docsData] = await Promise.all([
          api.get('/user/usage'),
          api.get('/documents', { params: { page: 1, limit: 5 } }).catch(() => ({ data: { items: [] } }))
        ])
        setUsage(usageData)
        setRecentDocs(docsData.data.items || [])
      } catch (error) {
        console.error('Failed to load usage:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUsage()
  }, [])

  const quickActions = [
    { icon: FileText, title: 'Документы', desc: 'Иски, жалобы, претензии', link: '/dashboard/documents' },
    { icon: Shield, title: 'Договоры', desc: 'Проверка на риски', link: '/dashboard/contracts' },
    { icon: MessageSquare, title: 'AI-консультант', desc: 'Вопросы по законодательству', link: '/dashboard/consultant' },
    { icon: Scale, title: 'Судебная практика', desc: 'Поиск и анализ дел', link: '/dashboard/case-law' },
    { icon: TrendingUp, title: 'Мониторинг', desc: 'Изменения в законах', link: '/dashboard/monitoring' },
  ]

  const docPercent = usage?.limits?.documents?.max > 0
    ? Math.min((usage.limits.documents.used / usage.limits.documents.max) * 100, 100)
    : 0
  const contractPercent = usage?.limits?.contracts?.max > 0
    ? Math.min((usage.limits.contracts.used / usage.limits.contracts.max) * 100, 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold mb-1">
          {user?.full_name?.split(' ')[0] ? `Здравствуйте, ${user.full_name.split(' ')[0]}` : 'Добро пожаловать'}
        </h1>
        <p className="text-white/40">Чем можем помочь сегодня?</p>
      </div>

      {/* Usage */}
      {usage && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardBody className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm text-white/50">Документы</span>
                <span className="text-base sm:text-lg font-semibold">
                  {usage.limits?.documents?.used || 0}
                  <span className="text-white/30 text-xs sm:text-sm"> / {usage.limits?.documents?.max === -1 ? '∞' : usage.limits?.documents?.max || 2}</span>
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white/30 rounded-full transition-all" style={{ width: `${docPercent}%` }}></div>
              </div>
              {docPercent >= 100 && (
                <p className="text-[10px] sm:text-xs text-red-400 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Лимит исчерпан
                </p>
              )}
              {docPercent >= 80 && docPercent < 100 && (
                <p className="text-[10px] sm:text-xs text-yellow-400 mt-2">⚠ Осталось {usage.limits?.documents?.remaining || 0}</p>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm text-white/50">Проверки договоров</span>
                <span className="text-base sm:text-lg font-semibold">
                  {usage.limits?.contracts?.used || 0}
                  <span className="text-white/30 text-xs sm:text-sm"> / {usage.limits?.contracts?.max === -1 ? '∞' : usage.limits?.contracts?.max || 1}</span>
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white/30 rounded-full transition-all" style={{ width: `${contractPercent}%` }}></div>
              </div>
              {contractPercent >= 100 && (
                <p className="text-[10px] sm:text-xs text-red-400 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Лимит исчерпан
                </p>
              )}
              {contractPercent >= 80 && contractPercent < 100 && (
                <p className="text-[10px] sm:text-xs text-yellow-400 mt-2">⚠ Осталось {usage.limits?.contracts?.remaining || 0}</p>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm text-white/50">Тариф</span>
              </div>
              <div className="text-base sm:text-lg font-semibold capitalize">
                {usage.plan === 'free' ? 'Бесплатный' : usage.plan === 'pro' ? 'Pro' : 'Бизнес'}
              </div>
              <Link to="/dashboard/profile" className="text-[10px] sm:text-xs text-white/40 hover:text-white/60 mt-2 inline-flex items-center gap-1">
                Управление подпиской <ChevronRight className="w-3 h-3" />
              </Link>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action, i) => (
            <Link key={i} to={action.link}>
              <Card hover className="group">
                <CardBody className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                      <action.icon className="w-5 h-5 text-white/50 group-hover:text-white/70 transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm mb-0.5">{action.title}</h3>
                      <p className="text-xs text-white/30">{action.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-white/30 ml-auto transition-colors" />
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-white/40 leading-relaxed">
          Сервис не является юридической консультацией. Результаты носят информационный характер
          и не заменяют консультацию юриста. Перед использованием документов рекомендуется проверка.
        </p>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Clock className="w-5 h-5 text-white/30" />
            Недавняя активность
          </h2>
        </CardHeader>
        <CardBody>
          {recentDocs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-10 h-10 mx-auto mb-3 text-white/10" />
              <p className="text-white/30 text-sm">История пуста</p>
              <p className="text-white/20 text-xs mt-1">Ваши действия будут отображаться здесь</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {doc.document_type === 'claim' ? 'Исковое заявление' :
                         doc.document_type === 'complaint' ? 'Жалоба' :
                         doc.document_type === 'demand' ? 'Досудебная претензия' :
                         doc.document_type}
                      </p>
                      <p className="text-xs text-white/40 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(doc.created_at).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
              ))}
              {recentDocs.length >= 5 && (
                <Link to="/dashboard/documents" className="block text-center text-sm text-indigo-400 hover:underline py-2">
                  Все документы →
                </Link>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
