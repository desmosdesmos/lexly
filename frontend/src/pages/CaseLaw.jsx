import { useState } from 'react'
import { Scale, Search, Loader2, AlertCircle, CheckCircle, Gavel, AlertTriangle, Lightbulb, TrendingUp, ExternalLink } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import api from '../services/api'

const Link = ({ href, children, className = '' }) => {
  if (!href) return children
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-accent hover:underline inline-flex items-center gap-1 ${className}`}
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
      setError('Введите тему анализа')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/court-practice/analyze', {
        topic: topic.trim(),
      })
      setAnalysis(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка анализа')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      setError('Введите поисковый запрос')
      return
    }
    setSearchLoading(true)
    setError(null)
    try {
      const res = await api.get('/court-practice/search', {
        params: { query: searchQuery, limit: 20 },
      })
      setCases(res.data.cases || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка поиска')
    } finally {
      setSearchLoading(false)
    }
  }

  const a = analysis?.analysis || {}
  const grounding = analysis?.grounding_cases || []

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Scale className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-semibold">Судебная практика</h1>
        </div>
        <p className="text-muted-foreground">
          Профессиональный AI-анализ реальных судебных решений. Введите тему, чтобы получить обзор тенденций, прецедентов и оценку шансов на успех.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-card rounded-xl w-fit border border-white/5">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'analysis'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          AI Анализ
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'search'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Поиск дел (Sudact)
        </button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardBody className="flex items-center gap-3 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </CardBody>
        </Card>
      )}

      {/* Analysis tab */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Анализ практики по теме</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleAnalyze} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Тема анализа</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Например: взыскание задолженности, трудовые споры, защита прав потребителей"
                    className="glass-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Анализ...' : 'Анализировать'}
                </button>
              </form>
            </CardBody>
          </Card>

          {a && Object.keys(a).length > 0 && (
            <>
              {/* Summary */}
              {a.summary && (
                <Card className="border-accent/20 bg-accent/5">
                  <CardHeader>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-accent" />
                      Резюме анализа
                    </h2>
                  </CardHeader>
                  <CardBody>
                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{a.summary}</p>
                    
                    {grounding.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-white/5">
                        <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Базовые источники анализа:</p>
                        <div className="flex flex-wrap gap-2">
                          {grounding.map((g, i) => (
                            <a 
                              key={i} 
                              href={g.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 transition-colors max-w-[200px] truncate"
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
              )}

              {/* Success rate + risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {a.success_rate && (
                  <Card>
                    <CardBody className="text-center">
                      <div className="text-4xl font-bold text-accent mb-2">{a.success_rate}%</div>
                      <p className="text-sm text-muted-foreground">Процент успешных дел</p>
                    </CardBody>
                  </Card>
                )}
                {a.risks && a.risks.length > 0 && (
                  <Card>
                    <CardBody>
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-yellow-600">
                        <AlertTriangle className="w-5 h-5" />
                        Риски
                      </h3>
                      <ul className="space-y-2">
                        {a.risks.map((r, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-yellow-500 mt-0.5">⚠</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </CardBody>
                  </Card>
                )}
              </div>

              {/* Statute of Limitations & Key Arguments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {a.statute_of_limitations && (
                  <Card className="border-blue-500/20 bg-blue-500/5">
                    <CardBody>
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-400">
                        <Clock className="w-5 h-5" />
                        Исковая давность
                      </h3>
                      <p className="text-sm leading-relaxed">{a.statute_of_limitations}</p>
                    </CardBody>
                  </Card>
                )}

                {a.key_arguments && (
                  <Card>
                    <CardBody>
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-purple-400">
                        <MessageSquare className="w-5 h-5" />
                        Ключевые доводы
                      </h3>
                      <div className="space-y-4">
                        {a.key_arguments.plaintiff && a.key_arguments.plaintiff.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">Истец:</p>
                            <ul className="space-y-1.5">
                              {a.key_arguments.plaintiff.map((arg, i) => (
                                <li key={i} className="text-xs flex items-start gap-1.5">
                                  <span className="text-green-500 mt-0.5">•</span>
                                  <span>{arg}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {a.key_arguments.defendant && a.key_arguments.defendant.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Ответчик:</p>
                            <ul className="space-y-1.5">
                              {a.key_arguments.defendant.map((arg, i) => (
                                <li key={i} className="text-xs flex items-start gap-1.5">
                                  <span className="text-red-500 mt-0.5">•</span>
                                  <span>{arg}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                )}
              </div>

              {/* Key trends */}
              {a.key_trends && a.key_trends.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Ключевые тенденции
                    </h2>
                  </CardHeader>
                  <CardBody>
                    <ul className="space-y-3">
                      {a.key_trends.map((t, i) => (
                        <li key={i} className="text-sm flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                          <span className="leading-relaxed">{t}</span>
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              )}

              {/* Typical outcomes */}
              {a.typical_outcomes && a.typical_outcomes.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Gavel className="w-5 h-5 text-orange-500" />
                      Типичные исходы дел
                    </h2>
                  </CardHeader>
                  <CardBody>
                    <ul className="space-y-3">
                      {a.typical_outcomes.map((o, i) => (
                        <li key={i} className="text-sm flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                          <span className="leading-relaxed">{o}</span>
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              )}

              {/* Important precedents */}
              {a.important_precedents && a.important_precedents.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Gavel className="w-5 h-5 text-purple-500" />
                      Важные прецеденты
                    </h2>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      {a.important_precedents.map((p, i) => (
                        <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/5">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs font-medium px-2 py-0.5 bg-purple-500/10 text-purple-500 rounded">{p.court || 'Суд'}</span>
                            {p.year && <span className="text-xs text-muted-foreground">{p.year}</span>}
                            {p.source_url && (
                              <Link href={p.source_url} className="text-xs">
                                Решение суда
                              </Link>
                            )}
                            {p.law_url && (
                              <Link href={p.law_url} className="text-xs">
                                Закон
                              </Link>
                            )}
                          </div>
                          <p className="text-sm font-medium mb-1">{p.description}</p>
                          {p.significance && <p className="text-xs text-muted-foreground mt-1">{p.significance}</p>}
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Laws referenced */}
              {a.laws && a.laws.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Scale className="w-5 h-5 text-blue-500" />
                      Нормативная база
                    </h2>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      {a.laws.map((law, i) => (
                        <div key={i} className="flex items-start justify-between gap-3 p-3 bg-white/5 rounded-lg">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{law.name}</h4>
                            {law.description && <p className="text-xs text-muted-foreground mt-0.5">{law.description}</p>}
                          </div>
                          <Link href={law.url} className="text-xs flex-shrink-0">
                            Источник
                          </Link>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Recommendations */}
              {a.recommendations && a.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      Рекомендации
                    </h2>
                  </CardHeader>
                  <CardBody>
                    <ul className="space-y-3">
                      {a.recommendations.map((r, i) => (
                        <li key={i} className="text-sm flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              )}

              {a.notes && (
                <Card>
                  <CardBody>
                    <p className="text-sm text-muted-foreground">
                      <strong>Примечание:</strong> {a.notes}
                    </p>
                  </CardBody>
                </Card>
              )}

              {/* Sources */}
              {a.sources && a.sources.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <ExternalLink className="w-5 h-5 text-muted-foreground" />
                      Источники
                    </h2>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {a.sources.map((src, i) => (
                        <Link key={i} href={src.url} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                          <p className="text-sm font-medium">{src.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{src.url}</p>
                        </Link>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}
            </>
          )}

          {analysis && Object.keys(a).length === 0 && (
            <Card>
              <CardBody className="text-center py-8 text-muted-foreground">
                <p>Получен пустой ответ от AI. Попробуйте другую тему.</p>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* Search tab */}
      {activeTab === 'search' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Поиск дел на sudact.ru</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Поисковый запрос</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Например: договор поставки, задолженность, трудовой спор"
                  className="glass-input"
                />
              </div>
              <button
                type="submit"
                disabled={searchLoading}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {searchLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {searchLoading ? 'Поиск...' : 'Найти'}
              </button>
            </form>

            {cases.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-sm text-muted-foreground">Найдено дел: {cases.length}</p>
                {cases.map((c, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/5">
                    <h3 className="font-medium mb-1">{c.title || 'Без названия'}</h3>
                    {c.snippet && <p className="text-sm text-muted-foreground mb-2">{c.snippet}</p>}
                    {c.meta && <p className="text-xs text-muted-foreground mb-2">{c.meta}</p>}
                    {c.url && (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent text-sm hover:underline flex items-center gap-1"
                      >
                        <Search className="w-3 h-3" /> Открыть дело
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {cases.length === 0 && !searchLoading && searchQuery && (
              <div className="mt-6 text-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium mb-1">Дела не найдены</p>
                <p className="text-sm">Попробуйте изменить поисковый запрос</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
