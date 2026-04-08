import { useState } from 'react'
import { FileText, Sparkles, AlertCircle, CheckCircle, Loader2, Copy, Download } from 'lucide-react'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Select } from '../components/ui/Select'
import { Alert } from '../components/ui/Alert'
import { PaywallModal } from '../components/ui/PaywallModal'
import { documentsAPI } from '../services/api'
import { toast } from 'react-toastify'

export function DocumentGenerator() {
  const [documentType, setDocumentType] = useState('claim')
  const [showPaywall, setShowPaywall] = useState(false)
  const [formData, setFormData] = useState({
    court_name: '',
    plaintiff_name: '',
    plaintiff_inn: '',
    plaintiff_address: '',
    defendant_name: '',
    defendant_inn: '',
    defendant_address: '',
    circumstances: '',
    legal_basis: '',
    claims: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setResult(null)

    try {
      let data
      if (documentType === 'claim') {
        data = {
          court_name: formData.court_name,
          plaintiff: {
            name: formData.plaintiff_name,
            inn: formData.plaintiff_inn || undefined,
            address: formData.plaintiff_address || undefined,
          },
          defendant: {
            name: formData.defendant_name,
            inn: formData.defendant_inn || undefined,
            address: formData.defendant_address || undefined,
          },
          circumstances: formData.circumstances,
          legal_basis: formData.legal_basis || undefined,
          claims: formData.claims.split('\n').filter((c) => c.trim()),
        }
      } else if (documentType === 'complaint') {
        data = {
          authority_name: formData.authority_name,
          applicant: {
            name: formData.applicant_name,
            inn: formData.applicant_inn || undefined,
            address: formData.applicant_address || undefined,
          },
          interested_party: { name: formData.interested_party || undefined },
          appealed_action: formData.appealed_action,
          grounds: formData.grounds || undefined,
          claims: formData.claims.split('\n').filter((c) => c.trim()),
        }
      } else {
        // demand
        data = {
          demander: {
            name: formData.defendant_name,
            inn: formData.defendant_inn || undefined,
            address: formData.defendant_address || undefined,
          },
          demander_from: {
            name: formData.plaintiff_name,
            inn: formData.plaintiff_inn || undefined,
            address: formData.plaintiff_address || undefined,
          },
          demand_basis: formData.circumstances || formData.demand_basis || '',
          claims: formData.claims.split('\n').filter((c) => c.trim()),
        }
      }

      const response = await documentsAPI.generate(documentType, data)
      setResult(response)
      toast.success('Документ успешно создан!')
    } catch (err) {
      const detail = err.response?.data?.detail
      const status = err.response?.status

      // Paywall — лимит исчерпан
      if (status === 402 || (detail && typeof detail === 'object' && detail.type === 'limit_exceeded')) {
        setShowPaywall(true)
        setError(detail?.message || 'Вы достигли лимита. Перейдите на Pro для разблокировки.')
        return
      }

      const message = typeof detail === 'string' ? detail : 'Ошибка генерации документа'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} resource="documents" />

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-semibold">Генератор документов</h1>
        </div>
        <p className="text-white/50">
          Заполните форму, и AI создаст юридически грамотный документ
        </p>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer">
        <strong>Внимание:</strong> Сгенерированный документ является шаблоном.
        Рекомендуется проверить его у юриста перед использованием.
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
            <strong>Документ создан!</strong>
          </div>
        </Alert>
      )}

      {/* Generated document content */}
      {result && result.generated_content && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Сгенерированный документ</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.generated_content)
                    toast.success('Скопировано!')
                  }}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <Copy className="w-4 h-4" /> Копировать текст
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([result.generated_content], { type: 'text/plain;charset=utf-8' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `document_${result.id || 'result'}.txt`
                    a.click()
                    URL.revokeObjectURL(url)
                    toast.success('TXT скачан!')
                  }}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                >
                  <Download className="w-4 h-4" /> .TXT
                </button>
                <button
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('access_token')
                      const res = await fetch(`/api/v1/documents/${result.id}/download`, {
                        headers: { Authorization: `Bearer ${token}` },
                      })
                      if (!res.ok) throw new Error('Ошибка скачивания')
                      const blob = await res.blob()
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${result.document_type || 'document'}_${result.id}.docx`
                      a.click()
                      URL.revokeObjectURL(url)
                      toast.success('DOCX скачан!')
                    } catch (e) {
                      toast.error('Ошибка скачивания DOCX')
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors font-semibold"
                >
                  <Download className="w-4 h-4" /> Скачать .DOCX
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap bg-muted p-6 rounded-lg text-sm leading-relaxed font-sans max-h-[70vh] overflow-y-auto">
              {result.generated_content}
            </pre>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Document Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">Тип документа *</label>
                  <Select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                  >
                    <option value="claim">Исковое заявление</option>
                    <option value="complaint">Жалоба</option>
                    <option value="demand">Претензия</option>
                  </Select>
                </div>

                {/* Claim fields */}
                {(documentType === 'claim' || documentType === 'demand') && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Стороны</h3>
                    {documentType === 'claim' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Наименование суда *</label>
                        <Input
                          name="court_name"
                          placeholder="Арбитражный суд г. Москвы"
                          value={formData.court_name || ''}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">{documentType === 'demand' ? 'Заявитель' : 'Истец'}</h4>
                        <div>
                          <label className="block text-sm font-medium mb-2">Наименование *</label>
                          <Input name="plaintiff_name" placeholder='ООО "Ромашка"' value={formData.plaintiff_name || ''} onChange={handleChange} required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">ИНН</label>
                          <Input name="plaintiff_inn" placeholder="7701234567" value={formData.plaintiff_inn || ''} onChange={handleChange} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Адрес</label>
                          <Input name="plaintiff_address" placeholder="г. Москва, ул. Примерная, д. 1" value={formData.plaintiff_address || ''} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-medium">{documentType === 'demand' ? 'Адресат' : 'Ответчик'}</h4>
                        <div>
                          <label className="block text-sm font-medium mb-2">Наименование *</label>
                          <Input name="defendant_name" placeholder='ООО "Лютик"' value={formData.defendant_name || ''} onChange={handleChange} required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">ИНН</label>
                          <Input name="defendant_inn" placeholder="7709876543" value={formData.defendant_inn || ''} onChange={handleChange} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Адрес</label>
                          <Input name="defendant_address" placeholder="г. Москва, ул. Другая, д. 2" value={formData.defendant_address || ''} onChange={handleChange} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Complaint fields */}
                {documentType === 'complaint' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Данные жалобы</h3>
                    <div>
                      <label className="block text-sm font-medium mb-2">Куда направляется жалоба *</label>
                      <Input name="authority_name" placeholder="Вышестоящий орган, суд" value={formData.authority_name || ''} onChange={handleChange} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Заявитель *</label>
                      <Input name="applicant_name" placeholder="ФИО / наименование" value={formData.applicant_name || ''} onChange={handleChange} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">ИНН заявителя</label>
                      <Input name="applicant_inn" placeholder="7701234567" value={formData.applicant_inn || ''} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Адрес заявителя</label>
                      <Input name="applicant_address" placeholder="г. Москва, ул. Примерная, д. 1" value={formData.applicant_address || ''} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Заинтересованное лицо</label>
                      <Input name="interested_party" placeholder="Орган, действия которого обжалуются" value={formData.interested_party || ''} onChange={handleChange} />
                    </div>
                  </div>
                )}

                {/* Circumstances / grounds */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">{documentType === 'complaint' ? 'Основания жалобы' : 'Обстоятельства дела'}</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">{documentType === 'complaint' ? 'Обжалуемое действие *' : 'Обстоятельства дела *'}</label>
                    <Textarea
                      name={documentType === 'complaint' ? 'appealed_action' : 'circumstances'}
                      placeholder={documentType === 'complaint' ? 'Опишите, какое решение/действие обжалуется' : 'Опишите ситуацию: когда был заключён договор, какие обязательства нарушены, и т.д.'}
                      rows={4}
                      value={formData[documentType === 'complaint' ? 'appealed_action' : 'circumstances'] || ''}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">{documentType === 'complaint' ? 'Основания жалобы' : 'Правовое обоснование'}</label>
                    <Textarea
                      name={documentType === 'complaint' ? 'grounds' : 'legal_basis'}
                      placeholder="Ст. 506, 506.1 ГК РФ, ст. 28 АПК РФ"
                      rows={3}
                      value={formData[documentType === 'complaint' ? 'grounds' : 'legal_basis'] || ''}
                      onChange={handleChange}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Укажите статьи законов, на которые ссылаетесь (необязательно)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Требования *</label>
                    <Textarea
                      name="claims"
                      placeholder={"Признать решение незаконным\nОтменить постановление\nКаждое требование с новой строки"}
                      rows={3}
                      value={formData.claims || ''}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Каждое требование с новой строки
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Генерация...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Сгенерировать документ
                    </>
                  )}
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card>
            <CardBody>
              <h3 className="font-semibold mb-4">Подсказки</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Указывайте реальные нормы права</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Описывайте обстоятельства подробно</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Формулируйте требования чётко</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Проверяйте реквизиты сторон</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>AI не заменяет консультацию юриста</span>
                </li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
