import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FileText, Shield, Scale, TrendingUp, ArrowRight, Clock, 
  CheckCircle, MessageSquare, Sparkles, ChevronRight, 
  AlertTriangle, Zap 
} from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'
import { DocumentViewerModal } from '../components/ui/DocumentViewerModal'

export function DashboardHome() {
  const { user } = useAuth()
  const [usage, setUsage] = useState(null)
  const [recentDocs, setRecentDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [fetchingDoc, setFetchingDoc] = useState(false)

  const handleView = async (doc) => {
    setFetchingDoc(true)
    try {
      const response = await api.get(`/documents/${doc.id}`)
      setSelectedDoc({ ...response.data, type: 'document' })
    } catch (error) {
      console.error('View error:', error)
      toast.error('Не удалось загрузить содержимое документа')
    } finally {
      setFetchingDoc(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    const loadUsage = async () => {
      try {
        const [usageRes, docsRes] = await Promise.all([
          api.get('/user/usage').catch(() => ({ data: null })),
          api.get('/documents', { params: { page: 1, limit: 5 } }).catch(() => ({ data: { items: [] } }))
        ])
        if (isMounted) {
          setUsage(usageRes?.data)
          setRecentDocs(docsRes?.data?.items || [])
        }
      } catch (error) {
        console.error('Failed to load dashboard:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadUsage()
    return () => { isMounted = false }
  }, [])

  const docPercent = usage?.limits?.documents?.max > 0
    ? Math.min((usage.limits.documents.used / usage.limits.documents.max) * 100, 100)
    : (usage?.limits?.documents?.max === -1 ? 100 : 0)
    
  const contractPercent = usage?.limits?.contracts?.max > 0
    ? Math.min((usage.limits.contracts.used / usage.limits.contracts.max) * 100, 100)
    : (usage?.limits?.contracts?.max === -1 ? 100 : 0)

  const getPlanLabel = (plan) => {
    if (!plan) return '—'
    const p = String(plan).toLowerCase()
    const names = {
      free: 'Бесплатный',
      pro: 'Pro',
      business: 'Бизнес',
      enterprise: 'Корпоративный'
    }
    return names[p] || plan
  }

  const quickActions = [
    { icon: FileText, title: 'Документы', desc: 'Иски, жалобы, претензии', link: '/dashboard/documents' },
    { icon: Shield, title: 'Договоры', desc: 'Проверка на риски', link: '/dashboard/contracts' },
    { icon: MessageSquare, title: 'AI-консультант', desc: 'Вопросы по законодательству', link: '/dashboard/consultant' },
    { icon: Scale, title: 'Судебная практика', desc: 'Поиск и анализ дел', link: '/dashboard/case-law' },
    { icon: TrendingUp, title: 'Мониторинг', desc: 'Изменения в законах', link: '/dashboard/monitoring' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold mb-1 text-white">
          {user?.full_name ? `Здравствуйте, ${user.full_name.split(' ')[0]}` : 'Добро пожаловать'}
        </h1>
        <p className="text-white/40">Чем можем помочь сегодня?</p>
      </div>

      {/* Usage Grid */}
      {usage && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardBody className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm text-white/50">Документы</span>
                <span className="text-base sm:text-lg font-semibold text-white">
                  {usage.limits?.documents?.used || 0}
                  <span className="text-white/20 text-xs sm:text-sm font-normal"> / {usage.limits?.documents?.max === -1 ? '∞' : (usage.limits?.documents?.max || 2)}</span>
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white/30 rounded-full transition-all duration-1000" style={{ width: `${docPercent}%` }}></div>
              </div>
              {docPercent >= 100 && usage.limits?.documents?.max !== -1 && (
                <p className="text-[10px] sm:text-xs text-red-400 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Лимит исчерпан
                </p>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm text-white/50">Проверки договоров</span>
                <span className="text-base sm:text-lg font-semibold text-white">
                  {usage.limits?.contracts?.used || 0}
                  <span className="text-white/30 text-xs sm:text-sm font-normal"> / {usage.limits?.contracts?.max === -1 ? '∞' : (usage.limits?.contracts?.max || 2)}</span>
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white/30 rounded-full transition-all duration-1000" style={{ width: `${contractPercent}%` }}></div>
              </div>
              {contractPercent >= 100 && usage.limits?.contracts?.max !== -1 && (
                <p className="text-[10px] sm:text-xs text-red-400 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Лимит исчерпан
                </p>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm text-white/50">Тариф</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Zap className="w-3.5 h-3.5 text-[#0A84FF]/60 flex-shrink-0" />
                <span className="text-base sm:text-lg font-semibold text-white tracking-tight">
                  {getPlanLabel(usage.plan)}
                </span>
              </div>
              <Link to="/dashboard/subscription" className="text-[10px] sm:text-xs text-white/30 hover:text-[#0A84FF] mt-2 inline-flex items-center gap-1 transition-colors">
                Управление подпиской <ChevronRight className="w-3 h-3" />
              </Link>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-white/80">Быстрые действия</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action, i) => (
            <Link key={i} to={action.link}>
              <Card hover className="group border-white/5 bg-white/[0.02]">
                <CardBody className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                      <action.icon className="w-5 h-5 text-white/40 group-hover:text-[#0A84FF] transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-white transition-colors">{action.title}</h3>
                      <p className="text-xs text-white/30 leading-tight mt-0.5">{action.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-white/40 ml-auto transition-all group-hover:translate-x-1" />
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
        <AlertTriangle className="w-5 h-5 text-amber-500/50 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-white/30 leading-relaxed font-medium italic">
          Сервис Laxly AI является вспомогательным инструментом. Результаты носят информационный характер и не заменяют профессиональную консультацию юриста. Перед использованием документов рекомендуется их проверка профильным специалистом.
        </p>
      </div>

      {/* Recent Activity */}
      <Card className="border-white/5 bg-white/[0.01]">
        <CardHeader className="pb-2">
          <h2 className="text-sm font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Недавняя активность
          </h2>
        </CardHeader>
        <CardBody>
          {recentDocs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                 <Clock className="w-6 h-6 text-white/10" />
              </div>
              <p className="text-white/20 text-sm font-medium uppercase tracking-widest">История операций пуста</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <div key={doc?.id || Math.random()} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group" onClick={() => handleView(doc)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-[#0A84FF] transition-all">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white/80 uppercase italic tracking-tight">
                        {doc?.document_type === 'claim' ? 'Исковое заявление' :
                         doc?.document_type === 'complaint' ? 'Жалоба' :
                         doc?.document_type === 'demand' ? 'Претензия' :
                         doc?.document_type === 'contract_sale' ? 'Договор купли-продажи' :
                         doc?.document_type === 'contract_employment' ? 'Трудовой договор' :
                         doc?.document_type === 'power_of_attorney' ? 'Доверенность' :
                         doc?.document_type || 'Документ'}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                         <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">{doc?.created_at ? new Date(doc.created_at).toLocaleDateString() : ''}</span>
                         <span className="text-[10px] text-green-500/40 font-black uppercase tracking-widest">Завершено</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/5 group-hover:text-white/20" />
                </div>
              ))}
              {recentDocs.length >= 5 && (
                <Link to="/dashboard/drive" className="block text-center text-[10px] font-black uppercase tracking-widest text-[#0A84FF] hover:underline py-4">
                  Открыть весь архив →
                </Link>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      <DocumentViewerModal 
        isOpen={!!selectedDoc} 
        onClose={() => setSelectedDoc(null)} 
        document={selectedDoc} 
      />
    </div>
  )
}
