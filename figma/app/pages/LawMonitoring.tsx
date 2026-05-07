import { Calendar, TrendingUp, AlertCircle, ExternalLink } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export function LawMonitoring() {
  const updates = [
    {
      id: 1,
      date: '01.04.2026',
      title: 'Изменения в ГК РФ о неустойке',
      type: 'critical',
      description: 'Введено новое правило об ограничении размера неустойки. Теперь суд может снизить неустойку только при наличии обоснованного заявления ответчика.',
      impact: 'Влияет на все договоры с условиями о неустойке. Необходимо обновить шаблоны договоров.',
      law: 'Федеральный закон № 45-ФЗ',
    },
    {
      id: 2,
      date: '28.03.2026',
      title: 'Новый порядок регистрации юридических лиц',
      type: 'important',
      description: 'С 1 мая 2026 года вводится электронная регистрация юридических лиц через единый портал. Срок регистрации сокращен до 3 рабочих дней.',
      impact: 'Упрощение процедуры регистрации компаний. Рекомендуется использовать новый порядок для всех новых регистраций.',
      law: 'Приказ ФНС № 123',
    },
    {
      id: 3,
      date: '25.03.2026',
      title: 'Изменения в Трудовом кодексе',
      type: 'info',
      description: 'Уточнены правила удаленной работы. Работодатели обязаны предоставлять оборудование для работы или компенсировать расходы сотрудников.',
      impact: 'Необходимо пересмотреть договоры с удаленными сотрудниками и политику компенсаций.',
      law: 'Федеральный закон № 38-ФЗ',
    },
    {
      id: 4,
      date: '20.03.2026',
      title: 'Практика ВС РФ по договорам поставки',
      type: 'info',
      description: 'Верховный Суд разъяснил применение правил о существенном нарушении договора поставки. Односторонний отказ возможен только при систематических нарушениях.',
      impact: 'Важно для споров по договорам поставки. Усилена защита добросовестных контрагентов.',
      law: 'Обзор судебной практики ВС РФ',
    },
  ];

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'important':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'critical':
        return 'Критично';
      case 'important':
        return 'Важно';
      default:
        return 'Информация';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold mb-2">Мониторинг законодательства</h1>
        <p className="text-muted-foreground">
          Отслеживайте изменения в законах и судебной практике
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold mb-1">3</div>
              <div className="text-sm text-muted-foreground">Критичных изменения</div>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold mb-1">7</div>
              <div className="text-sm text-muted-foreground">Важных обновлений</div>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold mb-1">За неделю</div>
              <div className="text-sm text-muted-foreground">Период мониторинга</div>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm">Все обновления</Button>
          <Button variant="outline" size="sm">Критичные</Button>
          <Button variant="outline" size="sm">Важные</Button>
          <Button variant="outline" size="sm">Информационные</Button>
          <Button variant="outline" size="sm">За неделю</Button>
        </div>
      </Card>

      {/* Updates List */}
      <div className="space-y-4">
        {updates.map((update) => (
          <Card key={update.id}>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs border ${getTypeStyles(update.type)}`}>
                      {getTypeBadge(update.type)}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {update.date}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{update.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{update.description}</p>
                  <div className="bg-accent/10 border border-accent/20 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium mb-1">Влияние на вашу практику</div>
                        <div className="text-sm text-muted-foreground">{update.impact}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground">{update.law}</span>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4" />
                  Подробнее
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Settings */}
      <Card>
        <h3 className="font-semibold mb-4">Настройки мониторинга</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Выберите области права, которые вас интересуют, и получайте уведомления о важных изменениях
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">Гражданское право</Button>
          <Button variant="outline" size="sm">Арбитражный процесс</Button>
          <Button variant="outline" size="sm">Трудовое право</Button>
          <Button variant="outline" size="sm">Корпоративное право</Button>
          <Button variant="outline" size="sm">Налоговое право</Button>
        </div>
      </Card>
    </div>
  );
}
