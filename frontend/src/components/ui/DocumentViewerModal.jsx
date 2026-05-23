import { useState } from 'react'
import { FileText, Download, X, Copy, ShieldCheck } from 'lucide-react'
import { toast } from 'react-toastify'

export function DocumentViewerModal({ isOpen, onClose, document }) {
  if (!isOpen || !document) return null

  const getDocTitle = (type) => {
    const titles = {
      claim: 'Исковое заявление',
      complaint: 'Жалоба',
      demand: 'Претензия',
      contract_sale: 'Договор купли-продажи',
      contract_employment: 'Трудовой договор',
      power_of_attorney: 'Доверенность'
    }
    return titles[String(type || '').toLowerCase()] || 'Юридический документ'
  }

  const handleDownloadTxt = () => {
    const blob = new Blob([document.generated_content || document.analysis_result || 'Нет данных'], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = `${document.document_type || 'document'}_${document.id.split('-')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Документ скачан (TXT)')
  }

  const handleDownloadDocx = () => {
    try {
      const contentHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Document</title></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          ${content.replace(/\n/g, '<br>')}
        </body>
        </html>
      `
      const blob = new Blob(['\ufeff', contentHtml], { type: 'application/msword' })
      const url = URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      const filename = isContract ? document.original_file_name : getDocTitle(document.document_type)
      a.download = `${filename}.doc`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Документ скачан (.doc)')
    } catch (e) {
      console.error('Download error:', e)
      toast.error('Не удалось скачать файл')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(document.generated_content || document.analysis_result || '')
    toast.success('Текст скопирован в буфер обмена')
  }

  const content = document.generated_content || document.analysis_result || 'Содержимое отсутствует или еще не сгенерировано.'
  const isContract = document.type === 'contract'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0a0a0c] border border-white/10 rounded-[32px] overflow-hidden flex flex-col shadow-2xl animate-in">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isContract ? 'bg-amber-500/10 text-amber-500' : 'bg-[#0A84FF]/10 text-[#0A84FF]'}`}>
              {isContract ? <ShieldCheck className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{isContract ? document.original_file_name : getDocTitle(document.document_type)}</h2>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">
                ID: {document.id.split('-')[0]} • Дата: {new Date(document.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button
               onClick={handleCopy}
               className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold text-white/70 hover:text-white flex items-center gap-2"
             >
               <Copy className="w-4 h-4" /> Копировать
             </button>
             <button
               onClick={onClose}
               className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/50 hover:text-white"
             >
               <X className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/20">
          <div className="max-w-3xl mx-auto prose prose-invert prose-p:text-sm prose-p:leading-relaxed prose-headings:font-bold prose-a:text-[#0A84FF]">
            {isContract && document.risk_score !== undefined && (
               <div className="mb-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                     <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Уровень риска</div>
                     <div className="text-2xl font-black text-white">{document.risk_score} <span className="text-white/20 text-sm">/ 100</span></div>
                  </div>
               </div>
            )}
            
            <pre className="whitespace-pre-wrap font-sans text-[13px] text-white/70 leading-[1.8] bg-transparent p-0 m-0">
              {content}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/5 bg-[#0a0a0c] flex items-center justify-between flex-shrink-0">
           <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
              Шифрование AES-256
           </span>
           <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadTxt}
                className="h-12 px-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold text-white/80 hover:text-white flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Скачать TXT
              </button>
              <button
                onClick={handleDownloadDocx}
                className="h-12 px-8 rounded-2xl bg-[#0A84FF] text-white font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <FileText className="w-4 h-4" /> Скачать DOCX
              </button>
           </div>
        </div>

      </div>
    </div>
  )
}
