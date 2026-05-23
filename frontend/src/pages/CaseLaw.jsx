import { useState } from 'react'
import { Scale, Search, Loader2, AlertCircle, CheckCircle, Gavel, AlertTriangle, Lightbulb, TrendingUp, ExternalLink, Clock, MessageSquare, History, Sparkles, Filter, FileSearch } from 'lucide-react'
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

export function CaseLaw() {
  const [topic, setTopic] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [cases, setCases] = useState([])
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('analysis')

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!topic.trim()) {
      toast.error('Введите тему для анализа')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/court-practice/analyze', {
        topic: topic.trim(),
      })
      setAnalysis(res.data)
      toast.success('Анализ практики завершен')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Ошибка анализа'
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
      const res = await api.get('/court-practice/search', {
        params: { query: searchQuery, limit: 20 },
      })
      setCases(res.data.cases || [])
      toast.info(`Найдено ${res.data.cases?.length || 0} совпадений`)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Ошибка поиска'
      setError(msg)
      toast.error(msg)
    } finally {
      setSearchLoading(false)
    }
  }

  const a = analysis?.analysis || {}
  const grounding = analysis?.grounding_cases || []

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-2 sm:px-0">
      {/* Hero Section */}
      <div className="relative p-10 rounded-[50px] bg-gradient-to-br from-[#0A84FF]/10 to-transparent border border-white/5 overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0A84FF]/10 border border-[#0A84FF]/20 text-[#0A84FF] text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> AI Аналитика
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight uppercase italic">
              Судебная <br /> <span className="text-[#0A84FF]">практика</span>
            </h1>
            <p className="text-white/40 text-lg font-medium leading-relaxed max-w-lg">
              Профессиональный анализ тысяч реальных судебных решений. Узнайте свои шансы на успех и подготовьтесь к аргументам оппонента.
            </p>
          </div>
          
          <div className="hidden lg:grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="p-6 rounded-[30px] bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                <TrendingUp className="w-6 h-6 text-[#0A84FF] mb-3" />
                <div className="text-xl font-black text-white">Win-rate</div>
                <div className="text-xs text-white/30">Прогноз исхода дела</div>
              </div>
              <div className="p-6 rounded-[30px] bg-white/[0.03] border border-white/5 backdrop-blur-sm translate-x-6">
                <AlertTriangle className="w-6 h-6 text-amber-500 mb-3" />
                <div className="text-xl font-black text-white">Риски</div>
                <div className="text-xs text-white/30">Скрытые угрозы</div>
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="p-6 rounded-[30px] bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                <Gavel className="w-6 h-6 text-purple-500 mb-3" />
                <div className="text-xl font-black text-white">Прецеденты</div>
                <div className="text-xs text-white/30">Реальные кейсы</div>
              </div>
              <div className="p-6 rounded-[30px] bg-white/[0.03] border border-white/5 backdrop-blur-sm translate-x-6">
                <MessageSquare className="w-6 h-6 text-green-500 mb-3" />
                <div className="text-xl font-black text-white">Доводы</div>
                <div className="text-xs text-white/30">База аргументов</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Search Controls */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex p-1.5 bg-white/5 rounded-[22px] border border-white/5 backdrop-blur-md">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'analysis'
                  ? 'bg-[#0A84FF] text-white shadow-[0_0_20px_rgba(10,132,255,0.3)]'
                  : 'text-white/30 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Анализ
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'search'
                  ? 'bg-[#0A84FF] text-white shadow-[0_0_20px_rgba(10,132,255,0.3)]'
                  : 'text-white/30 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              <FileSearch className="w-3.5 h-3.5" /> Поиск дел
            </button>
          </div>
        </div>

        {activeTab === 'analysis' ? (
          <div className="space-y-8">
            <Card className="rounded-[40px] border-white/5 bg-white/[0.02] overflow-hidden shadow-2xl">
              <CardBody className="p-8 sm:p-12">
                <form onSubmit={handleAnalyze} className="max-w-3xl mx-auto space-y-6 text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">О какой практике рассказать?</h2>
                  <p className="text-white/30 text-sm mb-8">Введите категорию спора, ключевые факты или предмет договора</p>
                  <div className="relative group">
                    <Input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Напр: взыскание долга по расписке, залив квартиры соседями..."
                      className="bg-white/5 border-white/10 rounded-[30px] h-20 px-8 text-xl focus:border-[#0A84FF]/50 transition-all text-center"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-16 px-12 rounded-[25px] font-black uppercase tracking-widest text-sm gap-3 shadow-[0_0_40px_rgba(10,132,255,0.2)] hover:shadow-[0_0_50px_rgba(10,132,255,0.3)] mx-auto"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {loading ? 'Изучаю архивы...' : 'Запустить AI Анализ'}
                  </Button>
                </form>
              </CardBody>
            </Card>

            {analysis && Object.keys(a).length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Main Results Column */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Summary Card */}
                  <Card className="rounded-[40px] border-[#0A84FF]/20 bg-gradient-to-br from-[#0A84FF]/5 to-transparent">
                    <CardHeader className="p-8 pb-4">
                      <h3 className="text-xl font-black text-white uppercase italic tracking-widest flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-[#0A84FF]" /> Результаты анализа
                      </h3>
                    </CardHeader>
                    <CardBody className="p-8 pt-0 space-y-6">
                      <p className="text-white/70 text-lg leading-relaxed font-medium whitespace-pre-wrap">{a.summary}</p>
                      
                      {grounding.length > 0 && (
                        <div className="pt-6 border-t border-white/5 space-y-4">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Первоисточники для анализа:</p>
                          <div className="flex flex-wrap gap-2">
                            {grounding.map((g, i) => (
                              <a 
                                key={i} 
                                href={g.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-bold text-white/50 hover:text-white transition-all max-w-[250px] truncate"
                                title={g.title}
                              >
                                {g.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardBody>
                  </Card>

                  {/* Trends & Outcomes Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {a.key_trends && (
                      <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-[#0A84FF] uppercase tracking-[0.3em] ml-2">Тенденции судов</h4>
                        <div className="space-y-3">
                          {a.key_trends.map((t, i) => (
                            <div key={i} className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 flex gap-4">
                              <span className="text-white/20 font-black italic">{String(i+1).padStart(2, '0')}</span>
                              <p className="text-sm text-white/70 font-medium">{t}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {a.typical_outcomes && (
                      <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-purple-500 uppercase tracking-[0.3em] ml-2">Типичные решения</h4>
                        <div className="space-y-3">
                          {a.typical_outcomes.map((o, i) => (
                            <div key={i} className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 flex gap-4">
                              <CheckCircle className="w-4 h-4 text-purple-500/50 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-white/70 font-medium">{o}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Precedents Card */}
                  {a.important_precedents && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-black text-white uppercase italic tracking-widest flex items-center gap-3">
                        <Gavel className="w-6 h-6 text-amber-500" /> Ключевые прецеденты
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {a.important_precedents.map((p, i) => (
                          <div key={i} className="p-8 rounded-[35px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                              <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">{p.court || 'ВС РФ'}</span>
                              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">{p.year}</span>
                            </div>
                            <p className="text-white/80 font-bold text-lg mb-3 leading-snug group-hover:text-white transition-colors">{p.description}</p>
                            {p.significance && <p className="text-white/40 text-sm font-medium mb-6 italic">{p.significance}</p>}
                            <div className="flex gap-4">
                              {p.source_url && <ExternalLinkComp href={p.source_url} className="text-[11px]">Текст решения</ExternalLinkComp>}
                              {p.law_url && <ExternalLinkComp href={p.law_url} className="text-[11px]">Статья закона</ExternalLinkComp>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                  {/* Chance Card */}
                  {a.success_rate && (
                    <div className="p-8 rounded-[40px] bg-[#0A84FF] text-white shadow-[0_20px_50px_rgba(10,132,255,0.3)] text-center space-y-2 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <TrendingUp className="w-24 h-24" />
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-60">Шансы на успех</p>
                      <div className="text-7xl font-black italic tracking-tight">{a.success_rate}%</div>
                      <p className="text-[10px] font-bold opacity-80 pt-4">Оценка AI на основе схожих дел</p>
                    </div>
                  )}

                  {/* Risks Card */}
                  {a.risks && a.risks.length > 0 && (
                    <Card className="rounded-[40px] border-red-500/10 bg-red-500/5">
                      <CardBody className="p-8 space-y-6">
                        <div className="flex items-center gap-3 text-red-500">
                          <AlertTriangle className="w-6 h-6" />
                          <h3 className="font-black uppercase tracking-[0.2em] text-xs">Факторы риска</h3>
                        </div>
                        <div className="space-y-4">
                          {a.risks.map((r, i) => (
                            <div key={i} className="flex gap-3 items-start">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                              <p className="text-sm text-red-200/60 font-medium leading-relaxed">{r}</p>
                            </div>
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  )}

                  {/* Key Arguments */}
                  {a.key_arguments && (
                    <Card className="rounded-[40px] border-white/5 bg-white/[0.02]">
                      <CardBody className="p-8 space-y-8">
                        <div className="flex items-center gap-3 text-white">
                          <Lightbulb className="w-6 h-6 text-[#0A84FF]" />
                          <h3 className="font-black uppercase tracking-[0.2em] text-xs italic">Аргументация</h3>
                        </div>
                        
                        <div className="space-y-6">
                          {a.key_arguments.plaintiff && (
                            <div className="space-y-3">
                              <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Сильные стороны Истца</p>
                              {a.key_arguments.plaintiff.map((arg, i) => (
                                <p key={i} className="text-xs text-white/50 font-medium leading-relaxed">• {arg}</p>
                              ))}
                            </div>
                          )}
                          <div className="h-px bg-white/5" />
                          {a.key_arguments.defendant && (
                            <div className="space-y-3">
                              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Защита Ответчика</p>
                              {a.key_arguments.defendant.map((arg, i) => (
                                <p key={i} className="text-xs text-white/50 font-medium leading-relaxed">• {arg}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            <Card className="rounded-[40px] border-white/5 bg-white/[0.02] overflow-hidden">
              <CardBody className="p-8 sm:p-12">
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto space-y-6 text-center">
                  <h2 className="text-2xl font-bold text-white">Поиск по базе дел Sudact</h2>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ключевые слова, номер дела или статьи..."
                      className="bg-white/5 border-white/10 rounded-2xl h-16 px-6 text-lg focus:border-[#0A84FF]/50"
                    />
                    <Button type="submit" disabled={searchLoading} className="h-16 w-16 p-0 rounded-2xl flex-shrink-0">
                      {searchLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <Search className="w-6 h-6" />}
                    </Button>
                  </div>
                  <p className="text-white/20 text-xs font-medium italic">Обновление базы происходит ежедневно. Доступно более 100 млн решений.</p>
                </form>
              </CardBody>
            </Card>

            {cases.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                {cases.map((c, i) => (
                  <div key={i} className="p-8 rounded-[35px] bg-white/[0.01] border border-white/5 hover:border-[#0A84FF]/30 transition-all group">
                    <h3 className="font-bold text-white text-lg mb-3 leading-tight group-hover:text-[#0A84FF] transition-colors">{c.title || 'Судебный акт'}</h3>
                    {c.meta && <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 italic">{c.meta}</p>}
                    {c.snippet && <p className="text-sm text-white/40 mb-6 font-medium line-clamp-3">{c.snippet}</p>}
                    {c.url && (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#0A84FF] hover:opacity-80 transition-all"
                      >
                        Открыть оригинал <Search className="w-3.5 h-3.5" />
                      </a>
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
