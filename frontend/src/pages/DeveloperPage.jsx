import { useState, useEffect } from 'react'
import { Code, Key, Plus, Trash2, Copy, Check, Loader2, AlertTriangle, ShieldCheck, Zap, BookOpen, Terminal, Smartphone, Globe } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { apiKeysAPI, authAPI } from '../services/api'
import { toast } from 'react-toastify'

export function DeveloperPage() {
  const [keys, setKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [lastCreatedKey, setLastCreatedKey] = useState(null)
  const [usage, setUsage] = useState(null)
  const [copied, setCopied] = useState(null)

  const loadData = async () => {
    try {
      const [keysData, usageData] = await Promise.all([
        apiKeysAPI.list(),
        authAPI.getUsage()
      ])
      setKeys(keysData)
      setUsage(usageData)
    } catch (error) {
      console.error('Failed to load keys:', error)
      toast.error('Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newKeyName.trim()) return
    
    setCreating(true)
    try {
      const result = await apiKeysAPI.create(newKeyName)
      setLastCreatedKey(result.key)
      setNewKeyName('')
      await loadData()
      toast.success('API ключ успешно создан')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при создании ключа')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите отозвать этот ключ? Все интеграции, использующие его, перестанут работать.')) return
    
    try {
      await apiKeysAPI.delete(id)
      setKeys(keys.filter(k => k.id !== id))
      toast.success('Ключ отозван')
    } catch (error) {
      toast.error('Ошибка при удалении ключа')
    }
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
    toast.info('Скопировано в буфер обмена')
  }

  const isEligible = usage?.plan === 'business' || usage?.plan === 'enterprise'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#0A84FF] animate-spin" />
      </div>
    )
  }

  if (!isEligible) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center space-y-6 p-12 rounded-[40px] bg-white/[0.02] border border-white/5 shadow-2xl">
          <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto text-amber-500">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-white">Доступ ограничен</h1>
          <p className="text-white/40 text-lg max-w-md mx-auto">
            API-интерфейс доступен только для пользователей тарифов <span className="text-white font-bold italic">Бизнес</span> и <span className="text-white font-bold italic">Корпоративный</span>.
          </p>
          <div className="pt-4">
            <Button 
              variant="primary" 
              onClick={() => window.location.href = '/dashboard/subscription'}
              className="px-8 py-4 rounded-2xl font-bold bg-[#0A84FF] hover:bg-[#007AFF] shadow-[0_0_20px_rgba(10,132,255,0.3)]"
            >
              Улучшить тариф
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Hero Section with Explanation */}
      <div className="relative p-10 rounded-[50px] bg-gradient-to-br from-[#0A84FF]/10 to-transparent border border-white/5 overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0A84FF]/10 border border-[#0A84FF]/20 text-[#0A84FF] text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-3 h-3" /> Для разработчиков и бизнеса
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Интегрируйте мощь <br /> <span className="text-[#0A84FF]">Laxly AI</span> в свои IT-системы
            </h1>
            <p className="text-white/40 text-lg font-medium leading-relaxed">
              Наш API позволяет автоматизировать юридические процессы: от анализа договоров в вашей CRM до генерации документов в мобильном приложении.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                <Globe className="w-4 h-4 text-[#0A84FF]" /> CRM Интеграция
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                <Smartphone className="w-4 h-4 text-[#0A84FF]" /> Мобильные приложения
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                <Terminal className="w-4 h-4 text-[#0A84FF]" /> Автоматизация через n8n
              </div>
            </div>
          </div>
          <div className="hidden lg:block relative">
            <div className="absolute -inset-10 bg-[#0A84FF]/20 blur-[100px] rounded-full" />
            <div className="relative p-6 rounded-3xl bg-black/40 border border-white/10 font-mono text-[13px] text-white/70 shadow-2xl">
              <div className="flex gap-1.5 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <p className="text-indigo-400"># Пример запроса к AI-консультанту</p>
              <p className="mt-2"><span className="text-pink-400">curl</span> -X POST "https://api.laxlylaw.ru/api/v1/legal/consult"</p>
              <p>-H "Authorization: Bearer <span className="text-amber-400">YOUR_API_KEY</span>"</p>
              <p>-H "Content-Type: application/json"</p>
              <p>-d {"{"}</p>
              <p className="ml-4">"question": "Как уволить сотрудника за прогул?"</p>
              <p>{"}"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* API Key Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-wider flex items-center gap-3">
              <Key className="w-6 h-6 text-[#0A84FF]" /> Ваши ключи
            </h2>
          </div>

          {lastCreatedKey && (
            <div className="p-8 rounded-[40px] bg-green-500/10 border border-green-500/20 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-3 text-green-500">
                <ShieldCheck className="w-6 h-6" />
                <span className="font-black text-sm uppercase tracking-[0.2em]">Ключ успешно создан</span>
              </div>
              <p className="text-sm text-green-500/70 font-medium">
                Скопируйте его прямо сейчас. Из соображений безопасности мы не сможем показать его повторно.
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-6 py-4 font-mono text-sm text-white overflow-hidden text-ellipsis select-all">
                  {lastCreatedKey}
                </div>
                <button 
                  onClick={() => copyToClipboard(lastCreatedKey, 'new')}
                  className="p-4 bg-white text-black rounded-2xl hover:bg-white/90 transition-all active:scale-95"
                >
                  {copied === 'new' ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                </button>
              </div>
              <button 
                onClick={() => setLastCreatedKey(null)}
                className="text-xs text-white/30 hover:text-white/60 transition-colors font-black uppercase tracking-[0.2em]"
              >
                Я надежно сохранил этот ключ
              </button>
            </div>
          )}

          <div className="space-y-4">
            {keys.length === 0 ? (
              <div className="p-16 rounded-[50px] bg-white/[0.02] border border-white/5 text-center space-y-6">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-white/10">
                  <Key className="w-10 h-10" />
                </div>
                <p className="text-white/30 font-medium italic text-lg text-balance">Создайте свой первый ключ, чтобы начать использовать API Laxly</p>
              </div>
            ) : (
              keys.map((key) => (
                <div key={key.id} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition-all group">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-white">{key.name}</h3>
                      {!key.is_active && (
                        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest border border-red-500/20">Отозван</span>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">
                      <span className="flex items-center gap-1.5"><Terminal className="w-3 h-3" /> {key.key_preview}</span>
                      <span>Создан: {new Date(key.created_at).toLocaleDateString()}</span>
                      {key.last_used_at && <span className="text-[#0A84FF]">Активен: {new Date(key.last_used_at).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button 
                      onClick={() => handleDelete(key.id)}
                      className="p-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all active:scale-90"
                      title="Отозвать ключ"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Key Creator Sidebar */}
        <div className="space-y-6">
          <Card className="rounded-[40px] border-white/5 bg-white/[0.02] overflow-hidden">
            <CardBody className="p-8 space-y-6">
              <h2 className="text-2xl font-bold text-white">Создать ключ</h2>
              <form onSubmit={handleCreate} className="space-y-5">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">Имя ключа</label>
                  <Input 
                    placeholder="Напр: Интеграция с CRM" 
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-2xl h-16 px-6 text-lg focus:border-[#0A84FF]/50"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={creating || !newKeyName.trim()}
                  className="w-full h-16 rounded-2xl font-black text-sm uppercase tracking-widest gap-3 shadow-[0_0_30px_rgba(10,132,255,0.2)]"
                >
                  {creating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                  Создать API Ключ
                </Button>
              </form>
            </CardBody>
          </Card>

          <div className="p-8 rounded-[40px] border border-[#0A84FF]/10 bg-gradient-to-br from-[#0A84FF]/10 to-transparent space-y-5">
            <div className="flex items-center gap-3 text-[#0A84FF]">
              <Zap className="w-5 h-5" />
              <h3 className="font-black uppercase tracking-[0.2em] text-xs text-white">Статус вашего API</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-white/30 uppercase tracking-widest">Rate Limit</span>
                <span className="text-white bg-white/5 px-3 py-1 rounded-lg">{usage?.plan === 'enterprise' ? '300 запр/мин' : '60 запр/мин'}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-white/30 uppercase tracking-widest">Методы v1</span>
                <span className="text-green-500 flex items-center gap-1"><Check className="w-3 h-3" /> Доступны</span>
              </div>
              <div className="pt-4">
                <p className="text-[10px] text-white/30 leading-relaxed italic mb-4">
                  Для Корпоративных клиентов доступно увеличение лимитов и выделенные сервера.
                </p>
                <a href="#docs" className="block w-full py-4 text-center rounded-2xl border border-white/5 bg-white/5 text-[11px] font-black text-white uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                   Тех. документация ↓
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Section */}
      <div id="docs" className="space-y-8 pt-10 border-t border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0A84FF]/10 flex items-center justify-center text-[#0A84FF]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-widest">Быстрый старт</h2>
            <p className="text-white/30 font-medium">Как начать использовать API Laxly в ваших проектах</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Doc 1: Auth */}
          <div className="p-8 rounded-[40px] bg-white/[0.01] border border-white/5 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#0A84FF]" /> 1. Авторизация
            </h3>
            <p className="text-sm text-white/40 leading-relaxed">
              Все запросы к API должны содержать заголовок <code className="text-[#0A84FF] bg-[#0A84FF]/5 px-2 py-0.5 rounded">Authorization</code> с вашим ключом.
            </p>
            <div className="p-6 rounded-2xl bg-black/30 font-mono text-xs text-white/60">
              Authorization: Bearer <span className="text-[#0A84FF]">LX_YOUR_KEY_HERE</span>
            </div>
          </div>

          {/* Doc 2: Consultant */}
          <div className="p-8 rounded-[40px] bg-white/[0.01] border border-white/5 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" /> 2. AI-консультант
            </h3>
            <p className="text-sm text-white/40 leading-relaxed">
              Отправьте юридический вопрос и получите мгновенный ответ со ссылками на законы.
            </p>
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase text-white/20">Endpoint</div>
              <div className="p-4 rounded-xl bg-black/30 font-mono text-xs text-green-400">
                POST /api/v1/legal/consult
              </div>
            </div>
          </div>

          {/* Doc 3: Generator */}
          <div className="p-8 rounded-[40px] bg-white/[0.01] border border-white/5 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" /> 3. Генерация документов
            </h3>
            <p className="text-sm text-white/40 leading-relaxed">
              Автоматическое создание исков, договоров и претензий по шаблону.
            </p>
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase text-white/20">Endpoint</div>
              <div className="p-4 rounded-xl bg-black/30 font-mono text-xs text-amber-500">
                POST /api/v1/documents/generate
              </div>
            </div>
          </div>

          {/* Doc 4: Webhooks */}
          <div className="p-8 rounded-[40px] bg-[#0A84FF]/5 border border-[#0A84FF]/10 space-y-6 flex flex-col justify-center text-center">
            <ShieldCheck className="w-12 h-12 text-[#0A84FF] mx-auto" />
            <h3 className="text-xl font-bold text-white uppercase italic tracking-widest">Безопасность</h3>
            <p className="text-sm text-white/50 leading-relaxed">
              Мы используем шифрование SHA-256 для хранения ваших ключей. 
              Никогда не передавайте ключ в клиентском коде (JS в браузере), 
              всегда используйте его на стороне сервера.
            </p>
          </div>
        </div>
        
        <div className="text-center pt-6">
          <p className="text-white/30 text-xs font-medium">
            Полная техническая документация в формате Swagger доступна по адресу: 
            <a href="https://laxlylaw.ru/api/v1/docs" target="_blank" className="text-[#0A84FF] hover:underline ml-2">https://laxlylaw.ru/api/v1/docs</a>
          </p>
        </div>
      </div>
    </div>
  )
}
