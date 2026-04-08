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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Пользовательское соглашение</h1>
          <p className="text-white/40">Публичная оферта • Дата: 1 апреля 2026 г.</p>
        </div>

        <div className="disclaimer flex items-start gap-3 mb-8">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-400" />
          <div className="text-sm">
            <strong>Публичная оферта.</strong> Настоящий документ является публичной офертой в соответствии со ст. 437 ГК РФ.
            Регистрация на Сайте означает полное и безоговорочное принятие условий настоящего Соглашения.
          </div>
        </div>

        <Card>
          <CardBody className="prose prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-4">1. Термины и определения</h2>
            <ul className="text-white/60 leading-relaxed mb-6 space-y-2 list-none pl-0">
              <li><strong>Сервис (Lexly)</strong> — веб-платформа, расположенная по адресу lexly.ru, предоставляющая услуги по генерации и анализу юридических документов с использованием технологий ИИ.</li>
              <li><strong>Пользователь</strong> — любое дееспособное физическое лицо, достигшее 18 лет, принявшее условия настоящего Соглашения.</li>
              <li><strong>Оператор</strong> — ООО «Лексли», ИНН 0000000000, ОГРН 0000000000000.</li>
              <li><strong>Документ</strong> — результат генерации AI (исковое заявление, жалоба, претензия и т.д.).</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">2. Предмет соглашения</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              2.1. Оператор предоставляет Пользователю доступ к Сервису на условиях простой (неисключительной) лицензии.
            </p>
            <p className="text-white/60 leading-relaxed mb-6">
              2.2. Услуги оказываются дистанционно, с использованием информационно-телекоммуникационной сети «Интернет».
            </p>
            <p className="text-white/60 leading-relaxed mb-6">
              2.3. Настоящее Соглашение вступает в силу с момента регистрации Пользователя и действует до момента удаления аккаунта.
            </p>

            <h2 className="text-xl font-semibold mb-4">3. Описание услуг</h2>
            <ul className="text-white/60 leading-relaxed mb-6 space-y-2 list-none pl-0">
              <li>• Генерация юридических документов (иски, жалобы, претензии)</li>
              <li>• Анализ договоров на наличие рисков</li>
              <li>• Анализ судебной практики</li>
              <li>• Мониторинг изменений законодательства</li>
              <li>• AI-консультант по правовым вопросам</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">4. Важные ограничения и ответственность</h2>
            <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
              <p className="text-red-300 font-semibold mb-2">⚠ КРИТИЧЕСКИ ВАЖНО:</p>
              <ul className="text-red-200/80 leading-relaxed space-y-2 text-sm">
                <li>• <strong>Сервис НЕ является юридической консультацией.</strong> Все результаты носят информационный характер.</li>
                <li>• <strong>Сгенерированные документы — шаблоны.</strong> Перед использованием рекомендуется проверка у практикующего юриста.</li>
                <li>• <strong>Оператор НЕ несёт ответственности</strong> за последствия использования сгенерированных документов, включая судебные решения, штрафы и иные правовые последствия.</li>
                <li>• Пользователь самостоятельно несёт ответственность за достоверность вводимых данных.</li>
                <li>• AI может допускать ошибки. Все ссылки на законы должны быть проверены пользователем.</li>
              </ul>
            </div>

            <h2 className="text-xl font-semibold mb-4">5. Тарифы и оплата</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              5.1. Сервис предоставляет бесплатный тариф с ограниченными возможностями (2 документа/мес, 1 проверка договора/мес, 3 вопроса AI/день).
            </p>
            <p className="text-white/60 leading-relaxed mb-6">
              5.2. Платные тарифы: Pro (690 ₽/мес для первых пользователей, обычная цена 990 ₽/мес), Бизнес (2 990 ₽/мес, обычная цена 4 990 ₽/мес).
            </p>
            <p className="text-white/60 leading-relaxed mb-6">
              5.3. <strong>Автопродление подписки.</strong> Подписка продлевается автоматически каждый расчётный период. Пользователь может отменить автопродление в любой момент в разделе «Профиль». После отмены доступ сохраняется до конца оплаченного периода.
            </p>
            <p className="text-white/60 leading-relaxed mb-6">
              5.4. Возврат средств за неиспользованный период не производится, за исключением случаев, предусмотренных Законом РФ «О защите прав потребителей». Услуга считается оказанной с момента доступа к Сервису.
            </p>
            <p className="text-white/60 leading-relaxed mb-6">
              5.5. Пользователь вправе отказаться от подписки в любое время. Для отмены необходимо обратиться в поддержку или воспользоваться функцией в профиле.
            </p>

            <h2 className="text-xl font-semibold mb-4">6. Fair Use Policy (Политика добросовестного использования)</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              6.1. Тарифы с пометкой «Безлимит» подразумевают добросовестное использование Сервиса в личных или коммерческих целях одного пользователя.
            </p>
            <p className="text-white/60 leading-relaxed mb-6">
              6.2. Оператор вправе ограничить доступ при выявлении злоупотреблений,包括但不限于: массовая генерация документов (более 500/мес), автоматизированный scraping, передача доступа третьим лицам, использование в целях перепродажи.
            </p>
            <p className="text-white/60 leading-relaxed mb-6">
              6.3. При выявлении нарушений Оператор направляет уведомление Пользователю и вправе приостановить доступ до устранения нарушений.
            </p>

            <h2 className="text-xl font-semibold mb-4">7. Права и обязанности сторон</h2>
            <p className="text-white/60 leading-relaxed mb-3 font-semibold">Оператор обязуется:</p>
            <ul className="text-white/60 leading-relaxed mb-6 space-y-2 list-none pl-0">
              <li>• Предоставлять услуги в объёме, соответствующем тарифу</li>
              <li>• Обеспечивать конфиденциальность персональных данных (ФЗ-152)</li>
              <li>• Не передавать данные третьим лицам без согласия Пользователя</li>
            </ul>
            <p className="text-white/60 leading-relaxed mb-3 font-semibold">Пользователь обязуется:</p>
            <ul className="text-white/60 leading-relaxed mb-6 space-y-2 list-none pl-0">
              <li>• Предоставлять достоверные данные при регистрации</li>
              <li>• Не использовать Сервис для противоправных действий</li>
              <li>• Не передавать доступ к аккаунту третьим лицам</li>
              <li>• Самостоятельно проверять сгенерированные документы</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">8. Интеллектуальная собственность</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              7.1. Все исключительные права на Сервис, включая программный код, дизайн, тексты промптов и алгоритмы, принадлежат Оператору.
            </p>
            <p className="text-white/60 leading-relaxed mb-6">
              7.2. Сгенерированные документы являются объектом совместного создания. Пользователь вправе использовать их в личных и коммерческих целях.
            </p>

            <h2 className="text-xl font-semibold mb-4">9. Обработка персональных данных</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              8.1. Регистрируясь, Пользователь даёт согласие на обработку персональных данных в соответствии с Политикой конфиденциальности (lexly.ru/privacy).
            </p>
            <p className="text-white/60 leading-relaxed mb-6">
              8.2. Обработка осуществляется в соответствии с ФЗ-152 «О персональных данных» от 27.07.2006.
            </p>

            <h2 className="text-xl font-semibold mb-4">10. Ответственность сторон и форс-мажор</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              9.1. Оператор не несёт ответственности за временные перебои в работе Сервиса, вызванные техническими причинами.
            </p>
            <p className="text-white/60 leading-relaxed mb-6">
              9.2. Стороны освобождаются от ответственности за неисполнение обязательств при наступлении обстоятельств непреодолимой силы (форс-мажор).
            </p>

            <h2 className="text-xl font-semibold mb-4">11. Разрешение споров</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              10.1. Все споры разрешаются путём переговоров. Претензионный порядок — 30 календарных дней.
            </p>
            <p className="text-white/60 leading-relaxed mb-6">
              10.2. При недостижении согласия — спор передаётся на рассмотрение в суд по месту нахождения Оператора.
            </p>

            <h2 className="text-xl font-semibold mb-4">12. Согласие и принятие условий</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              Нажимая кнопку «Зарегистрироваться», Пользователь подтверждает, что ознакомлен с настоящим Соглашением, Политикой конфиденциальности, даёт согласие на обработку персональных данных и принимает все условия в полном объёме в соответствии со ст. 437, 438 ГК РФ.
            </p>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-white/40 text-sm">
                ООО «Лексли» • ИНН 0000000000 • ОГРН 0000000000000
              </p>
              <p className="text-white/40 text-sm">
                Контакт: support@lexly.ru
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
