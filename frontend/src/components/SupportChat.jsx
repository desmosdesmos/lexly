import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Loader2, Minus, Headset, Smile, Camera, Image as ImageIcon } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)
  const { user } = useAuth()
  const messagesEndRef = useRef(null)
  const pollingRef = useRef(null)
  const fileInputRef = useRef(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const loadMessages = async (silent = false) => {
    try {
      const response = await api.get('/support/messages')
      const data = Array.isArray(response) ? response : (response.data || [])
      setMessages(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load support messages:', error)
    } finally {
      if (!silent) setInitialLoading(false)
    }
  }

  useEffect(() => {
    if (user && isOpen && !isMinimized) {
      loadMessages()
      pollingRef.current = setInterval(() => {
        loadMessages(true)
      }, 3000)
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [user, isOpen, isMinimized])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(scrollToBottom, 150)
    }
  }, [messages, isOpen, isMinimized])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Файл слишком большой (макс. 5МБ)')
        return
      }
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSend = async (e) => {
    if (e) e.preventDefault()
    if ((!message.trim() && !selectedImage) || loading) return

    const formData = new FormData()
    if (message.trim()) formData.append('message', message.trim())
    if (selectedImage) formData.append('image', selectedImage)

    setMessage('')
    setSelectedImage(null)
    setImagePreview(null)
    setLoading(true)

    try {
      await api.post('/support/message', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      await loadMessages(true)
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Ошибка отправки сообщения')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[999999] flex flex-col items-end" style={{ fontFamily: 'var(--font-family, inherit)' }}>
      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`
            flex flex-col mb-4 bg-[#1C1C1E] border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.7)] 
            transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform origin-bottom-right
            ${isMinimized 
              ? 'h-[72px] w-[280px] sm:w-[320px] rounded-[40px]' 
              : 'h-[75vh] sm:h-[580px] w-[calc(100vw-32px)] sm:w-[380px] rounded-[50px]'
            }
          `}
        >
          {/* Header */}
          <div 
            className="bg-gradient-to-br from-[#0A84FF] via-[#5E5CE6] to-[#BF5AF2] p-4 flex items-center justify-between relative overflow-hidden flex-shrink-0" 
            style={{ borderRadius: isMinimized ? '40px' : '50px 50px 0 0' }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-2xl flex items-center justify-center border border-white/30 shadow-2xl">
                <Headset className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base tracking-tight leading-tight">Поддержка</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400"></span>
                  </div>
                  <span className="text-white/80 text-[10px] font-bold uppercase tracking-wider">Online</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 relative z-10">
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-9 h-9 flex items-center justify-center hover:bg-white/20 rounded-xl transition-all text-white active:scale-90"
              >
                <Minus className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 flex items-center justify-center hover:bg-white/20 rounded-xl transition-all text-white active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          {!isMinimized && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar bg-gradient-to-b from-[#1C1C1E] to-[#121214]">
                {initialLoading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#0A84FF]/20 border-t-[#0A84FF] rounded-full animate-spin"></div>
                    <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Синхронизация...</span>
                  </div>
                ) : !Array.isArray(messages) || messages.length === 0 ? (
                  <div className="text-center py-12 px-8 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center mb-5 border border-white/10 shadow-2xl">
                      <Smile className="w-10 h-10 text-white/10" />
                    </div>
                    <h4 className="text-white font-bold text-base mb-2">Чем помочь?</h4>
                    <p className="text-white/40 text-[13px] leading-relaxed max-w-[200px] mx-auto">Мы на связи и готовы помочь с любым вопросом.</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`
                        max-w-[85%] p-3.5 rounded-[24px] shadow-lg transition-all
                        ${msg.sender === 'user' 
                          ? 'bg-gradient-to-br from-[#0A84FF] to-[#007AFF] text-white rounded-tr-none' 
                          : 'bg-[#2C2C2E] text-white/95 border border-white/5 rounded-tl-none'
                        }
                      `}>
                        {msg.image_url && (
                          <div className="mb-2 rounded-[18px] overflow-hidden border border-white/10 shadow-inner group">
                            <img 
                              src={msg.image_url.startsWith('http') ? msg.image_url : msg.image_url} 
                              alt="Attachment" 
                              className="max-w-full max-h-[280px] object-cover cursor-zoom-in hover:scale-105 transition-transform duration-700"
                              onClick={() => window.open(msg.image_url.startsWith('http') ? msg.image_url : msg.image_url, '_blank')}
                            />
                          </div>
                        )}
                        {msg.text && <p className="whitespace-pre-wrap break-words text-[14px] leading-[1.5] font-medium">{msg.text}</p>}
                      </div>
                      <span className="text-[9px] font-black text-white/10 mt-1.5 px-2 uppercase tracking-widest">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="px-4 py-3 bg-[#2C2C2E]/95 backdrop-blur-xl border-t border-white/10 flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-[#0A84FF] shadow-2xl">
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                    <button 
                      onClick={() => {setSelectedImage(null); setImagePreview(null)}}
                      className="absolute top-1 right-1 bg-black/70 rounded-full p-1 text-white hover:bg-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-xs font-bold truncate">{selectedImage.name}</p>
                    <p className="text-[#0A84FF] text-[10px] font-black uppercase tracking-wider mt-0.5">К отправке</p>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <form 
                onSubmit={handleSend} 
                className="p-4 bg-[#1C1C1E] border-t border-white/10" 
                style={{ borderRadius: '0 0 50px 50px' }}
              >
                <div className="relative flex items-end gap-2.5 bg-white/[0.03] rounded-[30px] p-2.5 border border-white/10 focus-within:border-[#0A84FF]/40 focus-within:bg-white/[0.06] transition-all duration-500">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 rounded-xl hover:bg-[#0A84FF]/10 flex items-center justify-center text-white/30 hover:text-[#0A84FF] transition-all active:scale-90 flex-shrink-0"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  
                  <textarea
                    rows="1"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value)
                      e.target.style.height = 'auto'
                      e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend(e)
                      }
                    }}
                    placeholder="Ваш вопрос..."
                    className="flex-1 bg-transparent border-none px-1 py-2 text-[14px] text-white placeholder-white/15 focus:ring-0 resize-none max-h-[100px] custom-scrollbar font-medium"
                  />
                  
                  <button
                    type="submit"
                    disabled={(!message.trim() && !selectedImage) || loading}
                    className="w-10 h-10 rounded-[20px] bg-gradient-to-br from-[#0A84FF] to-[#007AFF] flex items-center justify-center text-white disabled:opacity-10 disabled:scale-95 disabled:grayscale active:scale-90 transition-all flex-shrink-0 shadow-lg"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group focus:outline-none"
        >
          <div className="absolute inset-0 bg-[#0A84FF] rounded-full blur-[24px] opacity-20 group-hover:opacity-60 transition-opacity duration-700 animate-pulse"></div>
          
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-[30px] bg-gradient-to-tr from-[#0A84FF] via-[#5E5CE6] to-[#BF5AF2] shadow-2xl flex items-center justify-center text-white transition-all duration-700 hover:scale-110 active:scale-95 border border-white/20 group-hover:rotate-[6deg]">
            <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform duration-500" />
            
            {/* Notification badge */}
            <div className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3B30] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#FF3B30] border-2 border-[#1C1C1E]"></span>
            </div>
          </div>
          
          {/* Label on Hover */}
          <div className="absolute right-[80px] top-1/2 -translate-y-1/2 bg-[#1C1C1E]/95 backdrop-blur-xl border border-white/10 text-white text-[10px] font-black py-2 px-4 rounded-[20px] opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none whitespace-nowrap shadow-2xl translate-x-4 group-hover:translate-x-0 hidden lg:block tracking-widest">
            НУЖНА ПОМОЩЬ? <span className="text-[#0A84FF] ml-1">ПИШИТЕ!</span>
          </div>
        </button>
      )}
    </div>
  )
}
