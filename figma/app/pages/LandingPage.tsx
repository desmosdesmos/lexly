import { Link } from 'react-router';
import { FileText, Shield, Scale, TrendingUp, CheckCircle, Sparkles, Zap, Lock } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export function LandingPage() {
  const features = [
    {
      icon: FileText,
      title: 'Генерация исков',
      description: 'Автоматическое создание исковых заявлений и процессуальных документов',
    },
    {
      icon: Shield,
      title: 'Проверка договоров',
      description: 'Анализ рисков и выявление проблемных условий в договорах',
    },
    {
      icon: Scale,
      title: 'Анализ судебной практики',
      description: 'Быстрый поиск и обобщение релевантных судебных решений',
    },
    {
      icon: TrendingUp,
      title: 'Мониторинг законов',
      description: 'Отслеживание изменений в законодательстве в режиме реального времени',
    },
  ];

  const steps = [
    { number: '01', title: 'Введите данные', description: 'Опишите вашу задачу или загрузите документ' },
    { number: '02', title: 'AI обрабатывает', description: 'Система анализирует информацию за секунды' },
    { number: '03', title: 'Получите результат', description: 'Готовый документ или анализ в удобном формате' },
  ];

  const pricing = [
    {
      name: 'Базовый',
      price: '2 990',
      period: 'мес',
      features: ['10 документов/мес', 'Проверка договоров', 'Базовая поддержка'],
    },
    {
      name: 'Профессиональный',
      price: '9 990',
      period: 'мес',
      features: ['100 документов/мес', 'Все функции', 'Приоритетная поддержка', 'API доступ'],
      popular: true,
    },
    {
      name: 'Корпоративный',
      price: 'По запросу',
      period: '',
      features: ['Неограниченно', 'Индивидуальная настройка', 'Выделенный менеджер', 'SLA 99.9%'],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-8 h-8 text-accent" />
              <span className="text-xl font-semibold text-primary">AI-Юрист</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Возможности
              </a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                Как работает
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Тарифы
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button variant="ghost">Войти</Button>
              </Link>
              <Link to="/dashboard">
                <Button>Начать бесплатно</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm text-accent">Искусственный интеллект для юристов</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-semibold text-foreground mb-6 leading-tight">
              Ваш AI-юрист для решения задач за минуты
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Автоматизация юридических процессов с помощью искусственного интеллекта.
              Создавайте документы, анализируйте договоры и находите судебную практику мгновенно.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg">
                  <Zap className="w-5 h-5" />
                  Попробовать бесплатно
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Смотреть демо
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              <Lock className="w-4 h-4 inline mr-1" />
              Ваши данные защищены • Соответствие ФЗ-152
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold mb-4">Основные возможности</h2>
            <p className="text-xl text-muted-foreground">
              Полный набор инструментов для юридической работы
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} hover>
                <div className="flex flex-col items-start">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold mb-4">Как это работает</h2>
            <p className="text-xl text-muted-foreground">
              Три простых шага к результату
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-semibold">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold mb-4">Выберите свой тариф</h2>
            <p className="text-xl text-muted-foreground">
              Прозрачные цены для любого размера бизнеса
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan, index) => (
              <Card
                key={index}
                className={plan.popular ? 'border-2 border-accent relative' : ''}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full text-sm">
                    Популярный
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-semibold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground ml-2">₽/{plan.period}</span>}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/dashboard">
                    <Button
                      variant={plan.popular ? 'primary' : 'outline'}
                      className="w-full"
                    >
                      Выбрать план
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Scale className="w-6 h-6 text-accent" />
              <span className="font-semibold text-primary">AI-Юрист</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2026 AI-Юрист. Все права защищены.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
