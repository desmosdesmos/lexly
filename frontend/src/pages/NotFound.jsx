import { Link } from 'react-router-dom'
import { AlertTriangle, Home } from 'lucide-react'
import { Button } from '../components/ui/Button'

export function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
        <h1 className="text-6xl font-semibold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Страница не найдена</h2>
        <p className="text-muted-foreground mb-8">
          Запрашиваемая страница не существует или была удалена
        </p>
        <Link to="/">
          <Button size="lg">
            <Home className="w-5 h-5" />
            На главную
          </Button>
        </Link>
      </div>
    </div>
  )
}
