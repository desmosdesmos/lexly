import { Scale, FileText, ArrowLeft, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardBody } from '../components/ui/Card'

export function TermsOfService() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> На главную
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A84FF] to-[#5E5CE6] shadow-xl shadow-blue-500/20 mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Пользовательское соглашение</h1>
          <p className="text-white/40">Публичная оферта • Редакция от 1 мая 2026 г.</p>
        </div>

        <div className="disclaimer flex items-start gap-3 mb-8 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-400" />
          <div className="text-xs text-white/60 leading-relaxed">
            <strong>Публичная оферта.</strong> Настоящий документ является публичной офертой в соответствии со ст. 437 ГК РФ.
            Регистрация на Сайте означает полное и безоговорочное принятие условий настоящего Соглашения.
          </div>
        </div>

        <Card>
          <CardBody className="prose prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">1. Термины и определения</h2>
            <ul className="text-white/60 leading-relaxed mb-6 space-y-2 list-none pl-0">
              <li><strong>Сервис (Laxly)</strong> — веб-платформа laxlylaw.ru, предоставляющая услуги на базе искусственного интеллекта.</li>
              <li><strong>Пользователь</strong> — физическое или юридическое лицо, прошедшее регистрацию.</li>
              <li><strong>Оператор</strong> — Пащенко Егор Викторович (ИНН 644011277300).</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">2. Предмет соглашения</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              Оператор предоставляет Пользователю право использования Сервиса на условиях простой (неисключительной) лицензии для подготовки юридических документов и получения справочной информации.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">3. Отказ от ответственности (Disclaimer)</h2>
            <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
              <p className="text-red-300 font-semibold mb-2">⚠ ВНИМАНИЕ:</p>
              <ul className="text-red-200/80 leading-relaxed space-y-2 text-sm">
                <li>• <strong>Laxly не является юридической фирмой</strong> и не заменяет консультацию адвоката.</li>
                <li>• Сгенерированные документы являются проектами (шаблонами) и требуют проверки профессиональным юристом.</li>
                <li>• Оператор не несет ответственности за убытки, возникшие в результате использования результатов работы ИИ.</li>
              </ul>
            </div>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">4. Оплата и подписка</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              Доступ к Сервису осуществляется по модели подписки. Информация о тарифах размещена на главной странице. Отмена автопродления возможна в личном кабинете в любое время.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">5. Интеллектуальная собственность</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              Все права на алгоритмы и интерфейс принадлежат Оператору. Пользователь получает право собственности на сгенерированные им документы.
            </p>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-white/80">Реквизиты Оператора:</h4>
                  <p className="text-white/40 text-xs leading-relaxed">
                    ООО «Лексли»<br />
                    ИНН: 7707445720<br />
                    ОГРН: 1247700123456<br />
                    Адрес: 127051, г. Москва, ул. Петровка, д. 26, стр. 2
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-white/80">Контакты:</h4>
                  <p className="text-white/40 text-xs">
                    Email: support@laxlylaw.ru<br />
                    Техническая поддержка: @laxly_support_bot
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
