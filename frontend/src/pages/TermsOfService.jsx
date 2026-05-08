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
              <li><strong>Сервис (Laxly)</strong> — веб-платформа laxlylaw.ru, программный комплекс, предоставляющий функционал на базе искусственного интеллекта.</li>
              <li><strong>Пользователь</strong> — физическое или юридическое лицо, прошедшее регистрацию и использующее Сервис.</li>
              <li><strong>Лицензиар (Оператор)</strong> — Пащенко Егор Викторович (ИНН 644011277300).</li>
              <li><strong>Подписка</strong> — предоставление права использования расширенного функционала Сервиса на определенный срок.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">2. Предмет соглашения и порядок использования</h2>
            <p className="text-white/60 leading-relaxed mb-4">
              Лицензиар предоставляет Пользователю право использования Сервиса на условиях простой (неисключительной) лицензии (ст. 1286 ГК РФ) для подготовки проектов юридических документов и получения справочно-аналитической информации.
            </p>
            <p className="text-white/60 leading-relaxed mb-6 font-medium">
              Моментом заключения договора (акцептом оферты) считается завершение регистрации Пользователя на Сайте или совершение первого платежа.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">3. Отказ от ответственности и правовой статус информации</h2>
            <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
              <p className="text-red-300 font-semibold mb-2">⚠ ЮРИДИЧЕСКИЙ ДИСКЛЕЙМЕР:</p>
              <ul className="text-red-200/80 leading-relaxed space-y-2 text-sm">
                <li>• <strong>Laxly не является субъектом оказания профессиональной юридической помощи</strong> в понимании Закона об адвокатуре.</li>
                <li>• Результаты работы ИИ носят справочный характер. Использование сгенерированных документов в судах или перед госорганами без проверки профильным юристом не рекомендуется.</li>
                <li>• Сервис не гарантирует 100% актуальность законодательства в ответах ИИ, несмотря на использование систем поиска (Garant/Sudact).</li>
                <li>• Оператор не несет ответственности за прямые или косвенные убытки, возникшие в результате использования информации с Сайта.</li>
              </ul>
            </div>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">4. Стоимость и порядок расчетов</h2>
            <ul className="text-white/60 leading-relaxed mb-6 space-y-2 list-none pl-0">
              <li>• Все расчеты производятся в российских рублях.</li>
              <li>• Платежи осуществляются через лицензированных платежных агрегаторов. Оператор не хранит данные банковских карт.</li>
              <li>• В соответствии со ст. 429.4 ГК РФ (абонентский договор), неоказание Пользователем запросов в течение срока оплаченной Подписки не является основанием для возврата денежных средств.</li>
              <li>• Отмена автопродления осуществляется Пользователем самостоятельно в Личном кабинете.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">5. Интеллектуальная собственность</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              Весь контент, программный код и дизайн являются объектами авторского права Лицензиара. Пользователь получает право собственности на финальный текст сгенерированных им документов (исков, жалоб), но не на алгоритмы их создания.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">6. Порядок разрешения споров</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              Досудебный претензионный порядок обязателен. Срок рассмотрения претензии — 30 календарных дней. Споры рассматриваются в суде по месту нахождения Лицензиара (г. Саратов), если иное не предусмотрено законом о защите прав потребителей.
            </p>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-white/80">Реквизиты Оператора:</h4>
                  <p className="text-white/40 text-xs leading-relaxed">
                    Пащенко Егор Викторович<br />
                    ИНН: 644011277300<br />
                    Адрес: г. Саратов
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-white/80">Контакты:</h4>
                  <p className="text-white/40 text-xs">
                    Email: desmosymail@gmail.com<br />
                    Техническая поддержка: @yanvtg
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
