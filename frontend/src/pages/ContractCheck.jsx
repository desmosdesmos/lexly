import { useState, useCallback } from 'react'
import { FileText, Upload, AlertCircle, CheckCircle, Loader2, Shield, ShieldAlert, ShieldCheck, Wand2, Copy, Download, Eye } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { contractsAPI } from '../services/api'
import { toast } from 'react-toastify'

const riskConfig = {
  low: { color: 'bg-green-500', label: 'Низкий', badge: 'bg-green-100 text-green-800' },
  medium: { color: 'bg-yellow-500', label: 'Средний', badge: 'bg-yellow-100 text-yellow-800' },
  high: { color: 'bg-destructive', label: 'Высокий', badge: 'bg-red-100 text-red-800' },
  critical: { color: 'bg-gray-900', label: 'Критический', badge: 'bg-gray-900 text-white' },
}

export function ContractCheck() {
  const [file, setFile] = useState(null)
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
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0]
      if (rejection.errors[0].code === 'file-too-large') {
        setError('Файл слишком большой. Максимальный размер: 10 МБ')
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        setError('Неподдерживаемый формат. Поддерживаются: PDF, DOC, DOCX')
      } else {
        setError('Ошибка загрузки файла')
      }
    },
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      setError('Выберите файл для проверки')
      return
    }

    setError('')
    setLoading(true)
    setResult(null)
    setFixedContent(null)
    setShowFixed(false)

    try {
      const response = await contractsAPI.review(file)
      setResult(response)
      toast.success('Договор отправлен на проверку!')
    } catch (err) {
      const message = err.response?.data?.detail || 'Ошибка проверки договора'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleFix = async () => {
    if (!result?.id) {
      toast.error('Сначала проверьте договор')
      return
    }

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

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Ошибка корректировки')
      }

      const data = await res.json()
      setFixedContent(data.fixed_content)
      setShowFixed(true)
      toast.success(`AI исправил ${data.fixed_risks_count} проблем в договоре!`)
    } catch (err) {
      toast.error(err.message || 'Ошибка AI-корректировки')
    } finally {
      setFixing(false)
    }
  }

  const copyFixedContent = () => {
    if (fixedContent) {
      navigator.clipboard.writeText(fixedContent)
      toast.success('Текст скопирован в буфер обмена')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-semibold">Проверка договоров</h1>
        </div>
        <p className="text-muted-foreground">
          Загрузите договор, и AI проанализирует его на наличие рисков
        </p>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer">
        <strong>Внимание:</strong> Анализ договора носит рекомендательный характер.
        Обязательно проконсультируйтесь с юристом перед подписанием.
      </div>

      {error && (
        <Alert variant="error">
          <AlertCircle className="w-5 h-5" />
          {error}
        </Alert>
      )}

      {result && (
        <Alert variant="success">
          <CheckCircle className="w-5 h-5" />
          <div>
            <strong>Договор загружен!</strong> ID: {result.contract_review_id}. Статус: {result.status}
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <div
                  {...getRootProps()}
                  className={`dropzone ${isDragActive ? 'active' : ''}`}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-[#0A84FF] mx-auto mb-4" />
                      <h4 className="font-medium mb-1">{file.name}</h4>
                      <p className="text-sm text-white/40 mb-2">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                      <p className="text-sm text-white/40">
                        Нажмите или перетащите файл, чтобы заменить
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-white/30 mx-auto mb-4" />
                      <h4 className="font-medium mb-1">Перетащите файл сюда</h4>
                      <p className="text-sm text-white/40 mb-2">
                        или нажмите для выбора
                      </p>
                      <p className="text-sm text-white/30">
                        Поддерживаются: PDF, DOC, DOCX (макс. 10 МБ)
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-4"
                  disabled={loading || !file}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Анализ...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Проверить договор
                    </>
                  )}
                </Button>
              </form>
            </CardBody>
          </Card>

          {/* Results */}
          {result && result.analysis && (
            <Card className="mt-6">
              <CardBody>
                <h3 className="text-xl font-semibold mb-4">Результат анализа</h3>
                
                <Alert
                  variant={
                    result.analysis.risk_level === 'high' ? 'error' :
                    result.analysis.risk_level === 'medium' ? 'warning' : 'info'
                  }
                  className="mb-6"
                >
                  <div>
                    <strong>Общий уровень риска:</strong>{' '}
                    <span className={`px-2 py-1 rounded-full text-sm ${riskConfig[result.analysis.risk_level]?.badge}`}>
                      {riskConfig[result.analysis.risk_level]?.label}
                    </span>
                  </div>
                </Alert>

                <p className="mb-6">{result.analysis.summary}</p>

                <h4 className="font-semibold mb-4">Выявленные риски:</h4>
                <div className="space-y-4">
                  {result.analysis.risks.map((risk) => (
                    <div key={risk.id} className={`risk-item ${risk.severity} p-4 rounded-xl bg-white/5 border border-white/5`}>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {risk.severity === 'high' || risk.severity === 'critical' ? (
                            <ShieldAlert className="w-5 h-5 text-destructive" />
                          ) : (
                            <ShieldCheck className="w-5 h-5 text-yellow-600" />
                          )}
                          <strong className="text-sm sm:text-base">{risk.clause}</strong>
                        </div>
                        <span className={`self-start sm:self-auto px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${riskConfig[risk.severity]?.badge}`}>
                          {riskConfig[risk.severity]?.label}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm mb-2">
                        <strong className="text-white/70">Условие:</strong> {risk.text}
                      </p>
                      <p className="text-xs sm:text-sm mb-2">
                        <strong className="text-white/70">Пояснение:</strong> {risk.explanation}
                      </p>
                      <p className="text-xs sm:text-sm">
                        <strong className="text-white/70">Рекомендация:</strong> {risk.recommendation}
                      </p>
                    </div>
                  ))}
                </div>

                <h4 className="font-semibold mt-6 mb-3">Общие рекомендации:</h4>
                <ul className="space-y-2">
                  {result.analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>

                {/* Кнопка AI: исправить */}
                {result.analysis.risks && result.analysis.risks.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <Wand2 className="w-6 h-6 text-purple-400" />
                      <h4 className="text-lg font-semibold">AI-корректировка</h4>
                    </div>
                    <p className="text-sm text-white/60 mb-4">
                      AI автоматически исправит найденные проблемы в договоре, сохранив остальной текст без изменений.
                      {result.analysis.risks.length > 0 && ` Будет исправлено рисков: ${result.analysis.risks.length}.`}
                    </p>
                    <button
                      onClick={handleFix}
                      disabled={fixing}
                      className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        fixing
                          ? 'bg-purple-500/20 text-purple-300 cursor-wait'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                      }`}
                    >
                      {fixing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          AI исправляет...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5" />
                          AI: Исправить все риски ({result.analysis.risks.length})
                        </>
                      )}
                    </button>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* Исправленный договор */}
          {showFixed && fixedContent && (
            <Card className="mt-6 border-purple-500/30">
              <CardBody>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <h3 className="text-xl font-semibold">Исправленный договор</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={copyFixedContent}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Копировать
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans">{fixedContent}</pre>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <button
                    onClick={() => window.open(`/api/v1/contracts/${result.id}/download-fixed`, '_blank')}
                    className="flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Скачать .docx
                  </button>
                  <button
                    onClick={copyFixedContent}
                    className="sm:px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Копировать
                  </button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <Card>
            <CardBody>
              <h3 className="font-semibold mb-4">Что проверяется</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Штрафные санкции и неустойки</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Скрытые обязательства</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Невыгодные условия</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Подсудность споров</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Сроки и порядок оплаты</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Ответственность сторон</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Порядок расторжения</span>
                </li>
              </ul>
            </CardBody>
          </Card>

          <Card className="mt-4">
            <CardBody>
              <h3 className="font-semibold mb-4">Уровни рисков</h3>
              <div className="space-y-3">
                {Object.entries(riskConfig).map(([key, config]) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${config.color}`} />
                    <span className="text-sm">{config.label}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
