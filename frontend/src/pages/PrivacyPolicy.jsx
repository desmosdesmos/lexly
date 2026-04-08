import { Scale, Shield, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardBody, CardHeader } from '../components/ui/Card'

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> На главную
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Политика конфиденциальности</h1>
          <p className="text-white/40">Дата вступления в силу: 1 апреля 2026 г.</p>
        </div>

        <Card>
          <CardBody className="prose prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-4">1. Общие положения</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              Настоящая Политика конфиденциальности (далее — Политика) разработана в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных» и определяет порядок обработки и защиты персональных данных пользователей платформы Lexly (далее — Сервис).
            </p>
            <p className="text-white/60 leading-relaxed mb-6">
              Оператором персональных данных является ООО «Лексли» (далее — Оператор), обеспечивающий обработку персональных данных в соответствии с действующим законодательством Российской Федерации.
            </p>

            <h2 className="text-xl font-semibold mb-4">2. Какие данные мы собираем</h2>
            <ul className="text-white/60 leading-relaxed mb-6 space-y-2 list-none pl-0">
              <li>• <strong>Регистрационные данные:</strong> имя, адрес электронной почты, номер телефона</li>
              <li>• <strong>Платёжные данные:</strong> информация о транзакциях (обрабатывается через платёжного агрегатора)</li>
              <li>• <strong>Технические данные:</strong> IP-адрес, данные cookies, информация о браузере и устройстве</li>
              <li>• <strong>Пользовательский контент:</strong> тексты документов, запросы к AI-консультанту</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">3. Цели обработки данных</h2>
            <ul className="text-white/60 leading-relaxed mb-6 space-y-2 list-none pl-0">
              <li>• Предоставление услуг по генерации и анализу юридических документов</li>
              <li>• Идентификация пользователя и обеспечение безопасности</li>
              <li>• Обработка платежей и управление подпиской</li>
              <li>• Улучшение качества Сервиса и разработка новых функций</li>
              <li>• Направление информационных уведомлений (с согласия пользователя)</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">4. Правовые основания обработки</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              Обработка персональных данных осуществляется на основании: согласия субъекта персональных данных (ст. 6 ФЗ-152); исполнения договора, стороной которого является пользователь (ст. 6 ФЗ-152); исполнения юридических обязательств Оператора (ст. 6 ФЗ-152).
            </p>

            <h2 className="text-xl font-semibold mb-4">5. Хранение и защита данных</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              Персональные данные хранятся на серверах, расположенных на территории Российской Федерации, в соответствии с требованиями ст. 18 ФЗ-152. Оператор применяет организационные и технические меры для защиты персональных данных: шифрование данных при передаче (TLS 1.3), хеширование паролей (bcrypt), ограничение доступа, регулярный аудит безопасности.
            </p>

            <h2 className="text-xl font-semibold mb-4">6. Передача данных третьим лицам</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              Оператор не продаёт и не передаёт персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством РФ, либо когда передача необходима для исполнения обязательств перед пользователем (платёжные агрегаторы, хостинг-провайдеры).
            </p>

            <h2 className="text-xl font-semibold mb-4">7. Права пользователя</h2>
            <ul className="text-white/60 leading-relaxed mb-6 space-y-2 list-none pl-0">
              <li>• Право на доступ к своим персонаальным данным (ст. 14 ФЗ-152)</li>
              <li>• Право на rectification (исправление неточных данных)</li>
              <li>• Право на удаление данных («право на забвение», ст. 21 ФЗ-152)</li>
              <li>• Право на отзыв согласия на обработку персональных данных</li>
              <li>• Право на обжалование действий Оператора в уполномоченный орган (Роскомнадзор)</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">8. Использование AI-технологий</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              Сервис использует технологии искусственного интеллекта (GROQ AI) для обработки пользовательских запросов. Запросы передаются в обезличенном виде. Результаты генерации документов сохраняются в личном кабинете пользователя. Пользователь несёт ответственность за использование сгенерированных документов.
            </p>

            <h2 className="text-xl font-semibold mb-4">9. Изменение Политики</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              Оператор вправе вносить изменения в настоящую Политику. Новая редакция вступает в силу с момента размещения на Сайте. Пользователь обязуется самостоятельно знакомиться с действующей редакцией.
            </p>

            <h2 className="text-xl font-semibold mb-4">10. Контакты</h2>
            <p className="text-white/60 leading-relaxed">
              По вопросам обработки персональных данных обращайтесь: <strong>privacy@lexly.ru</strong>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
