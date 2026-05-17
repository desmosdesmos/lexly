import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, X, Loader2, Minus, User } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, text: 'Здравствуйте! Я ваш AI-помощник и служба поддержки. Опишите вашу проблему или задайте вопрос.', sender: 'support', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ])
  const { user } = useAuth()
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom()
    }
  }, [messages, isOpen, isMinimized])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!message.trim() || loading) return

    const userMessage = {
      id: Date.now(),
      text: message.trim(),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setLoading(true)

    try {
      await api.post('/support/message', { message: userMessage.text })
      
      // Имитируем ответ поддержки (или подтверждение)
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: 'Ваше сообщение передано специалисту. Мы ответим вам в ближайшее время здесь или на почту.',
          sender: 'support',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }])
      }, 1000)
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Ошибка отправки сообщения')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className={`mb-4 w-[350px] sm:w-[380px] bg-[#1C1C1E] border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform ${isMinimized ? 'h-[60px]' : 'h-[500px]'}`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium text-sm">Поддержка Laxly</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-white/70 text-[10px]">В сети</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 h-[380px] overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[rgba(28,28,30,0.5)]">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.sender === 'user' 
                        ? 'bg-[#0A84FF] text-white rounded-tr-none' 
                        : 'bg-white/5 text-white/90 border border-white/10 rounded-tl-none'
                    }`}>
                      <p>{msg.text}</p>
                      <span className={`text-[10px] block mt-1 ${msg.sender === 'user' ? 'text-white/60' : 'text-white/30'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 bg-[#1C1C1E] border-t border-white/5 flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#0A84FF] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!message.trim() || loading}
                  className="w-10 h-10 rounded-xl bg-[#0A84FF] flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#007AFF] transition-colors"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6] shadow-xl shadow-blue-500/20 flex items-center justify-center text-white hover:scale-110 transition-transform active:scale-95 group"
        >
          <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#1C1C1E] flex items-center justify-center text-[10px] font-bold">1</span>
        </button>
      )}
    </div>
  )
}
