import { useState } from 'react'
import {
  TrendingUp, Search, Loader2, AlertCircle, Calendar, FileText,
  Clock, ExternalLink, Sparkles, ShieldCheck, Zap, Globe, FileSearch,
  Info, Scale, BookOpen, AlertTriangle, ChevronRight, Building2
} from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { toast } from 'react-toastify'
import api from '../services/api'

const ExternalLinkComp = ({ href, children, className = '' }) => {
  if (!href) return <span className={className}>{children}</span>
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-[#0A84FF] hover:underline inline-flex items-center gap-1.5 font-bold transition-all ${className}`}
    >
      {children}
      <ExternalLink className="w-3 h-3 flex-shrink-0" />
    </a>
  )
}

const IMPACT_STYLES = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low: 'bg-green-500/10 text-green-400 border-green-500/20',
}

const IMPACT_LABELS = {
  high: 'Высокий приоритет',
  medium: 'Средний приоритет',
  low: 'Низкий приоритет',
}

const EXAMPLE_TOPICS = [
  'Трудовое право 2026',
  'Налоги и НДС',
  'Цифровые активы и криптовалюта',
  'ЖКХ и недвижимость',
  'Самозанятые и ИП',
  'Персональные данные',
]

const OFFICIAL_SOURCES = [
  { name: 'pravo.gov.ru', desc: 'Официальный портал правовой информации', url: 'http://publication.pravo.gov.ru', color: 'text-[#0A84FF]' },
  { name: 'kremlin.ru', desc: 'Указы Президента, ФЗ', url: 'http://kremlin.ru/acts', color: 'text-red-400' },
  { name: 'government.ru', desc: 'Постановления Правительства', url: 'http://government.ru/news', color: 'text-purple-400' },
  { name: 'duma.gov.ru', desc: 'Государственная Дума', url: 'http://duma.gov.ru/news', color: 'text-amber-400' },
  { name: 'nalog.gov.ru', desc: 'ФНС России', url: 'https://www.nalog.gov.ru', color: 'text-green-400' },
  { name: 'cbr.ru', desc: 'Банк России', url: 'https://cbr.ru', color: 'text-cyan-400' },
]

export function LawMonitoring() {
  const [topic, setTopic] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [monitorData, setMonitorData] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('monitor')

  const handleMonitor = async (e, topicOverride) => {
    e.preventDefault()
    const q = topicOverride !== undefined ? topicOverride : topic
    if (topicOverride !== undefined) setTopic(topicOverride)
    setLoading(true)
    setError(null)
    setMonitorData(null)
    try {
      const res = await api.post('/legislation/monitor', {
        topic: q.trim() || null,
      })
      setMonitorData(res.data)
      const count = res.data.sources_count || 0
      if (count > 0) {
        toast.success(`Обзор сформирован — загружено ${count} документов из официальных источников`)
      } else {
        toast.info('Обзор сформирован на основе AI-анализа')
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Ошибка мониторинга'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
      toast.error(typeof msg === 'string' ? msg : 'Ошибка мониторинга')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      toast.error('Введите запрос для поиска')
      return
    }
    setSearchLoading(true)
    setError(null)
    try {
      const res = await api.get('/legislation/search', {
        params: { query: searchQuery, limit: 20 },
      })
      setSearchResults(res.data.changes || [])
      const total = res.data.total || 0
      if (total === 0) {
        toast.info('По запросу ничего не найдено в официальных источниках')
      } else {
        toast.success(`Найдено ${total} документов`)
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Ошибка поиска'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
      toast.error(typeof msg === 'string' ? msg : 'Ошибка поиска')
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-2 sm:px-0">
      {/* Hero Section */}
      <div className="relative p-10 rounded-[50px] bg-gradient-to-br from-[#0A84FF]/10 to-transparent border border-white/5 overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0A84FF]/10 border border-[#0A84FF]/20 text-[#0A84FF] text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-3 h-3" /> Официальные источники
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight uppercase italic">
              Мониторинг <br /> <span className="text-[#0A84FF]">законов</span>
            </h1>
            <p className="text-white/40 text-lg font-medium leading-relaxed max-w-lg">
              Актуальные изменения законодательства из официальных источников: pravo.gov.ru, kremlin.ru, government.ru и других.
            </p>
            {/* Official sources badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              {OFFICIAL_SOURCES.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all"
                  title={s.desc}
                >
                  <span className={`text-[10px] font-black ${s.color}`}>{s.name}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="p-6 rounded-[30px] bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                <Calendar className="w-6 h-6 text-[#0A84FF] mb-3" />
                <div className="text-xl font-black text-white">Сроки</div>
                <div className="text-xs text-white/30">Даты вступления в силу</div>
              </div>
              <div className="p-6 rounded-[30px] bg-white/[0.03] border border-white/5 backdrop-blur-sm translate-x-6">
                <ShieldCheck className="w-6 h-6 text-green-500 mb-3" />
                <div className="text-xl font-black text-white">Compliance</div>
                <div className="text-xs text-white/30">Соблюдение норм</div>
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="p-6 rounded-[30px] bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                <Building2 className="w-6 h-6 text-amber-500 mb-3" />
                <div className="text-xl font-black text-white">Органы</div>
                <div className="text-xs text-white/30">Президент, Правительство, ФНС</div>
              </div>
              <div className="p-6 rounded-[30px] bg-white/[0.03] border border-white/5 backdrop-blur-sm translate-x-6">
                <Globe className="w-6 h-6 text-purple-500 mb-3" />
                <div className="text-xl font-black text-white">РФ База</div>
                <div className="text-xs text-white/30">Вся Россия 24/7</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-8">
        <div className="flex p-1.5 bg-white/5 rounded-[22px] border border-white/5 backdrop-blur-md w-fit">
          <button
            onClick={() => setActiveTab('monitor')}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'monitor'
                ? 'bg-[#0A84FF] text-white shadow-[0_0_20px_rgba(10,132,255,0.3)]'
                : 'text-white/30 hover:text-white/60 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Обзор изменений
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'search'
                ? 'bg-[#0A84FF] text-white shadow-[0_0_20px_rgba(10,132,255,0.3)]'
                : 'text-white/30 hover:text-white/60 hover:bg-white/5'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" /> Поиск НПА
          </button>
        </div>

        {activeTab === 'monitor' ? (
          <div className="space-y-10">
            {/* Input */}
            <Card className="rounded-[40px] border-white/5 bg-white/[0.02] overflow-hidden shadow-2xl">
              <CardBody className="p-8 sm:p-12">
                <form onSubmit={handleMonitor} className="max-w-3xl mx-auto space-y-6 text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">За какими законами следим?</h2>
                  <p className="text-white/30 text-sm mb-4">
                    Укажите отрасль или тему — или оставьте пустым для общего обзора.<br />
                    Данные поступают из официальных государственных источников.
                  </p>
                  <div className="relative group">
                    <Input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Напр: трудовое право, налоги, ЖКХ, самозанятые..."
                      className="bg-white/5 border-white/10 rounded-[30px] h-20 px-8 text-xl focus:border-[#0A84FF]/50 transition-all text-center"
                    />
                  </div>

                  {/* Quick examples */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {EXAMPLE_TOPICS.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={(e) => handleMonitor(e, ex)}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-[#0A84FF]/10 border border-white/5 hover:border-[#0A84FF]/20 text-[11px] font-bold text-white/40 hover:text-[#0A84FF] transition-all"
                      >
                        {ex}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={(e) => handleMonitor(e, '')}
                      className="px-4 py-2 rounded-xl bg-[#0A84FF]/5 hover:bg-[#0A84FF]/15 border border-[#0A84FF]/10 text-[11px] font-bold text-[#0A84FF]/60 hover:text-[#0A84FF] transition-all"
                    >
                      Общий обзор
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-16 px-12 rounded-[25px] font-black uppercase tracking-widest text-sm gap-3 shadow-[0_0_40px_rgba(10,132,255,0.2)] mx-auto"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                    {loading ? 'Загружаю из официальных источников...' : 'Сформировать обзор'}
                  </Button>
                </form>
              </CardBody>
            </Card>

            {/* Error */}
            {error && (
              <div className="p-6 rounded-[30px] bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-400">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Results */}
            {monitorData && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-10">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-[30px] bg-white/[0.02] border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#0A84FF]/10 flex items-center justify-center text-[#0A84FF]">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Дата отчёта</div>
                      <div className="text-lg font-bold text-white">
                        {monitorData.report_date
                          ? new Date(monitorData.report_date).toLocaleDateString('ru-RU')
                          : 'Сегодня'}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-[30px] bg-white/[0.02] border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Актов проанализировано</div>
                      <div className="text-lg font-bold text-white">{monitorData.total_changes || monitorData.changes?.length || 0}</div>
                    </div>
                  </div>
                  <div className="p-6 rounded-[30px] bg-white/[0.02] border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                      <Scale className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Источников</div>
                      <div className="text-lg font-bold text-white truncate max-w-[150px]">
                        {monitorData.sources_count > 0
                          ? `${monitorData.sources_count} документов`
                          : monitorData.topic || 'Общий'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <Card className="rounded-[40px] border-[#0A84FF]/20 bg-gradient-to-br from-[#0A84FF]/5 to-transparent">
                  <CardHeader className="p-8 pb-4">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-widest flex items-center gap-3">
                      <Info className="w-6 h-6 text-[#0A84FF]" /> Аналитический обзор
                    </h3>
                  </CardHeader>
                  <CardBody className="p-8 pt-0 space-y-6">
                    <p className="text-white/70 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                      {typeof monitorData.summary === 'string'
                        ? monitorData.summary
                        : 'Обзор успешно сформирован. Изучите детали ниже.'}
                    </p>

                    {/* Grounding sources */}
                    {monitorData.grounding_sources && monitorData.grounding_sources.length > 0 && (
                      <div className="pt-6 border-t border-white/5 space-y-4">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                          Документы из официальных источников ({monitorData.grounding_sources.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {monitorData.grounding_sources.map((src, i) => (
                            src.url ? (
                              <a
                                key={i}
                                href={src.url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-bold text-white/50 hover:text-white transition-all max-w-[280px] truncate"
                                title={src.title}
                              >
                                {src.title || src.url}
                              </a>
                            ) : (
                              <span
                                key={i}
                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold text-white/30 max-w-[280px] truncate"
                              >
                                {src.title}
                              </span>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>

                {/* Changes list */}
                {monitorData.changes && monitorData.changes.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-widest flex items-center gap-3 ml-2">
                      <FileSearch className="w-7 h-7 text-[#0A84FF]" /> Изменения законодательства
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      {monitorData.changes.map((ch, i) => {
                        const lvl = ch.impact_level?.toLowerCase() || 'low'
                        return (
                          <div key={i} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${IMPACT_STYLES[lvl] || IMPACT_STYLES.low}`}>
                                {IMPACT_LABELS[lvl] || lvl}
                              </span>
                              {ch.effective_date && ch.effective_date !== 'null' && (
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                                  <Calendar className="w-3 h-3" />
                                  {ch.effective_date}
                                </span>
                              )}
                              {ch.authority && (
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                                  <Building2 className="w-3 h-3" />
                                  {ch.authority}
                                </span>
                              )}
                              {ch.source && (
                                <span className="px-2 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[9px] font-black text-white/20 uppercase tracking-widest">
                                  {ch.source}
                                </span>
                              )}
                            </div>

                            <h4 className="text-xl font-bold text-white mb-3 group-hover:text-[#0A84FF] transition-colors leading-snug">
                              {ch.title || 'Нормативный акт'}
                            </h4>
                            {ch.law_number && (
                              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-3">
                                № {ch.law_number}
                              </p>
                            )}
                            <p className="text-white/50 text-sm leading-relaxed mb-6 font-medium">{ch.description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                              {ch.impact && (
                                <div className="p-5 rounded-3xl bg-black/20 border border-white/5">
                                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3 text-amber-500" /> Суть влияния
                                  </p>
                                  <p className="text-xs text-white/70 font-medium leading-relaxed">{ch.impact}</p>
                                </div>
                              )}
                              {ch.recommendations && (
                                <div className="p-5 rounded-3xl bg-[#0A84FF]/5 border border-[#0A84FF]/10">
                                  <p className="text-[10px] font-black text-[#0A84FF] uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <ShieldCheck className="w-3 h-3" /> Что нужно сделать
                                  </p>
                                  <p className="text-xs text-white/70 font-medium leading-relaxed">{ch.recommendations}</p>
                                </div>
                              )}
                            </div>

                            {ch.url && ch.url !== 'null' && ch.url !== 'None' && (
                              <ExternalLinkComp href={ch.url} className="text-[11px] uppercase tracking-widest">
                                Читать первоисточник
                              </ExternalLinkComp>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* No changes message */}
                {(!monitorData.changes || monitorData.changes.length === 0) && (
                  <div className="p-8 rounded-[35px] bg-white/[0.02] border border-white/5 text-center space-y-4">
                    <Info className="w-10 h-10 text-white/20 mx-auto" />
                    <p className="text-white/40 font-medium">Список конкретных документов временно не загружен.</p>
                    <p className="text-white/20 text-sm">Проверьте официальные источники напрямую:</p>
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                      {OFFICIAL_SOURCES.map(s => (
                        <a key={s.name} href={s.url} target="_blank" rel="noreferrer"
                          className={`text-[11px] font-black uppercase tracking-widest ${s.color} hover:opacity-80 inline-flex items-center gap-1`}>
                          {s.name} <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming */}
                {monitorData.upcoming_changes?.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-widest flex items-center gap-3 ml-2">
                      <Clock className="w-7 h-7 text-amber-500" /> Готовятся к вступлению
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {monitorData.upcoming_changes.map((ch, i) => (
                        <div key={i} className="p-6 rounded-[30px] bg-amber-500/5 border border-amber-500/10 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              {ch.expected_date && ch.expected_date !== 'null' && (
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                                  Ожидается: {ch.expected_date}
                                </span>
                              )}
                              {ch.url && ch.url !== 'null' && (
                                <ExternalLinkComp href={ch.url} />
                              )}
                            </div>
                            <h5 className="font-bold text-white">{ch.title}</h5>
                            <p className="text-xs text-white/40 leading-relaxed">{ch.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Official sources block */}
                <div className="p-8 rounded-[35px] bg-white/[0.01] border border-white/5">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Официальные источники</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {OFFICIAL_SOURCES.map(s => (
                      <a
                        key={s.name}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
                      >
                        <div className={`text-[11px] font-black ${s.color} mb-1`}>{s.name}</div>
                        <div className="text-[10px] text-white/20">{s.desc}</div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="p-5 rounded-[25px] bg-white/[0.01] border border-white/5">
                  <p className="text-[10px] text-white/20 font-medium leading-relaxed">
                    ⚠️ Аналитика формируется на основе данных официальных государственных источников и знаний AI.
                    Для получения юридически значимой информации используйте первоисточники выше.
                    Данный обзор не является официальной правовой позицией.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Search Tab */
          <div className="space-y-8 animate-in fade-in duration-500">
            <Card className="rounded-[40px] border-white/5 bg-white/[0.02] overflow-hidden">
              <CardBody className="p-8 sm:p-12">
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto space-y-6 text-center">
                  <h2 className="text-2xl font-bold text-white">Поиск НПА</h2>
                  <p className="text-white/30 text-sm">
                    Поиск по официальным документам из pravo.gov.ru, kremlin.ru, government.ru и других
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Напр: НДС 2026, трудовой договор, удалённая работа..."
                      className="bg-white/5 border-white/10 rounded-2xl h-16 px-6 text-lg focus:border-[#0A84FF]/50"
                    />
                    <Button type="submit" disabled={searchLoading} className="h-16 w-16 p-0 rounded-2xl flex-shrink-0">
                      {searchLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <Search className="w-6 h-6" />}
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>

            {searchResults.length === 0 && !searchLoading && searchQuery && (
              <div className="p-8 rounded-[35px] bg-white/[0.02] border border-white/5 text-center space-y-4">
                <FileSearch className="w-10 h-10 text-white/20 mx-auto" />
                <p className="text-white/40 font-medium">По запросу «{searchQuery}» ничего не найдено в загруженных данных.</p>
                <p className="text-white/20 text-sm">Попробуйте поиск на официальных ресурсах:</p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  {OFFICIAL_SOURCES.map(s => (
                    <a key={s.name} href={`${s.url}/search?q=${encodeURIComponent(searchQuery)}`}
                      target="_blank" rel="noreferrer"
                      className={`text-[11px] font-black uppercase tracking-widest ${s.color} hover:opacity-80 inline-flex items-center gap-1`}>
                      {s.name} <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.map((item, i) => (
                  <div key={i} className="p-8 rounded-[35px] bg-white/[0.01] border border-white/5 hover:border-[#0A84FF]/30 transition-all group flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="font-bold text-white text-lg leading-tight group-hover:text-[#0A84FF] transition-colors flex-1">
                        {item.title}
                      </h3>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noreferrer"
                          className="text-[#0A84FF] hover:opacity-70 transition-all flex-shrink-0 mt-1">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {item.date && (
                        <span className="text-[10px] font-black text-[#0A84FF] uppercase tracking-widest">
                          {item.date}
                        </span>
                      )}
                      {item.doc_type && (
                        <span className="px-2 py-0.5 rounded-lg bg-white/5 text-[9px] font-black text-white/30 uppercase tracking-widest">
                          {item.doc_type}
                        </span>
                      )}
                      {item.source && (
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                          {item.source}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-white/40 font-medium line-clamp-4 leading-relaxed flex-1">
                        {item.description}
                      </p>
                    )}
                    {item.authority && (
                      <p className="text-[10px] text-white/20 font-medium mt-3 flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> {item.authority}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
