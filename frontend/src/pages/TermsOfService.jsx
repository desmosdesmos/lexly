import { Scale, FileText, ArrowLeft, AlertTriangle, ShieldCheck, CreditCard, Truck } from 'lucide-react'
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
          <p className="text-white/40">Публичная оферта • Редакция от 17 мая 2026 г.</p>
        </div>

        <div className="disclaimer flex items-start gap-3 mb-8 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-400" />
          <div className="text-xs text-white/60 leading-relaxed">
            <strong>Публичная оферта.</strong> Настоящий документ является публичной офертой в соответствии со ст. 437 ГК РФ.
            Регистрация на Сайте или совершение оплаты означает полное и безоговорочное принятие условий настоящего Соглашения.
          </div>
        </div>

        <Card>
          <CardBody className="prose prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">1. Термины и определения</h2>
            <ul className="text-white/60 leading-relaxed mb-6 space-y-2 list-none pl-0">
              <li><strong>Сервис (Laxly)</strong> — веб-платформа laxlylaw.ru, программный комплекс, предоставляющий функционал на базе искусственного интеллекта.</li>
              <li><strong>Пользователь</strong> — физическое или юридическое лицо, прошедшее регистрацию и использующее Сервис.</li>
              <li><strong>Лицензиар (Оператор)</strong> — Пащенко Ян Викторович (ИНН: 644010686500), самозанятый.</li>
              <li><strong>Подписка</strong> — предоставление права использования расширенного функционала Сервиса на определенный срок (30 календарных дней).</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">2. Предмет соглашения</h2>
            <p className="text-white/60 leading-relaxed mb-4">
              Лицензиар предоставляет Пользователю право использования Сервиса на условиях простой (неисключительной) лицензии (ст. 1286 ГК РФ) для автоматизации подготовки проектов юридических документов и получения справочной информации.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">3. Порядок предоставления услуг (Доставка)</h2>
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-4 h-4 text-green-400" />
                <h4 className="text-sm font-bold text-green-400 uppercase tracking-wider">Цифровая доставка</h4>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Поскольку Сервис является полностью цифровым продуктом, физическая доставка товаров не осуществляется. 
                <strong> Доступ к оплаченным функциям и тарифным планам предоставляется мгновенно </strong> 
                после подтверждения успешного платежа платежной системой. Активация происходит в автоматическом режиме в Личном кабинете пользователя.
              </p>
            </div>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">4. Стоимость и порядок оплаты</h2>
            <ul className="text-white/60 leading-relaxed mb-6 space-y-2 list-none pl-0">
              <li>• Стоимость подписки указана в разделе «Тарифы» Личного кабинета и на главной странице Сайта.</li>
              <li>• Все расчеты производятся в российских рублях банковскими картами или иными способами, доступными через платежный агрегатор (ЮKassa).</li>
              <li>• Услуга считается оказанной в полном объеме с момента предоставления доступа к функционалу Сервиса (активации подписки).</li>
              <li>• В соответствии со ст. 429.4 ГК РФ, отсутствие использования Сервиса со стороны Пользователя при наличии доступа к нему не является основанием для возврата оплаты.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">5. Политика возврата денежных средств</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              Возврат денежных средств возможен только в случае технической невозможности предоставления доступа к Сервису по вине Лицензиара более чем на 24 часа подряд. Для оформления возврата необходимо направить запрос на email: <span className="text-white">desmosymail@gmail.com</span> с указанием причин.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">6. Юридический дисклеймер</h2>
            <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
              <p className="text-red-300 font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> ВНИМАНИЕ:
              </p>
              <ul className="text-red-200/80 leading-relaxed space-y-2 text-sm">
                <li>• Laxly не является адвокатским образованием и не оказывает квалифицированную юридическую помощь.</li>
                <li>• Результаты работы AI являются проектами документов и требуют обязательной проверки юристом перед использованием.</li>
                <li>• Оператор не несет ответственности за правовые последствия использования сгенерированной информации.</li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-white/80 uppercase tracking-widest">Реквизиты:</h4>
                  <div className="space-y-1 text-white/40 text-xs">
                    <p className="font-medium text-white/60">Пащенко Ян Викторович</p>
                    <p>ИНН: 644010686500</p>
                    <p>Статус: Самозанятый</p>
                    <p>Адрес: 410028, г. Саратов, Провиантская ул., 9/13</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-white/80 uppercase tracking-widest">Связь:</h4>
                  <div className="space-y-1 text-white/40 text-xs">
                    <p>Email: <span className="text-white/60">desmosymail@gmail.com</span></p>
                    <p>Телефон: <span className="text-white/60">+7 (906) 316-31-14</span></p>
                    <p>Telegram: <span className="text-white/60">@yanvtg</span></p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
