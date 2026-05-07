import { useState } from 'react'
import { Sparkles, Loader2, Check, Wand2 } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../../services/api'

/**
 * AI-помощник для текстовых полей конструктора документов.
 * 
 * Два режима:
 * - improve: Улучшить текст пользователя (перевести на юридический язык)
 * - generate: Сгенерировать текст на основе обстоятельств дела
 * 
 * Для правового обоснования и требований — если поле пустое, AI генерирует 
 * на основе обстоятельств. Если поле заполнено — AI улучшает текст.
 */
export function AIFieldHelper({ 
  value, 
  onChange, 
  placeholder, 
  label,
  type = 'textarea',
  rows = 3,
  context = '',        // Тип документа: claim, complaint, demand
  field = '',           // Имя поля: circumstances, legal_basis, claims
  circumstances = '',   // Текст обстоятельств дела (для генерации)
  className = ''
}) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Определяем режим: если поле пустое и это legal_basis/claims — генерируем
  const isEmpty = !value || value.trim().length < 5
  const canGenerate = isEmpty && (field === 'legal_basis' || field === 'claims') && circumstances && circumstances.length >= 20
  const canImprove = !canGenerate && value && value.trim().length >= 10

  const handleClick = async () => {
    if (!canGenerate && !canImprove) {
      if (isEmpty) {
        if (field === 'legal_basis' || field === 'claims') {
          toast.info(`Опишите обстоятельства дела (минимум 20 символов), чтобы AI мог ${field === 'legal_basis' ? 'подобрать нормы' : 'сформулировать требования'}`)
        } else {
          toast.info('Введите текст (минимум 10 символов), чтобы AI мог его улучшить')
        }
      } else {
        toast.info('Введите минимум 10 символов для улучшения')
      }
      return
    }

    setLoading(true)
    setSuccess(false)

    try {
      const token = localStorage.getItem('access_token')
      const mode = canGenerate ? 'generate' : 'improve'
      
      const res = await api.post('/documents/ai-suggest', {
        mode,
        text: canImprove ? value : undefined,
        circumstances: circumstances,
        context: context,
        field: field,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.suggested_text) {
        onChange(res.data.suggested_text)
        setSuccess(true)
        toast.success(canGenerate ? 'AI сгенерировал текст на основе обстоятельств!' : 'Текст улучшен AI!')
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка AI-помощника')
    } finally {
      setLoading(false)
    }
  }

  const InputComponent = type === 'textarea' ? 'textarea' : 'input'

  return (
    <div className={`relative ${className}`}>
      {label && (
        <div className="flex items-center gap-2 mb-1">
          <label className="block text-sm font-medium text-white/60">{label}</label>
          <button
            onClick={handleClick}
            disabled={loading}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-all ${
              loading
                ? 'bg-indigo-500/20 text-indigo-300 cursor-wait'
                : success
                ? 'bg-green-500/20 text-green-300'
                : canGenerate
                ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                : canImprove
                ? 'bg-white/5 text-white/30 hover:bg-indigo-500/20 hover:text-indigo-300'
                : 'bg-white/5 text-white/20 hover:bg-indigo-500/20 hover:text-indigo-300'
            }`}
            title={canGenerate ? 'Сгенерировать на основе обстоятельств' : canImprove ? 'Улучшить текст с помощью AI' : 'AI-помощник'}
          >
            {loading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                AI думает...
              </>
            ) : success ? (
              <>
                <Check className="w-3 h-3" />
                Готово
              </>
            ) : canGenerate ? (
              <>
                <Wand2 className="w-3 h-3" />
                AI: создать
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                AI
              </>
            )}
          </button>
          {canGenerate && (
            <span className="text-xs text-purple-400/60">Нажмите, чтобы AI создал текст на основе обстоятельств</span>
          )}
        </div>
      )}

      <div className="relative">
        {InputComponent === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="glass-input w-full resize-y pr-10"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="glass-input w-full pr-10"
          />
        )}

        {!label && (
          <button
            onClick={handleClick}
            disabled={loading}
            className={`absolute right-2 top-2 p-1.5 rounded-lg transition-all ${
              loading
                ? 'bg-indigo-500/20 text-indigo-300'
                : success
                ? 'bg-green-500/20 text-green-300'
                : 'text-white/20 hover:text-indigo-400 hover:bg-indigo-500/10'
            }`}
            title="AI-помощник"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : success ? (
              <Check className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}
