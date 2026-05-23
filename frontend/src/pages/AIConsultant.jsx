import { useState, useRef, useMemo, useEffect } from 'react'
import { 
  MessageSquare, Loader2, AlertCircle, Send, Sparkles, BookOpen, Zap, 
  ShieldCheck, HelpCircle, History, ExternalLink, Globe, GraduationCap,
  Paperclip, FileText, X, Check, Copy, ChevronRight, User
} from 'lucide-react'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { toast } from 'react-toastify'
import api from '../services/api'

// --- Улучшенный процессор текста ---
function FormattedMessage({ content, isAssistant }) {
  if (!content) return null;
  
  const lines = String(content).split('\n');
  
  return (
    <div className={`space-y-4 font-sans text-sm sm:text-base leading-relaxed ${isAssistant ? 'text-white/90' : 'text-white'}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        
        // Разделитель
        if (trimmed === '---') {
          return <hr key={idx} className="border-white/10 my-6" />;
        }
        
        // Заголовки
        if (trimmed.startsWith('###')) {
          return <h3 key={idx} className="text-lg font-bold text-[#00D2FF] mt-8 mb-2 uppercase tracking-tight italic">
            {trimmed.replace(/^###\s*/, '')}
          </h3>;
        }
        if (trimmed.startsWith('##')) {
          return <h2 key={idx} className="text-xl font-bold text-white mt-10 mb-4 border-l-4 border-[#0A84FF] pl-5 uppercase tracking-widest">
            {trimmed.replace(/^##\s*/, '')}
          </h2>;
        }
        
        // Списки с номерами
        if (/^\d+\.\s/.test(trimmed)) {
           const num = trimmed.match(/^(\d+)\./)[1];
           return (
             <div key={idx} className="flex gap-4 ml-2 items-start py-1">
                <span className="text-[#00D2FF] font-bold italic">{num}.</span>
                <span className="flex-1">{trimmed.replace(/^\d+\.\s*/, '')}</span>
             </div>
           );
        }

        // Списки с маркерами
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return (
            <div key={idx} className="flex gap-3 ml-4 items-start py-1">
               <div className="w-1.5 h-1.5 rounded-full bg-[#0A84FF] mt-2.5 flex-shrink-0" />
               <span className="flex-1">{trimmed.replace(/^[\s*-]+\s*/, '')}</span>
            </div>
          );
        }

        // Жирный текст
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const formattedLine = parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-white bg-[#0A84FF]/20 px-1.5 py-0.5 rounded">{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        if (trimmed === '') return <div key={idx} className="h-2" />;

        return <p key={idx} className="font-medium text-white/80">{formattedLine}</p>;
      })}
    </div>
  );
}

export function AIConsultant() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const messagesEndRef = useRef(null)
  
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимум 10 МБ.')
      return
    }
    setSelectedFile(file)
  }

  const handleAsk = async (e) => {
    if (e) e.preventDefault()
    if (!question.trim() && !selectedFile) return
    
    setLoading(true)
    const userMsg = { 
      role: 'user', 
      content: question || 'Анализ прикрепленного документа',
      filename: selectedFile ? selectedFile.name : null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, userMsg])
    
    const currentQuestion = question
    const currentFile = selectedFile
    
    setQuestion('')
    setSelectedFile(null)

    try {
      let res
      if (currentFile) {
        const formData = new FormData()
        formData.append('question', currentQuestion || 'Проанализируй документ')
        formData.append('file', currentFile)
        res = await api.post('/legal/consult-file', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        res = await api.post('/legal/consult', { question: currentQuestion })
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: res.data.answer || '',
        sources: res.data.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    } catch (err) {
      const msg = err.response?.data?.detail || 'Ошибка консультации'
      toast.error(msg)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Произошла ошибка. Пожалуйста, попробуйте еще раз.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Текст скопирован')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-40 px-4 sm:px-0 min-h-screen">
      
      {/* Шапка чата */}
      <div className="pt-12 text-center space-y-6">
         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-[#00D2FF] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Юрист-консультант активен</span>
         </div>
         <h1 className="text-4xl sm:text-7xl font-bold text-white tracking-tighter uppercase italic leading-none">
            Правовой <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FF] via-[#0A84FF] to-[#7000FF]">Консультант.</span>
         </h1>
         <p className="text-white/20 text-lg font-bold uppercase tracking-widest max-w-2xl mx-auto leading-tight italic">
            Экспертные ответы • Ссылки на законы • Анализ документов
         </p>
      </div>

      {/* Сообщения */}
      <div className="space-y-12">
        {messages.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-10 animate-reveal">
             {[
               'Как правильно оформить увольнение по соглашению сторон?',
               'Проверь риски в моем договоре (прикрепите файл)',
               'Какой срок исковой давности по задолженности?',
               'Как взыскать долг без расписки через суд?'
             ].map((s, i) => (
               <button 
                 key={i} 
                 onClick={() => { setQuestion(s); }}
                 className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 text-left hover:border-[#00D2FF]/40 hover:bg-white/[0.03] transition-all group flex flex-col justify-between h-48"
               >
                  <div className="p-3 rounded-2xl bg-white/5 w-fit group-hover:scale-110 transition-transform">
                     <MessageSquare className="w-5 h-5 text-[#00D2FF]" />
                  </div>
                  <div>
                     <p className="text-white/40 text-[9px] font-bold uppercase mb-3 tracking-widest">Пример вопроса</p>
                     <p className="text-sm font-bold text-white/70 leading-relaxed italic">{s}</p>
                  </div>
               </button>
             ))}
          </div>
        ) : (
          <div className="space-y-16 pb-20">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
                <div className={`max-w-[95%] sm:max-w-[85%] space-y-4 ${msg.role === 'user' ? 'w-auto' : 'w-full'}`}>
                   <div className={`relative p-8 sm:p-10 rounded-[50px] shadow-2xl transition-all duration-500 border ${
                     msg.role === 'user' 
                       ? 'bg-gradient-to-br from-[#0A84FF] to-[#5E5CE6] text-white border-white/10 rounded-tr-xl' 
                       : 'bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-tl-xl'
                   }`}>
                      <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${msg.role === 'assistant' ? 'bg-[#00D2FF]/10 text-[#00D2FF]' : 'bg-white/10 text-white'}`}>
                               {msg.role === 'assistant' ? <Sparkles className="w-5 h-5" /> : <User className="w-5 h-5" />}
                            </div>
                            <div>
                               <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 leading-none">
                                  {msg.role === 'user' ? 'Ваш запрос' : 'Юридическая справка'}
                               </div>
                               <div className="text-[8px] font-bold text-white/20 mt-1 uppercase tracking-widest">{msg.timestamp}</div>
                            </div>
                         </div>
                         <div className="flex items-center gap-2">
                            {msg.filename && (
                               <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-2 text-[10px] font-bold text-[#00D2FF] uppercase italic">
                                  <FileText className="w-4 h-4" /> {msg.filename}
                               </div>
                            )}
                            <button 
                              onClick={() => handleCopyMessage(msg.content)}
                              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all"
                              title="Копировать ответ"
                            >
                               <Copy className="w-4 h-4" />
                            </button>
                         </div>
                      </div>

                      <FormattedMessage content={msg.content} isAssistant={msg.role === 'assistant'} />
                   </div>

                   {msg.sources && msg.sources.length > 0 && (
                     <div className="flex flex-wrap gap-3 px-8">
                        {msg.sources.map((src, idx) => (
                          <a key={idx} href={src.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5 text-[10px] font-bold text-white/40 hover:text-[#00D2FF] hover:border-[#00D2FF]/30 hover:bg-white/[0.05] transition-all">
                             <Globe className="w-4 h-4 text-[#00D2FF]/40" /> 
                             <span className="uppercase tracking-widest">{src.title}</span>
                             <ExternalLink className="w-3 h-3 opacity-20" />
                          </a>
                        ))}
                     </div>
                   )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                 <div className="p-10 rounded-[50px] bg-white/[0.01] border border-white/10 flex items-center gap-6 shadow-inner">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00D2FF]" />
                    <div className="space-y-1">
                       <span className="text-xs font-bold uppercase tracking-[0.4em] text-[#00D2FF] block">Анализ...</span>
                       <span className="text-[10px] font-medium text-white/20 uppercase tracking-widest">Поиск по базе законов РФ 2026</span>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Поле ввода */}
      <div className="fixed bottom-12 left-0 right-0 z-50">
         <div className="max-w-4xl mx-auto px-4">
            
            {selectedFile && (
               <div className="mb-4 flex items-center justify-between px-6 py-4 rounded-3xl bg-[#00D2FF]/10 border border-[#00D2FF]/30 text-[#00D2FF] shadow-lg animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-4">
                     <FileText className="w-6 h-6 animate-pulse" />
                     <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#00D2FF]/60">Документ загружен</span>
                        <div className="text-xs font-bold uppercase tracking-tighter truncate max-w-[200px] sm:max-w-sm text-white">{selectedFile.name}</div>
                     </div>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-all">
                     <X className="w-5 h-5" />
                  </button>
               </div>
            )}

            <Card className="rounded-[50px] border-white/10 bg-black/70 backdrop-blur-[40px] shadow-2xl overflow-hidden">
               <CardBody className="p-3">
                  <div className="flex items-center gap-3">
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.doc,.txt" />
                     <button 
                       onClick={() => fileInputRef.current?.click()}
                       className={`w-16 h-16 rounded-[28px] flex items-center justify-center transition-all ${selectedFile ? 'bg-[#00D2FF] text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                       title="Прикрепить файл"
                     >
                        <Paperclip className="w-7 h-7" />
                     </button>
                     
                     <form onSubmit={handleAsk} className="flex-1 flex gap-3">
                        <input
                          type="text"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder={selectedFile ? "Что найти в этом файле?" : "Задайте вопрос юристу..."}
                          className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-white/40 text-lg px-4 h-16 font-medium italic tracking-tight"
                          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
                        />
                        <button
                          type="submit"
                          disabled={loading || (!question.trim() && !selectedFile)}
                          className="px-10 h-16 rounded-[28px] bg-white text-black font-bold uppercase tracking-[0.2em] text-[11px] flex items-center gap-3 hover:scale-105 active:scale-95 disabled:opacity-10 transition-all shadow-2xl"
                        >
                           {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-5 h-5" />}
                           <span className="hidden sm:inline">Задать вопрос</span>
                        </button>
                     </form>
                  </div>
               </CardBody>
            </Card>
            
            <div className="mt-5 flex justify-center gap-10 text-[9px] font-bold uppercase tracking-[0.4em] text-white/5 italic">
               <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> Шифрование AES-256</div>
               <div className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" /> База законов РФ 2026</div>
               <div className="flex items-center gap-2"><Zap className="w-3.5 h-3.5" /> Высокая точность</div>
            </div>
         </div>
      </div>

    </div>
  )
}
