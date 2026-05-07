import { useState } from 'react'
import { TrendingUp, Search, Loader2, AlertCircle, Calendar, FileText, Clock, ArrowRight, ExternalLink } from 'lucide-react'
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
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка мониторинга')
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
      const res = await api.get('/legislation/search', {
        params: { query: searchQuery, limit: 20 },
      })
      setSearchResults(res.data.changes || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка поиска')
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-semibold">Мониторинг законов</h1>
        </div>
        <p className="text-muted-foreground">
          AI отслеживает изменения в законодательстве РФ и объясняет, как они влияют на вас. 
          Выберите тему — AI покажет последние изменения в законах, даты вступления в силу, практические рекомендации и ссылки на источники.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('monitor')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'monitor'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          Обзор изменений
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'search'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          Поиск
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

      {/* Monitor tab */}
      {activeTab === 'monitor' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Обзор изменений законодательства</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleMonitor} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Тема (опционально)</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Например: трудовое право, налогообложение, защита прав потребителей"
                    className="glass-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Загрузка...' : 'Получить обзор'}
                </button>
              </form>
            </CardBody>
          </Card>

          {monitorData && (
            <>
              {/* Stats bar */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                  <CardBody className="text-center">
                    <Calendar className="w-6 h-6 text-accent mx-auto mb-2" />
                    <div className="text-lg font-semibold">{monitorData.report_date || '—'}</div>
                    <p className="text-xs text-muted-foreground">Дата отчёта</p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody className="text-center">
                    <FileText className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-lg font-semibold">{monitorData.total_changes || 0}</div>
                    <p className="text-xs text-muted-foreground">Изменений</p>
                  </CardBody>
                </Card>
                {monitorData.topic && (
                  <Card>
                    <CardBody className="text-center">
                      <Search className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                      <div className="text-sm font-semibold truncate">{monitorData.topic}</div>
                      <p className="text-xs text-muted-foreground">Тема</p>
                    </CardBody>
                  </Card>
                )}
              </div>

              {/* Summary */}
              {monitorData.summary && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold">Обзор</h2>
                  </CardHeader>
                  <CardBody>
                    {typeof monitorData.summary === 'string' ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{monitorData.summary}</p>
                    ) : (
                      <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(monitorData.summary, null, 2)}</pre>
                    )}
                  </CardBody>
                </Card>
              )}

              {/* Changes */}
              {monitorData.changes && monitorData.changes.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      Последние изменения
                    </h2>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      {monitorData.changes.map((ch, i) => (
                        <div key={i} className="p-5 bg-white/5 rounded-lg border border-white/10">
                          {typeof ch === 'string' ? (
                            <p className="text-sm whitespace-pre-wrap">{ch}</p>
                          ) : (
                            <>
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-start gap-3 flex-1">
                                  <span className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      {ch.title && <h4 className="font-semibold text-sm">{ch.title}</h4>}
                                      {ch.url && (
                                        <Link href={ch.url} className="text-xs">
                                          Источник
                                        </Link>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                      {ch.law_number && (
                                        <span className="text-xs px-2 py-0.5 bg-white/10 rounded font-mono">{ch.law_number}</span>
                                      )}
                                      {ch.effective_date && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Calendar className="w-3 h-3" /> {ch.effective_date}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {ch.description && (
                                <p className="text-sm text-muted-foreground mb-2 ml-10">{ch.description}</p>
                              )}
                              {ch.impact && (
                                <p className="text-sm mb-2 ml-10">
                                  <span className="font-medium">Влияние:</span> {ch.impact}
                                </p>
                              )}
                              {ch.recommendations && (
                                <div className="ml-10 mt-2 p-3 bg-accent/5 rounded-lg">
                                  <p className="text-xs font-medium text-accent mb-1 flex items-center gap-1">
                                    <ArrowRight className="w-3 h-3" /> Рекомендации
                                  </p>
                                  <p className="text-xs text-muted-foreground">{ch.recommendations}</p>
                                </div>
                              )}
                              {ch.affected_areas && ch.affected_areas.length > 0 && (
                                <div className="flex gap-1 flex-wrap ml-10 mt-2">
                                  {ch.affected_areas.map((area, j) => (
                                    <span key={j} className="text-xs px-2 py-0.5 bg-white/10 rounded">{area}</span>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Upcoming changes */}
              {monitorData.upcoming_changes && monitorData.upcoming_changes.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      Предстоящие изменения
                    </h2>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      {monitorData.upcoming_changes.map((ch, i) => (
                        <div key={i} className="p-5 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                          {typeof ch === 'string' ? (
                            <p className="text-sm whitespace-pre-wrap">{ch}</p>
                          ) : (
                            <>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="font-semibold text-sm">{ch.title || 'Изменение'}</h4>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {ch.url && (
                                    <Link href={ch.url} className="text-xs">
                                      Источник
                                    </Link>
                                  )}
                                  {ch.expected_date && (
                                    <span className="text-xs px-2 py-0.5 bg-yellow-500/20 rounded font-medium whitespace-nowrap">
                                      {ch.expected_date}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {ch.description && <p className="text-sm text-muted-foreground">{ch.description}</p>}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Sources */}
              {monitorData.sources && monitorData.sources.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <ExternalLink className="w-5 h-5 text-muted-foreground" />
                      Источники
                    </h2>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {monitorData.sources.map((src, i) => (
                        <Link key={i} href={src.url} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                          <p className="text-sm font-medium">{src.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{src.url}</p>
                        </Link>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}

              {!monitorData.summary && (!monitorData.changes || monitorData.changes.length === 0) && (
                <Card>
                  <CardBody className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium mb-1">Данных не найдено</p>
                    <p className="text-sm">Попробуйте указать конкретную тему</p>
                  </CardBody>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* Search tab */}
      {activeTab === 'search' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Поиск изменений по ключевому слову</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Поисковый запрос</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Например: НДС, трудовой договор, самозанятые"
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

            {searchResults.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-sm text-muted-foreground">Найдено: {searchResults.length}</p>
                {searchResults.map((item, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/5">
                    {typeof item === 'string' ? (
                      <p className="text-sm whitespace-pre-wrap">{item}</p>
                    ) : (
                      <>
                        {item.title && <h3 className="font-medium text-sm mb-1">{item.title}</h3>}
                        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                        {item.number && <p className="text-xs text-muted-foreground mt-1">№ {item.number}</p>}
                        {item.date && <p className="text-xs text-muted-foreground mt-1">{item.date}</p>}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {searchResults.length === 0 && !searchLoading && searchQuery && (
              <div className="mt-6 text-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium mb-1">Ничего не найдено</p>
                <p className="text-sm">Попробуйте другой запрос</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
