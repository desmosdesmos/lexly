import { Link } from 'react-router';
import { FileText, Shield, Scale, TrendingUp, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';

export function DashboardHome() {
  const quickActions = [
    {
      icon: FileText,
      title: 'Генератор документов',
      description: 'Создайте исковое заявление или жалобу',
      link: '/dashboard/documents',
      color: 'bg-blue-500',
    },
    {
      icon: Shield,
      title: 'Проверка договора',
      description: 'Проанализируйте риски в договоре',
      link: '/dashboard/contracts',
      color: 'bg-green-500',
    },
    {
      icon: Scale,
      title: 'Судебная практика',
      description: 'Найдите релевантные решения судов',
      link: '/dashboard/case-law',
      color: 'bg-purple-500',
    },
    {
      icon: TrendingUp,
      title: 'Мониторинг законов',
      description: 'Отслеживайте изменения законодательства',
      link: '/dashboard/monitoring',
      color: 'bg-orange-500',
    },
  ];

  const recentActivity = [
    { id: 1, type: 'document', title: 'Исковое заявление о взыскании долга', time: '2 часа назад', status: 'completed' },
    { id: 2, type: 'contract', title: 'Договор поставки товаров', time: '5 часов назад', status: 'completed' },
    { id: 3, type: 'case-law', title: 'Поиск: "взыскание неустойки"', time: '1 день назад', status: 'completed' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold mb-2">Добро пожаловать в AI-Юрист</h1>
        <p className="text-muted-foreground">
          Используйте возможности искусственного интеллекта для решения юридических задач
        </p>
      </div>

      {/* Usage Stats */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Использование в этом месяце</h3>
            <p className="text-sm text-muted-foreground mb-4">
              План: Профессиональный • До конца периода: 12 дней
            </p>
            <ProgressBar value={35} max={100} label="Документы" />
          </div>
          <Link to="/dashboard/profile">
            <Button variant="outline">
              Управление подпиской
            </Button>
          </Link>
        </div>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link}>
              <Card hover className="h-full">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {action.description}
                    </p>
                    <div className="flex items-center gap-1 text-accent text-sm">
                      Перейти
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Недавняя активность</h2>
        <Card>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-b-0 border-border">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    {activity.status === 'completed' && <CheckCircle className="w-5 h-5 text-accent" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium mb-1">{activity.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">История пуста</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
