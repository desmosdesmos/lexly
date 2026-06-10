import { Scale, FileText, ArrowLeft, Mail, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardBody } from '../components/ui/Card'

export function RecommendationPolicy() {
  return (
    <div className="min-h-screen py-12 px-4 bg-[#0B0F19] text-slate-200">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> На главную
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A84FF] to-[#5E5CE6] shadow-xl shadow-blue-500/20 mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Правила применения рекомендательных технологий</h1>
          <p className="text-white/40">Редакция от 10 июня 2026 г.</p>
        </div>

        <Card className="bg-[rgba(28,28,30,0.5)] backdrop-blur-[32px] border border-white/[0.06] rounded-[22px]">
          <CardBody className="prose prose-invert max-w-none p-8 md:p-12">
            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">1. Общие положения</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              Настоящие Правила разработаны в соответствии с требованиями статьи 10.2-2 Федерального закона от 27.07.2006 № 149-ФЗ «Об информации, информационных технологиях и о защите информации» и устанавливают порядок применения рекомендательных технологий на сайте <strong>laxlylaw.ru</strong> (далее — Сайт).
            </p>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">2. Отсутствие применения рекомендательных технологий</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              Мы информируем пользователей о том, что на Сайтах и в программных комплексах сервиса Laxly <strong>НЕ применяются рекомендательные технологии</strong> (информационные технологии предоставления информации на основе сбора, систематизации и анализа сведений, относящихся к предпочтениям пользователей сети «Интернет», находящихся на территории Российской Федерации).
            </p>
            <p className="text-white/60 leading-relaxed mb-6">
              Весь контент (включая шаблоны документов, статьи базы знаний, тарифные планы и справочные материалы) отображается на Сайте в одинаковом виде для всех пользователей и не адаптируется под индивидуальные предпочтения, историю просмотров, лайки или поведение конкретного пользователя.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-[#0A84FF]">3. Юридически значимые контакты</h2>
            <p className="text-white/60 leading-relaxed mb-4">
              В целях соблюдения требований законодательства Российской Федерации ниже размещены контактные данные владельца информационного ресурса для направления юридически значимых сообщений:
            </p>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-white/80 uppercase tracking-widest">Реквизиты владельца:</h4>
                  <div className="space-y-1 text-white/40 text-xs">
                    <p className="font-medium text-white/60">Пащенко Ян Викторович</p>
                    <p>ИНН: 644010686500</p>
                    <p>Статус: Самозанятый</p>
                    <p>Адрес: 410028, г. Саратов, Провиантская ул., 9/13</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-white/80 uppercase tracking-widest">Обратная связь:</h4>
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
