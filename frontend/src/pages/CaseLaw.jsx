import { useState } from 'react'
import {
  Scale, Search, Loader2, AlertCircle, CheckCircle, Gavel,
  AlertTriangle, Lightbulb, TrendingUp, ExternalLink, Clock,
  MessageSquare, Sparkles, FileSearch, Info, BookOpen, ChevronRight,
  ShieldAlert, ListChecks, BarChart2
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

const EXAMPLE_TOPICS = [
  'Взыскание долга по расписке',
  'Залив квартиры соседями',
  'Незаконное увольнение',
  'Раздел имущества при разводе',
  'Возврат денег за некачественный товар',
  'Споры с застройщиком ДДУ',
]

export function CaseLaw() {
  const [topic, setTopic] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [cases, setCases] = useState([])
  const [searchUrl, setSearchUrl] = useState('')
  const [hasRealCases, setHasRealCases] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('analysis')

  const handleAnalyze = async (e, topicOverride) => {
    e.preventDefault()
    const q = topicOverride || topic
    if (!q.trim()) {
      toast.error('Введите тему для анализа')
      return
    }
    if (topicOverride) setTopic(topicOverride)
    setLoading(true)
    setError(null)
    setAnalysis(null)
    try {
      const res = await api.post('/court-practice/analyze', { topic: q.trim() })
      setAnalysis(res.data)
      setHasRealCases(res.data.has_real_cases || false)
      setSearchUrl(res.data.search_url || '')
      if (res.data.has_real_cases) {
        toast.success('Анализ практики завершён — найдены реальные дела')
      } else {
        toast.info('Анализ завершён на основе законодательства РФ')
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Ошибка анализа'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
      toast.error(typeof msg === 'string' ? msg : 'Ошибка анализа')
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
      const casesArr = res.data.cases || []
      setCases(casesArr)
      setSearchUrl(res.data.search_url || '')
      if (res.data.no_results || casesArr.length === 0) {
        toast.info('Прямого поиска не найдено. Используйте ссылку на sudact.ru')
      } else {
        toast.success(`Найдено ${casesArr.length} дел`)
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Ошибка поиска'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
      toast.error(typeof msg === 'string' ? msg : 'Ошибка поиска')
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
              Анализ практики на основе российского законодательства и открытой базы судебных решений судов РФ.
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
                <BookOpen className="w-6 h-6 text-purple-500 mb-3" />
                <div className="text-xl font-black text-white">Законы</div>
                <div className="text-xs text-white/30">Ссылки на НПА</div>
              </div>
              <div className="p-6 rounded-[30px] bg-white/[0.03] border border-white/5 backdrop-blur-sm translate-x-6">
                <ListChecks className="w-6 h-6 text-green-500 mb-3" />
                <div className="text-xl font-black text-white">Шаги</div>
                <div className="text-xs text-white/30">Что делать сейчас</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-8">
        <div className="flex p-1.5 bg-white/5 rounded-[22px] border border-white/5 backdrop-blur-md w-fit">
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

        {activeTab === 'analysis' ? (
          <div className="space-y-8">
            {/* Input Card */}
            <Card className="rounded-[40px] border-white/5 bg-white/[0.02] overflow-hidden shadow-2xl">
              <CardBody className="p-8 sm:p-12">
                <form onSubmit={handleAnalyze} className="max-w-3xl mx-auto space-y-6 text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">О какой практике рассказать?</h2>
                  <p className="text-white/30 text-sm mb-6">Введите категорию спора, ключевые факты или предмет договора</p>
                  <div className="relative group">
                    <Input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Напр: взыскание долга по расписке, залив квартиры соседями..."
                      className="bg-white/5 border-white/10 rounded-[30px] h-20 px-8 text-xl focus:border-[#0A84FF]/50 transition-all text-center"
                    />
                  </div>

                  {/* Quick examples */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {EXAMPLE_TOPICS.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={(e) => handleAnalyze(e, ex)}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-[#0A84FF]/10 border border-white/5 hover:border-[#0A84FF]/20 text-[11px] font-bold text-white/40 hover:text-[#0A84FF] transition-all"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-16 px-12 rounded-[25px] font-black uppercase tracking-widest text-sm gap-3 shadow-[0_0_40px_rgba(10,132,255,0.2)] hover:shadow-[0_0_50px_rgba(10,132,255,0.3)] mx-auto"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {loading ? 'Анализирую...' : 'Запустить AI Анализ'}
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
            {analysis && Object.keys(a).length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-8">

                  {/* No Real Cases Warning */}
                  {!hasRealCases && (
                    <div className="p-6 rounded-[25px] bg-amber-500/8 border border-amber-500/20 flex gap-4 items-start">
                      <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-amber-400/90">Аналитика без конкретных дел из базы</p>
                        <p className="text-xs text-amber-400/60 leading-relaxed">
                          Прямой поиск по базе судебных решений не дал результатов — возможно, база недоступна или тема слишком специфична. AI-анализ основан на нормах законодательства РФ и типовой практике.
                        </p>
                        {searchUrl && (
                          <a
                            href={searchUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-black text-amber-500 uppercase tracking-widest hover:opacity-80 mt-2"
                          >
                            Поискать дела вручную на sudact.ru <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <Card className="rounded-[40px] border-[#0A84FF]/20 bg-gradient-to-br from-[#0A84FF]/5 to-transparent">
                    <CardHeader className="p-8 pb-4">
                      <h3 className="text-xl font-black text-white uppercase italic tracking-widest flex items-center gap-3">
                        <BarChart2 className="w-6 h-6 text-[#0A84FF]" /> Результаты анализа
                      </h3>
                    </CardHeader>
                    <CardBody className="p-8 pt-0 space-y-6">
                      <p className="text-white/70 text-lg leading-relaxed font-medium whitespace-pre-wrap">{a.summary}</p>

                      {/* Real cases grounding */}
                      {grounding.length > 0 && (
                        <div className="pt-6 border-t border-white/5 space-y-3">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Реальные дела из базы:</p>
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

                      {/* Relevant laws */}
                      {a.relevant_laws && a.relevant_laws.length > 0 && (
                        <div className="pt-4 border-t border-white/5 space-y-3">
                          <p className="text-[10px] font-black text-[#0A84FF] uppercase tracking-[0.3em]">Нормативная база:</p>
                          <div className="space-y-2">
                            {a.relevant_laws.map((law, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-white/50 font-medium">
                                <BookOpen className="w-3.5 h-3.5 text-[#0A84FF]/60 flex-shrink-0 mt-0.5" />
                                <span>{law}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardBody>
                  </Card>

                  {/* Trends & Outcomes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {a.key_trends && (
                      <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-[#0A84FF] uppercase tracking-[0.3em] ml-2">Тенденции судов</h4>
                        <div className="space-y-3">
                          {a.key_trends.map((t, i) => (
                            <div key={i} className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 flex gap-4">
                              <span className="text-white/20 font-black italic">{String(i + 1).padStart(2, '0')}</span>
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

                  {/* Statute of limitations */}
                  {a.statute_of_limitations && (
                    <div className="p-6 rounded-[30px] bg-white/[0.02] border border-white/5 flex gap-4">
                      <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Исковая давность</p>
                        <p className="text-sm text-white/60 font-medium leading-relaxed">{a.statute_of_limitations}</p>
                      </div>
                    </div>
                  )}

                  {/* Practical steps */}
                  {a.practical_steps && a.practical_steps.length > 0 && (
                    <Card className="rounded-[40px] border-green-500/10 bg-green-500/5">
                      <CardBody className="p-8 space-y-4">
                        <div className="flex items-center gap-3 text-green-500">
                          <ListChecks className="w-6 h-6" />
                          <h3 className="font-black uppercase tracking-[0.2em] text-xs">Практические шаги</h3>
                        </div>
                        <div className="space-y-3">
                          {a.practical_steps.map((step, i) => (
                            <div key={i} className="flex gap-3 items-start">
                              <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 text-[10px] font-black flex items-center justify-center flex-shrink-0">
                                {i + 1}
                              </span>
                              <p className="text-sm text-white/60 font-medium leading-relaxed">{step}</p>
                            </div>
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  )}

                  {/* Precedents (only if real cases found) */}
                  {a.important_precedents && a.important_precedents.length > 0 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-black text-white uppercase italic tracking-widest flex items-center gap-3">
                        <Gavel className="w-6 h-6 text-amber-500" /> Прецеденты из базы
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {a.important_precedents.map((p, i) => (
                          <div key={i} className="p-8 rounded-[35px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                              <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                                {p.court || 'Суд РФ'}
                              </span>
                              {p.year && (
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">{p.year}</span>
                              )}
                            </div>
                            <p className="text-white/80 font-bold text-lg mb-3 leading-snug group-hover:text-white transition-colors">
                              {p.description}
                            </p>
                            {p.significance && (
                              <p className="text-white/40 text-sm font-medium mb-6 italic">{p.significance}</p>
                            )}
                            {p.source_url && (
                              <ExternalLinkComp href={p.source_url} className="text-[11px]">
                                Текст решения
                              </ExternalLinkComp>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                  {/* Success rate */}
                  {a.success_rate !== undefined && (
                    <div className="p-8 rounded-[40px] bg-[#0A84FF] text-white shadow-[0_20px_50px_rgba(10,132,255,0.3)] text-center space-y-2 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <TrendingUp className="w-24 h-24" />
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-60">Шансы на успех</p>
                      <div className="text-7xl font-black italic tracking-tight">{a.success_rate}%</div>
                      <p className="text-[10px] font-bold opacity-80 pt-4">Оценка AI на основе типовой практики</p>
                      <p className="text-[9px] opacity-50">Не является юридическим советом</p>
                    </div>
                  )}

                  {/* Risks */}
                  {a.risks && a.risks.length > 0 && (
                    <Card className="rounded-[40px] border-red-500/10 bg-red-500/5">
                      <CardBody className="p-8 space-y-6">
                        <div className="flex items-center gap-3 text-red-500">
                          <ShieldAlert className="w-6 h-6" />
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
                              <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Истец</p>
                              {a.key_arguments.plaintiff.map((arg, i) => (
                                <p key={i} className="text-xs text-white/50 font-medium leading-relaxed">• {arg}</p>
                              ))}
                            </div>
                          )}
                          <div className="h-px bg-white/5" />
                          {a.key_arguments.defendant && (
                            <div className="space-y-3">
                              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Ответчик</p>
                              {a.key_arguments.defendant.map((arg, i) => (
                                <p key={i} className="text-xs text-white/50 font-medium leading-relaxed">• {arg}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  )}

                  {/* Sudact Link */}
                  {searchUrl && (
                    <a
                      href={searchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-6 rounded-[30px] bg-white/[0.02] border border-white/5 hover:border-[#0A84FF]/20 hover:bg-white/[0.04] transition-all group"
                    >
                      <div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Открытая база</p>
                        <p className="text-sm font-bold text-white">Поиск на sudact.ru</p>
                        <p className="text-[10px] text-white/20 mt-1">Более 100 млн решений</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-[#0A84FF] transition-colors" />
                    </a>
                  )}

                  {/* Disclaimer */}
                  <div className="p-5 rounded-[25px] bg-white/[0.01] border border-white/5">
                    <p className="text-[10px] text-white/20 font-medium leading-relaxed">
                      ⚠️ Данный анализ носит информационный характер и не является официальной юридической консультацией. Для ведения дела обратитесь к квалифицированному юристу.
                    </p>
                  </div>
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
                  <h2 className="text-2xl font-bold text-white">Поиск по базе судов РФ</h2>
                  <p className="text-white/30 text-sm">База судебных решений sudact.ru — более 100 млн актов</p>
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
                </form>
              </CardBody>
            </Card>

            {/* No results + sudact link */}
            {searchUrl && cases.length === 0 && !searchLoading && (
              <div className="p-8 rounded-[35px] bg-white/[0.02] border border-white/5 text-center space-y-4">
                <FileSearch className="w-10 h-10 text-white/20 mx-auto" />
                <p className="text-white/40 font-medium">Прямые результаты не загружены.</p>
                <a
                  href={searchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0A84FF]/10 border border-[#0A84FF]/20 text-[#0A84FF] text-sm font-black uppercase tracking-widest hover:bg-[#0A84FF]/20 transition-all"
                >
                  Искать на sudact.ru <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {cases.length > 0 && (
              <div className="space-y-6">
                {/* Sudact link always at top */}
                {searchUrl && (
                  <div className="flex items-center justify-between p-4 rounded-[20px] bg-white/[0.02] border border-white/5">
                    <p className="text-xs text-white/30 font-medium">Показаны результаты из открытой базы</p>
                    <a href={searchUrl} target="_blank" rel="noreferrer" className="text-[11px] font-black text-[#0A84FF] uppercase tracking-widest hover:opacity-80 inline-flex items-center gap-1">
                      Открыть все на sudact.ru <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                  {cases.map((c, i) => (
                    <div key={i} className="p-8 rounded-[35px] bg-white/[0.01] border border-white/5 hover:border-[#0A84FF]/30 transition-all group">
                      <h3 className="font-bold text-white text-lg mb-3 leading-tight group-hover:text-[#0A84FF] transition-colors">
                        {c.title || 'Судебный акт'}
                      </h3>
                      {c.court && (
                        <span className="inline-block px-3 py-1 rounded-lg bg-white/5 text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">
                          {c.court}
                        </span>
                      )}
                      {c.meta && (
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 italic">{c.meta}</p>
                      )}
                      {c.snippet && (
                        <p className="text-sm text-white/40 mb-6 font-medium line-clamp-3">{c.snippet}</p>
                      )}
                      {c.url && (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#0A84FF] hover:opacity-80 transition-all"
                        >
                          Открыть оригинал <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
