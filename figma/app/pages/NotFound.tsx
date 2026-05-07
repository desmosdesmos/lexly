import { Link } from 'react-router';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';

export function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-semibold text-accent mb-4">404</h1>
        <h2 className="text-3xl font-semibold mb-4">Страница не найдена</h2>
        <p className="text-muted-foreground mb-8">
          К сожалению, запрашиваемая страница не существует или была перемещена
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard">
            <Button>
              <Home className="w-5 h-5" />
              На главную
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5" />
            Назад
          </Button>
        </div>
      </div>
    </div>
  );
}
