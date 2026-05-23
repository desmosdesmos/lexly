import { useState } from 'react'
import { TrendingUp, Search, Loader2, AlertCircle, Calendar, FileText, Clock, ArrowRight, ExternalLink, Sparkles, ShieldCheck, Zap, Globe, FileSearch, Info } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { toast } from 'react-toastify'
import api from '../services/api'

const ExternalLinkComp = ({ href, children, className = '' }) => {
  if (!href) return children
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-[#0A84FF] hover:underline inline-flex items-center gap-1.5 font-bold transition-all ${className}`}
    >
      {children}
      <ExternalLink className="w-3 h-3" />
    </a>
  )
}

export function LawMonitoring() {
  const [topic, setTopic] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [monitorData, setMonitorData] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('monitor')

  const handleMonitor = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/legislation/monitor', {
        topic: topic.trim() || null,
      })
      setMonitorData(res.data)
      toast.success('Обзор законодательства сформирован')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Ошибка мониторинга'
      setError(msg)
      toast.error(msg)
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
      toast.info(`Найдено ${res.data.changes?.length || 0} результатов`)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Ошибка поиска'
      setError(msg)
      toast.error(msg)
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
              <Zap className="w-3 h-3" /> Live Мониторинг
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight uppercase italic">
              Мониторинг <br /> <span className="text-[#0A84FF]">законов</span>
            </h1>
            <p className="text-white/40 text-lg font-medium leading-relaxed max-w-lg">
              AI-контроль правового поля. Отслеживайте изменения, которые касаются вашего бизнеса, и получайте инструкции по адаптации к новым правилам.
            </p>
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
                <TrendingUp className="w-6 h-6 text-amber-500 mb-3" />
                <div className="text-xl font-black text-white">Влияние</div>
                <div className="text-xs text-white/30">Оценка последствий</div>
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
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex p-1.5 bg-white/5 rounded-[22px] border border-white/5 backdrop-blur-md">
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
              <FileSearch className="w-3.5 h-3.5" /> Поиск по базе
            </button>
          </div>
        </div>

        {activeTab === 'monitor' ? (
          <div className="space-y-10">
            <Card className="rounded-[40px] border-white/5 bg-white/[0.02] overflow-hidden shadow-2xl">
              <CardBody className="p-8 sm:p-12">
                <form onSubmit={handleMonitor} className="max-w-3xl mx-auto space-y-6 text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">За какими законами следим?</h2>
                  <p className="text-white/30 text-sm mb-8">Укажите отрасль (налоги, IT, ЖКХ) или оставьте пустым для общего обзора</p>
                  <div className="relative group">
                    <Input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Напр: самозанятые 2026, новые штрафы ПДД, законы об AI..."
                      className="bg-white/5 border-white/10 rounded-[30px] h-20 px-8 text-xl focus:border-[#0A84FF]/50 transition-all text-center"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-16 px-12 rounded-[25px] font-black uppercase tracking-widest text-sm gap-3 shadow-[0_0_40px_rgba(10,132,255,0.2)] mx-auto"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                    {loading ? 'Сканирую реестры...' : 'Сформировать обзор'}
                  </Button>
                </form>
              </CardBody>
            </Card>

            {monitorData && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-10">
                {/* Stats row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-[30px] bg-white/[0.02] border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#0A84FF]/10 flex items-center justify-center text-[#0A84FF]">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Дата отчета</div>
                      <div className="text-lg font-bold text-white">{monitorData.report_date || 'Сегодня'}</div>
                    </div>
                  </div>
                  <div className="p-6 rounded-[30px] bg-white/[0.02] border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Найдено правок</div>
                      <div className="text-lg font-bold text-white">{monitorData.total_changes || 0} актов</div>
                    </div>
                  </div>
                  <div className="p-6 rounded-[30px] bg-white/[0.02] border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Тематика</div>
                      <div className="text-lg font-bold text-white truncate max-w-[150px]">{monitorData.topic || 'Общая'}</div>
                    </div>
                  </div>
                </div>

                {/* Main Summary */}
                <Card className="rounded-[40px] border-[#0A84FF]/20 bg-gradient-to-br from-[#0A84FF]/5 to-transparent">
                  <CardHeader className="p-8 pb-4">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-widest flex items-center gap-3">
                      <Info className="w-6 h-6 text-[#0A84FF]" /> Главное в законах
                    </h3>
                  </CardHeader>
                  <CardBody className="p-8 pt-0 space-y-6">
                    <p className="text-white/70 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                      {typeof monitorData.summary === 'string' ? monitorData.summary : 'Обзор успешно сформирован. Изучите детали ниже.'}
                    </p>
                    
                    {monitorData.grounding_sources && (
                      <div className="pt-6 border-t border-white/5 space-y-4">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Источники данных:</p>
                        <div className="flex flex-wrap gap-2">
                          {monitorData.grounding_sources.map((src, i) => (
                            <a 
                              key={i} 
                              href={src.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-bold text-white/50 hover:text-white transition-all max-w-[250px] truncate"
                            >
                              {src.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>

                {/* Changes List */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-widest flex items-center gap-3 ml-2">
                    <FileSearch className="w-7 h-7 text-[#0A84FF]" /> Список изменений
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    {monitorData.changes?.map((ch, i) => (
                      <div key={i} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            ch.impact_level?.toLowerCase() === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            ch.impact_level?.toLowerCase() === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            'bg-green-500/10 text-green-500 border-green-500/20'
                          }`}>
                            Приоритет: {ch.impact_level || 'Normal'}
                          </span>
                          {ch.action_required && (
                            <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 text-[9px] font-black uppercase tracking-widest border border-purple-500/20">
                              Требует действий
                            </span>
                          )}
                          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> {ch.effective_date}
                          </span>
                        </div>
                        
                        <h4 className="text-xl font-bold text-white mb-4 group-hover:text-[#0A84FF] transition-colors">{ch.title || 'Новый нормативный акт'}</h4>
                        <p className="text-white/50 text-sm leading-relaxed mb-6 font-medium">{ch.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div className="p-5 rounded-3xl bg-black/20 border border-white/5">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <TrendingUp className="w-3 h-3 text-amber-500" /> Суть влияния
                            </p>
                            <p className="text-xs text-white/70 font-medium leading-relaxed">{ch.impact}</p>
                          </div>
                          <div className="p-5 rounded-3xl bg-[#0A84FF]/5 border border-[#0A84FF]/10">
                            <p className="text-[10px] font-black text-[#0A84FF] uppercase tracking-widest mb-3 flex items-center gap-2">
                              <ShieldCheck className="w-3 h-3" /> Что нужно сделать
                            </p>
                            <p className="text-xs text-white/70 font-medium leading-relaxed">{ch.recommendations}</p>
                          </div>
                        </div>

                        {ch.url && <ExternalLinkComp href={ch.url} className="text-[11px] uppercase tracking-widest">Читать первоисточник</ExternalLinkComp>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Changes */}
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
                              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Ожидается: {ch.expected_date}</span>
                              {ch.url && <ExternalLinkComp href={ch.url} />}
                            </div>
                            <h5 className="font-bold text-white">{ch.title}</h5>
                            <p className="text-xs text-white/40 leading-relaxed">{ch.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
             <Card className="rounded-[40px] border-white/5 bg-white/[0.02] overflow-hidden">
              <CardBody className="p-8 sm:p-12">
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto space-y-6 text-center">
                  <h2 className="text-2xl font-bold text-white">Поиск по базе изменений</h2>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Напр: НДС, ФЗ-152, удаленная работа..."
                      className="bg-white/5 border-white/10 rounded-2xl h-16 px-6 text-lg focus:border-[#0A84FF]/50"
                    />
                    <Button type="submit" disabled={searchLoading} className="h-16 w-16 p-0 rounded-2xl flex-shrink-0">
                      {searchLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <Search className="w-6 h-6" />}
                    </Button>
                  </div>
                  <p className="text-white/20 text-xs font-medium italic">База обновляется в реальном времени на основе данных ГАРАНТ и Консультант+</p>
                </form>
              </CardBody>
            </Card>

            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.map((item, i) => (
                  <div key={i} className="p-8 rounded-[35px] bg-white/[0.01] border border-white/5 hover:border-[#0A84FF]/30 transition-all group">
                    <h3 className="font-bold text-white text-lg mb-3 leading-tight group-hover:text-[#0A84FF] transition-colors">{item.title}</h3>
                    <div className="flex gap-4 mb-4">
                       {item.date && <span className="text-[10px] font-black text-[#0A84FF] uppercase tracking-widest">{item.date}</span>}
                       {item.number && <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">№ {item.number}</span>}
                    </div>
                    <p className="text-sm text-white/40 mb-6 font-medium line-clamp-4">{item.description}</p>
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
