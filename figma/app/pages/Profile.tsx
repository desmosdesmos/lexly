import { User, CreditCard, Bell, Shield } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ProgressBar } from '../components/ProgressBar';

export function Profile() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold mb-2">Профиль и настройки</h1>
        <p className="text-muted-foreground">
          Управление аккаунтом и подпиской
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-semibold">Личная информация</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Имя" defaultValue="Иван" />
                <Input label="Фамилия" defaultValue="Иванов" />
              </div>
              <Input label="Email" type="email" defaultValue="user@example.com" />
              <Input label="Организация" defaultValue="ООО 'Юридическая компания'" />
              <Button>Сохранить изменения</Button>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-semibold">Подписка</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl">
                <div>
                  <h3 className="font-semibold mb-1">Профессиональный план</h3>
                  <p className="text-sm text-muted-foreground">
                    9 990 ₽/мес • Продлится 16.04.2026
                  </p>
                </div>
                <div className="text-right">
                  <div className="px-3 py-1 bg-accent text-white rounded-full text-sm">
                    Активна
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Использование лимита</h4>
                <div className="space-y-4">
                  <ProgressBar value={35} max={100} label="Документы" />
                  <ProgressBar value={12} max={50} label="Проверки договоров" />
                  <ProgressBar value={8} max={100} label="Запросы судебной практики" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline">Изменить план</Button>
                <Button variant="outline">История платежей</Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-semibold">Уведомления</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Email уведомления о новых законах</span>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span>Уведомления о завершении анализа</span>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span>Еженедельная сводка по практике</span>
                <input type="checkbox" className="w-5 h-5" />
              </label>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">Безопасность</h3>
            </div>
            <div className="space-y-3">
              <Button variant="outline" className="w-full">
                Изменить пароль
              </Button>
              <Button variant="outline" className="w-full">
                Двухфакторная аутентификация
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Статистика</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Создано документов</span>
                <span className="font-semibold">127</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Проверено договоров</span>
                <span className="font-semibold">43</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Запросов практики</span>
                <span className="font-semibold">89</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Дней с нами</span>
                <span className="font-semibold">156</span>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-accent to-primary text-white">
            <h3 className="font-semibold mb-2">Нужна помощь?</h3>
            <p className="text-sm opacity-90 mb-4">
              Свяжитесь с нашей службой поддержки
            </p>
            <Button variant="outline" className="w-full bg-white text-primary hover:bg-white/90">
              Написать в поддержку
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
