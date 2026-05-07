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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A84FF] to-[#5E5CE6] shadow-xl shadow-blue-500/20 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Политика обработки ПДн</h1>
          <p className="text-white/40">Актуальная версия от 1 мая 2026 г.</p>
        </div>

        <Card>
          <CardBody className="prose prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">1. Общие положения</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              Настоящая Политика в отношении обработки персональных данных (далее — Политика) разработана в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных» и определяет порядок обработки и защиты персональных данных пользователей платформы Laxly (далее — Сервис).
            </p>
            <p className="text-white/60 leading-relaxed mb-6">
              <strong>Оператор персональных данных:</strong> ООО «Лексли» (ОГРН: 1247700123456, ИНН: 7707445720). Адрес: 127051, г. Москва, ул. Петровка, д. 26, стр. 2.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">2. Категории обрабатываемых данных</h2>
            <ul className="text-white/60 leading-relaxed mb-6 space-y-2 list-none pl-0">
              <li>• <strong>Персональные данные:</strong> ФИО, адрес электронной почты, номер телефона.</li>
              <li>• <strong>Технические данные:</strong> IP-адрес, тип браузера, cookies, время доступа, информация об устройстве.</li>
              <li>• <strong>Контент пользователя:</strong> тексты документов, юридические запросы, анализируемые файлы договоров.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">3. Цели и правовые основания</h2>
            <p className="text-white/60 leading-relaxed mb-4">Мы обрабатываем ваши данные исключительно для следующих целей:</p>
            <ul className="text-white/60 leading-relaxed mb-6 space-y-2 list-none pl-0">
              <li>• Предоставление доступа к функционалу AI-юриста (исполнение договора).</li>
              <li>• Техническая поддержка и обратная связь (законный интерес).</li>
              <li>• Рассылка информационных и рекламных материалов (с вашего согласия).</li>
              <li>• Улучшение качества работы алгоритмов ИИ (обезличенная обработка).</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">4. Хранение и локализация (ФЗ-152)</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              В соответствии с требованиями законодательства РФ, первичный сбор и хранение персональных данных граждан РФ осуществляется на серверах, <strong>физически расположенных на территории Российской Федерации</strong> (ЦОД «Яндекс.Облако», Москва).
            </p>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">5. Трансграничная передача</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              Оператор может осуществлять трансграничную передачу обезличенных данных провайдерам AI-моделей (например, GROQ) исключительно в целях генерации ответов. Личные данные (email, ФИО) не передаются за пределы РФ без специального согласия.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">6. Права субъекта ПДн</h2>
            <p className="text-white/60 leading-relaxed mb-4">Вы имеете право:</p>
            <ul className="text-white/60 leading-relaxed mb-6 space-y-2 list-none pl-0">
              <li>• Запросить информацию о способах и целях обработки ваших данных.</li>
              <li>• Потребовать уточнения, блокирования или уничтожения неполных или неточных данных.</li>
              <li>• <strong>Отозвать согласие</strong> на обработку данных в любой момент, направив запрос на электронную почту.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">7. Использование Cookies</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              Сервис использует файлы cookie для обеспечения безопасности сессий и аналитики (Яндекс.Метрика). Вы можете управлять настройками cookie через всплывающее уведомление при первом входе на сайт или в настройках браузера.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">8. Контакты и отзыв согласия</h2>
            <p className="text-white/60 leading-relaxed mb-4">
              По всем вопросам, связанным с персональными данными, а также для отзыва согласия, пишите нам:
            </p>
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <p className="text-white/80"><strong>Email:</strong> privacy@laxlylaw.ru</p>
              <p className="text-white/80"><strong>Ответственный:</strong> Иванов А.С., Генеральный директор ООО «Лексли»</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
