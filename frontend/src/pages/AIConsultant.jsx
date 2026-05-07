import { useState } from 'react'
import { MessageSquare, Loader2, AlertCircle, Send, Sparkles, BookOpen } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import api from '../services/api'

export function AIConsultant() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const [error, setError] = useState(null)

  const handleAsk = async (e) => {
    e.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    setError(null)

    const userMsg = { role: 'user', content: question }
    setMessages(prev => [...prev, userMsg])
    setQuestion('')

    try {
      const token = localStorage.getItem('access_token')
      const res = await api.post('/legal/consult', { question: userMsg.content }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }])
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка консультации')
      setMessages(prev => [...prev, { role: 'assistant', content: 'Произошла ошибка. Попробуйте ещё раз.' }])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    'Какие права есть у потребителя при возврате товара?',
    'Как расторгнуть договор аренды?',
    'Какой срок исковой давности по гражданским делам?',
    'Что делать при незаконном увольнении?',
    'Как взыскать задолженность по расписке?',
    'Какие льготы положены многодетным семьям?',
  ]

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-semibold">AI-консультант</h1>
        </div>
        <p className="text-white/50">
          Задайте любой юридический вопрос — ответ основан на действующем законодательстве РФ
        </p>
      </div>

      <div className="disclaimer flex items-start gap-3">
        <BookOpen className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Важно:</strong> AI-консультант предоставляет информацию на основе действующего законодательства РФ,
          но не заменяет очную консультацию юриста. Все ответы носят информационный характер.
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardBody className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </CardBody>
        </Card>
      )}

      {/* Chat messages */}
      {messages.length > 0 && (
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl rounded-2xl px-5 py-4 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/20'
                  : 'glass'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {msg.role === 'assistant' && <Sparkles className="w-4 h-4 text-indigo-400" />}
                  <span className="text-xs text-white/40">{msg.role === 'user' ? 'Вы' : 'Laxly AI'}</span>
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="glass rounded-2xl px-5 py-4 flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span className="text-sm text-white/50">Анализирую законодательство...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suggestions */}
      {messages.length === 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Популярные вопросы</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setQuestion(s); }}
                  className="text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-sm text-white/70 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Input */}
      <Card>
        <CardBody>
          <form onSubmit={handleAsk} className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Задайте вопрос о законодательстве РФ..."
              className="glass-input flex-1"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(e); } }}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="btn-primary flex items-center gap-2 flex-shrink-0"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              <span className="hidden sm:inline">Отправить</span>
            </button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
