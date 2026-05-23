import { useState, useCallback, useEffect } from 'react'
import { 
  FileText, Upload, AlertCircle, CheckCircle, Loader2, Shield, ShieldAlert, 
  ShieldCheck, Wand2, Copy, Download, Eye, Sparkles, TrendingUp, AlertTriangle, 
  ArrowRight, Info, Check, X, FileSearch, Zap
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { contractsAPI } from '../services/api'
import { toast } from 'react-toastify'

const riskConfig = {
  low: { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Низкий', badge: 'bg-green-100 text-green-800' },
  medium: { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Средний', badge: 'bg-yellow-100 text-yellow-800' },
  high: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Высокий', badge: 'bg-red-100 text-red-800' },
  critical: { color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'Критический', badge: 'bg-gray-900 text-white' },
}

const severityMap = {
  critical: { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Критический' },
  medium: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Внимание' },
  low: { icon: Info, color: 'text-[#0A84FF]', bg: 'bg-[#0A84FF]/10', border: 'border-[#0A84FF]/20', label: 'Рекомендация' },
}

export function ContractCheck() {
  const [file, setFile] = useState(null)
  const [textInput, setTextInput] = useState('')
  const [inputMode, setInputMode] = useState('file') // 'file' or 'text'
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [fixing, setFixing] = useState(false)
  const [fixedContent, setFixedContent] = useState(null)
  const [showFixed, setShowFixed] = useState(false)

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError('')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (inputMode === 'file' && !file) {
      toast.error('Выберите файл')
      return
    }
    
    if (inputMode === 'text' && textInput.length < 100) {
      toast.error('Текст слишком короткий для анализа (минимум 100 символов)')
      return
    }

    setLoading(true)
    setResult(null)
    setFixedContent(null)
    setShowFixed(false)
    
    try {
      let response
      if (inputMode === 'file') {
        response = await contractsAPI.review(file)
      } else {
        const token = localStorage.getItem('access_token')
        const res = await fetch('/api/v1/contracts/review-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            text: textInput,
            filename: `text_audit_${new Date().toLocaleDateString()}.txt`
          }),
        })
        
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.detail?.message || err.detail || 'Ошибка анализа текста')
        }
        response = await res.json()
      }
      
      setResult(response)
      toast.success('Аудит завершен!')
    } catch (err) {
      const msg = err.message || err.response?.data?.detail || 'Ошибка проверки'
      toast.error(typeof msg === 'string' ? msg : 'Лимит превышен')
    } finally {
      setLoading(false)
    }
  }

  const handleFix = async () => {
    if (!result?.id) return
    setFixing(true)
    try {
      const token = localStorage.getItem('access_token')
      const res = await fetch(`/api/v1/contracts/${result.id}/fix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ review_id: result.id }),
      })
      if (!res.ok) throw new Error('Ошибка корректировки')
      const data = await res.json()
      setFixedContent(data.fixed_content)
      setShowFixed(true)
      toast.success('AI исправил договор!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setFixing(false)
    }
  }

  const a = result?.analysis || {}
  const score = a.score || 100
  const rStyle = riskConfig[a.risk_level] || riskConfig.low

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-2 sm:px-0">
      {/* Hero Section */}
      <div className="relative p-10 rounded-[50px] bg-gradient-to-br from-[#0A84FF]/10 to-transparent border border-white/5 overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0A84FF]/10 border border-[#0A84FF]/20 text-[#0A84FF] text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-3 h-3" /> Премиум Аудит
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight uppercase italic">
              Проверка <br /> <span className="text-[#0A84FF]">договора</span>
            </h1>
            <p className="text-white/40 text-lg font-medium leading-relaxed max-w-lg">
              Мгновенный поиск юридических ловушек, оценка рисков по 100-балльной шкале и автоматическое исправление текста.
            </p>
          </div>
          
          <div className="hidden lg:flex justify-center">
            <div className="relative">
               <div className="absolute -inset-10 bg-[#0A84FF]/20 blur-[80px] rounded-full animate-pulse" />
               <Card className="relative w-64 h-64 rounded-full border-white/10 bg-black/40 flex items-center justify-center border-8">
                  <div className="text-center">
                    <div className="text-6xl font-black text-white italic tracking-tighter">AI</div>
                    <div className="text-[10px] font-black text-[#0A84FF] uppercase tracking-[0.2em] mt-2">Audit System</div>
                  </div>
               </Card>
            </div>
          </div>
        </div>
      </div>

      {!result && (
        <div className="max-w-3xl mx-auto animate-in fade-in duration-700 space-y-6">
          {/* Mode Toggle */}
          <div className="flex p-1.5 bg-white/5 rounded-[22px] border border-white/5 backdrop-blur-md w-fit mx-auto">
            <button
              onClick={() => setInputMode('file')}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                inputMode === 'file'
                  ? 'bg-[#0A84FF] text-white shadow-[0_0_20px_rgba(10,132,255,0.3)]'
                  : 'text-white/30 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Файл
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                inputMode === 'text'
                  ? 'bg-[#0A84FF] text-white shadow-[0_0_20px_rgba(10,132,255,0.3)]'
                  : 'text-white/30 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Текст
            </button>
          </div>

          <Card className="rounded-[50px] border-white/5 bg-white/[0.02] shadow-2xl overflow-hidden">
            <CardBody className="p-10 sm:p-16">
               <form onSubmit={handleSubmit} className="space-y-8">
                  {inputMode === 'file' ? (
                    <div
                      {...getRootProps()}
                      className={`
                        relative group cursor-pointer p-12 rounded-[40px] border-2 border-dashed transition-all duration-500
                        ${isDragActive ? 'border-[#0A84FF] bg-[#0A84FF]/5' : 'border-white/10 hover:border-white/20 bg-white/[0.01]'}
                      `}
                    >
                      <input {...getInputProps()} />
                      <div className="text-center space-y-4">
                        {file ? (
                          <div className="animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-[#0A84FF]/10 rounded-3xl flex items-center justify-center mx-auto text-[#0A84FF] mb-4">
                              <FileText className="w-10 h-10" />
                            </div>
                            <h4 className="text-xl font-bold text-white truncate max-w-xs mx-auto">{file.name}</h4>
                            <p className="text-white/30 text-sm">{(file.size / 1024).toFixed(1)} KB • Нажмите, чтобы заменить</p>
                          </div>
                        ) : (
                          <>
                            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-white/20 group-hover:scale-110 group-hover:text-[#0A84FF] transition-all duration-500">
                              <Upload className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-xl font-bold text-white">Загрузите ваш контракт</h4>
                              <p className="text-white/30 text-sm">Перетащите файл или нажмите для выбора</p>
                            </div>
                            <div className="flex justify-center gap-4 pt-4">
                               <span className="text-[10px] font-black text-white/10 uppercase tracking-widest border border-white/5 px-3 py-1 rounded-lg">PDF</span>
                               <span className="text-[10px] font-black text-white/10 uppercase tracking-widest border border-white/5 px-3 py-1 rounded-lg">DOCX</span>
                               <span className="text-[10px] font-black text-white/10 uppercase tracking-widest border border-white/5 px-3 py-1 rounded-lg">10 MB MAX</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-500">
                       <div className="relative">
                          <textarea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Вставьте текст договора для мгновенного аудита..."
                            className="w-full h-80 bg-white/5 border border-white/10 rounded-[30px] p-8 text-white/80 font-medium placeholder:text-white/10 focus:outline-none focus:border-[#0A84FF]/50 transition-all resize-none"
                          />
                          <div className="absolute bottom-6 right-8 text-[10px] font-black text-white/10 uppercase tracking-widest">
                            {textInput.length} символов
                          </div>
                       </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading || (inputMode === 'file' ? !file : !textInput.trim())}
                    className="w-full h-20 rounded-[30px] font-black uppercase tracking-[0.2em] text-sm gap-4 shadow-[0_20px_50px_rgba(10,132,255,0.2)] hover:shadow-[0_20px_60px_rgba(10,132,255,0.3)] transition-all active:scale-95"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Shield className="w-6 h-6" />}
                    {loading ? 'Идет глубокий аудит...' : 'Запустить анализ рисков'}
                  </Button>
               </form>
            </CardBody>
          </Card>
        </div>
      )}

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Main Score Card */}
            <div className="lg:col-span-1 space-y-8">
               <div className={`p-10 rounded-[50px] border ${rStyle.border} ${rStyle.bg} text-center space-y-6 relative overflow-hidden group`}>
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Shield className="w-40 h-40" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40">Risk Score</p>
                  <div className={`text-8xl font-black italic tracking-tighter ${rStyle.color}`}>{score}</div>
                  <div className="space-y-1">
                    <div className={`text-xl font-black uppercase italic tracking-widest ${rStyle.color}`}>{rStyle.label} Риск</div>
                    <p className="text-[10px] text-white/30 font-bold">Оценка безопасности документа</p>
                  </div>
                  <div className="pt-6">
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <div 
                        className={`h-full transition-all duration-1000 ease-out ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${score}%` }}
                       />
                    </div>
                  </div>
               </div>

               <Card className="rounded-[40px] border-white/5 bg-white/[0.02]">
                  <CardBody className="p-8 space-y-6">
                    <div className="flex items-center gap-3 text-white/40">
                      <TrendingUp className="w-5 h-5 text-[#0A84FF]" />
                      <h3 className="font-black uppercase tracking-widest text-[10px]">Вердикт AI</h3>
                    </div>
                    <p className="text-white/70 text-sm font-medium leading-relaxed italic">
                      "{a.summary}"
                    </p>
                    <div className="pt-4 border-t border-white/5">
                       <Button 
                        variant="secondary" 
                        onClick={() => setResult(null)}
                        className="w-full rounded-2xl h-14 font-bold text-xs uppercase tracking-widest bg-white/5 hover:bg-white/10"
                       >
                         Проверить другой
                       </Button>
                    </div>
                  </CardBody>
               </Card>
            </div>

            {/* Risks List */}
            <div className="lg:col-span-2 space-y-8">
               <div className="flex items-center justify-between px-4">
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-wider flex items-center gap-3">
                    <ShieldAlert className="w-7 h-7 text-red-500" /> Выявленные угрозы
                  </h2>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{a.risks?.length || 0} совпадений</span>
               </div>

               <div className="space-y-4">
                  {a.risks?.map((risk, idx) => {
                    const s = severityMap[risk.severity] || severityMap.low
                    return (
                      <div key={idx} className={`p-8 rounded-[40px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group relative overflow-hidden`}>
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${s.color.replace('text', 'bg')}`} />
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                           <div className="space-y-4 flex-1">
                              <div className="flex items-center gap-3">
                                 <s.icon className={`w-5 h-5 ${s.color}`} />
                                 <h3 className="text-lg font-bold text-white">{risk.title}</h3>
                                 <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${s.bg} ${s.color} border border-current opacity-50`}>
                                   {s.label}
                                 </span>
                              </div>
                              <p className="text-white/50 text-sm font-medium leading-relaxed">{risk.description}</p>
                              <div className="p-5 rounded-2xl bg-green-500/5 border border-green-500/10 space-y-2">
                                 <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest">
                                    <CheckCircle className="w-3.5 h-3.5" /> Рекомендация
                                 </div>
                                 <p className="text-green-200/60 text-xs font-medium">{risk.recommendation}</p>
                              </div>
                           </div>
                        </div>
                      </div>
                    )
                  })}
               </div>

               {/* AI Fix Section */}
               {!showFixed && (
                 <div className="p-10 rounded-[50px] bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/20 space-y-6 text-center animate-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto text-purple-400 mb-4">
                      <Wand2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white uppercase italic tracking-wider">Умная корректировка</h3>
                      <p className="text-white/40 text-sm max-w-md mx-auto font-medium">
                        AI может автоматически переписать проблемные пункты, убрав риски и сохранив вашу выгоду.
                      </p>
                    </div>
                    <Button
                      onClick={handleFix}
                      disabled={fixing}
                      className="h-16 px-10 rounded-[25px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 font-black uppercase tracking-widest text-xs gap-3 shadow-[0_15px_40px_rgba(147,51,234,0.3)]"
                    >
                      {fixing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      {fixing ? 'Переписываю договор...' : 'Исправить все риски'}
                    </Button>
                 </div>
               )}
            </div>
          </div>

          {/* Fixed Content Modal/Section */}
          {showFixed && fixedContent && (
            <div className="animate-in slide-in-from-bottom-10 duration-700">
               <Card className="rounded-[50px] border-purple-500/30 bg-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden">
                  <CardHeader className="p-10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-wider">Безопасная версия</h3>
                        <p className="text-white/30 text-xs font-bold uppercase tracking-widest">AI сформировал исправленный текст</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                       <Button 
                        variant="secondary" 
                        onClick={() => window.open(`/api/v1/contracts/${result.id}/download-fixed`, '_blank')}
                        className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] gap-2 bg-white/5 hover:bg-white/10"
                       >
                         <Download className="w-4 h-4" /> Скачать .DOCX
                       </Button>
                       <Button 
                        variant="primary" 
                        onClick={() => { navigator.clipboard.writeText(fixedContent); toast.info('Скопировано'); }}
                        className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] gap-2 bg-[#0A84FF]"
                       >
                         <Copy className="w-4 h-4" /> Копировать
                       </Button>
                    </div>
                  </CardHeader>
                  <CardBody className="p-10 pt-6">
                    <div className="p-8 rounded-[35px] bg-black/40 border border-white/5 font-mono text-sm text-white/70 leading-relaxed max-h-[600px] overflow-y-auto scrollbar-hide select-all">
                       <pre className="whitespace-pre-wrap font-sans">{fixedContent}</pre>
                    </div>
                  </CardBody>
               </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
