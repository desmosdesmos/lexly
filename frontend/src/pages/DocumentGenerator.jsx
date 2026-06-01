import { useState } from 'react'
import { FileText, Sparkles, AlertCircle, CheckCircle, Loader2, Copy, Download } from 'lucide-react'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Select } from '../components/ui/Select'
import { Alert } from '../components/ui/Alert'
import { PaywallModal } from '../components/ui/PaywallModal'
import { AIFieldHelper } from '../components/ui/AIFieldHelper'
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

  const labels = {
    claim: { p: 'Истец', d: 'Ответчик', c: 'Обстоятельства дела', l: 'Правовое обоснование', t: 'Требования' },
    demand: { p: 'Заявитель', d: 'Адресат', c: 'Основания претензии', l: 'Ссылки на договор/закон', t: 'Требования' },
    contract_sale: { p: 'Продавец', d: 'Покупатель', c: 'Описание товара/имущества', l: 'Цена и порядок оплаты', t: 'Особые условия (доставка и др.)' },
    contract_employment: { p: 'Работодатель', d: 'Работник', c: 'Место работы и условия', l: 'Оклад и надбавки', t: 'Специфические условия', extra: 'Должность' },
    power_of_attorney: { p: 'Доверитель', d: 'Поверенный', c: 'Полномочия (что доверяете)', l: 'Срок и место действия', t: 'Дополнительная информация', extra: 'Место выдачи' },
    wb_claim: { p: 'Продавец (ИП/ООО)', d: 'Маркетплейс', c: 'Описание проблемы (утеря, штраф, блокировка)', l: 'Ссылки на акты/тикеты', t: 'Требования (сумма, возврат)' },
    zozp_claim: { p: 'Потребитель', d: 'Продавец/Исполнитель', c: 'Что купили и в чём проблема', l: 'Ссылки на договор/чек', t: 'Требования (возврат, замена)' },
    auto_fine: { p: 'Владелец ТС', d: 'Орган (ГИБДД/МАДИ/АМПП)', c: 'Номер и дата постановления', l: 'Причина несогласия со штрафом', t: 'Требования (отмена, пересмотр)' },
  }

  const currentLabels = labels[documentType] || labels.claim

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
      } else if (documentType === 'demand') {
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
      } else if (documentType === 'contract_sale') {
        data = {
          seller_name: formData.plaintiff_name,
          seller_inn: formData.plaintiff_inn,
          seller_address: formData.plaintiff_address,
          buyer_name: formData.defendant_name,
          buyer_inn: formData.defendant_inn,
          buyer_address: formData.defendant_address,
          item_description: formData.circumstances,
          price_and_payment: formData.legal_basis,
          circumstances: formData.claims,
        }
      } else if (documentType === 'contract_employment') {
        data = {
          employer_name: formData.plaintiff_name,
          employer_inn: formData.plaintiff_inn,
          employer_address: formData.plaintiff_address,
          employee_name: formData.defendant_name,
          employee_inn: formData.defendant_inn,
          employee_address: formData.defendant_address,
          job_title: formData.court_name,
          salary_info: formData.legal_basis,
          circumstances: formData.claims,
        }
      } else if (documentType === 'power_of_attorney') {
        data = {
          principal_name: formData.plaintiff_name,
          principal_details: formData.plaintiff_inn,
          principal_address: formData.plaintiff_address,
          agent_name: formData.defendant_name,
          agent_details: formData.defendant_inn,
          agent_address: formData.defendant_address,
          powers: formData.circumstances,
          expiry: formData.court_name,
          circumstances: formData.claims,
        }
      } else if (documentType === 'wb_claim') {
        data = {
          marketplace_name: formData.defendant_name || 'Wildberries',
          seller_name: formData.plaintiff_name,
          seller_inn: formData.plaintiff_inn,
          seller_address: formData.plaintiff_address,
          problem_type: 'general',
          circumstances: formData.circumstances,
          claims: formData.claims,
          doc_numbers: formData.legal_basis,
          amount: '',
        }
      } else if (documentType === 'zozp_claim') {
        data = {
          buyer_name: formData.plaintiff_name,
          buyer_address: formData.plaintiff_address,
          seller_name: formData.defendant_name,
          seller_address: formData.defendant_address,
          product_description: formData.circumstances,
          legal_basis: formData.legal_basis,
          claims: formData.claims,
        }
      } else if (documentType === 'auto_fine') {
        data = {
          owner_name: formData.plaintiff_name,
          owner_address: formData.plaintiff_address,
          authority_name: formData.defendant_name,
          resolution_number: formData.court_name,
          circumstances: formData.circumstances,
          legal_basis: formData.legal_basis,
          claims: formData.claims,
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold">Сгенерированный документ</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.generated_content)
                    toast.success('Скопировано!')
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" /> Копировать
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
                  className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> .TXT
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
                  className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors font-semibold"
                >
                  <Download className="w-3.5 h-3.5" /> .DOCX
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap bg-muted p-4 sm:p-6 rounded-lg text-xs sm:text-sm leading-relaxed font-sans max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
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
                    <option value="contract_sale">Договор купли-продажи</option>
                    <option value="contract_employment">Трудовой договор</option>
                    <option value="power_of_attorney">Доверенность</option>
                    <option value="wb_claim">Претензия к маркетплейсу (WB/Ozon)</option>
                    <option value="zozp_claim">Защита прав потребителя (ЗОПП)</option>
                    <option value="auto_fine">Обжалование автоштрафа</option>
                  </Select>
                </div>

                {/* Parties fields (Shared by many) */}
                {['claim', 'demand', 'contract_sale', 'contract_employment', 'power_of_attorney', 'wb_claim', 'zozp_claim', 'auto_fine'].includes(documentType) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Стороны</h3>
                    {(documentType === 'claim' || currentLabels.extra) && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                          {documentType === 'claim' ? 'Наименование суда *' : currentLabels.extra + ' *'}
                        </label>
                        <Input
                          name="court_name"
                          placeholder={documentType === 'claim' ? "Арбитражный суд г. Москвы" : ""}
                          value={formData.court_name || ''}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">{currentLabels.p}</h4>
                        <div>
                          <label className="block text-sm font-medium mb-2">Наименование/ФИО *</label>
                          <Input name="plaintiff_name" placeholder="" value={formData.plaintiff_name || ''} onChange={handleChange} required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {documentType === 'power_of_attorney' ? 'Паспортные данные' : 'ИНН'}
                          </label>
                          <Input name="plaintiff_inn" placeholder="" value={formData.plaintiff_inn || ''} onChange={handleChange} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Адрес</label>
                          <Input name="plaintiff_address" placeholder="" value={formData.plaintiff_address || ''} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-medium">{currentLabels.d}</h4>
                        <div>
                          <label className="block text-sm font-medium mb-2">Наименование/ФИО *</label>
                          <Input name="defendant_name" placeholder="" value={formData.defendant_name || ''} onChange={handleChange} required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {documentType === 'power_of_attorney' ? 'Паспортные данные' : 'ИНН'}
                          </label>
                          <Input name="defendant_inn" placeholder="" value={formData.defendant_inn || ''} onChange={handleChange} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Адрес</label>
                          <Input name="defendant_address" placeholder="" value={formData.defendant_address || ''} onChange={handleChange} />
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
                  <h3 className="text-lg font-semibold mb-4">
                    {documentType === 'complaint' ? 'Основания жалобы' : currentLabels.c}
                  </h3>
                  <div className="mb-4">
                    <AIFieldHelper
                      value={formData[documentType === 'complaint' ? 'appealed_action' : 'circumstances'] || ''}
                      onChange={(val) => setFormData(prev => ({...prev, [documentType === 'complaint' ? 'appealed_action' : 'circumstances']: val}))}
                      placeholder={documentType === 'complaint' ? 'Опишите, какое решение/действие обжалуется' : `Опишите подробности для: ${currentLabels.c}`}
                      label={(documentType === 'complaint' ? 'Обжалуемое действие' : currentLabels.c) + ' *'}
                      type="textarea"
                      rows={4}
                      context={documentType}
                      field={documentType === 'complaint' ? 'appealed_action' : 'circumstances'}
                    />
                  </div>
                  <div className="mb-4">
                    <AIFieldHelper
                      value={formData[documentType === 'complaint' ? 'grounds' : 'legal_basis'] || ''}
                      onChange={(val) => setFormData(prev => ({...prev, [documentType === 'complaint' ? 'grounds' : 'legal_basis']: val}))}
                      placeholder="AI подберёт нормы на основе предоставленных данных"
                      label={documentType === 'complaint' ? 'Основания жалобы' : currentLabels.l}
                      type="textarea"
                      rows={3}
                      context={documentType}
                      field={documentType === 'complaint' ? 'grounds' : 'legal_basis'}
                      circumstances={formData.circumstances || formData.appealed_action || ''}
                    />
                  </div>
                  <div>
                    <AIFieldHelper
                      value={formData.claims || ''}
                      onChange={(val) => setFormData(prev => ({...prev, claims: val}))}
                      placeholder="AI сформулирует детали на основе описания выше"
                      label={currentLabels.t + ' *'}
                      type="textarea"
                      rows={3}
                      context={documentType}
                      field="claims"
                      circumstances={formData.circumstances || formData.appealed_action || ''}
                    />
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
