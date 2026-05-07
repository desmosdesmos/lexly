import { useState } from 'react';
import { Upload, FileText, AlertTriangle, MessageCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';

export function ContractCheck() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 3000);
  };

  const risks = [
    {
      severity: 'high',
      title: 'Отсутствие ограничения ответственности',
      description: 'В договоре не предусмотрено ограничение размера неустойки. Рекомендуется добавить пункт об ограничении неустойки суммой договора.',
      clause: 'Пункт 7.2',
    },
    {
      severity: 'medium',
      title: 'Нечеткая формулировка сроков',
      description: 'Срок поставки указан как "в течение разумного срока", что может привести к спорам. Рекомендуется указать конкретный срок в днях.',
      clause: 'Пункт 3.1',
    },
  ];

  const comments = [
    {
      clause: 'Пункт 4.1',
      text: 'Рекомендуется уточнить порядок приемки товара и срок для выявления недостатков.',
    },
    {
      clause: 'Пункт 8.3',
      text: 'Стоит добавить положение о досудебном порядке урегулирования споров.',
    },
  ];

  const recommendations = [
    'Добавить пункт о форс-мажорных обстоятельствах',
    'Указать применимое право и подсудность споров',
    'Предусмотреть возможность одностороннего отказа от договора',
    'Уточнить порядок внесения изменений в договор',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold mb-2">Проверка договора</h1>
        <p className="text-muted-foreground">
          Загрузите договор для анализа рисков и получения рекомендаций
        </p>
      </div>

      {!analyzed ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Area */}
          <Card className="lg:col-span-2">
            <div className="text-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer block p-12 border-2 border-dashed border-border rounded-xl hover:border-accent hover:bg-accent/5 transition-all"
              >
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {file ? file.name : 'Загрузите договор'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Поддерживаемые форматы: PDF, DOC, DOCX
                </p>
              </label>
            </div>

            {file && (
              <div className="mt-6 flex items-center justify-between p-4 bg-secondary rounded-xl">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-accent" />
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                </div>
                <Button onClick={handleAnalyze} disabled={analyzing}>
                  {analyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Анализ...
                    </>
                  ) : (
                    'Проанализировать'
                  )}
                </Button>
              </div>
            )}
          </Card>

          {/* Info Cards */}
          <Card>
            <h3 className="font-semibold mb-4">Что мы проверяем</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm">Наличие обязательных условий</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm">Юридические риски и противоречия</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm">Соответствие законодательству</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm">Нечеткие формулировки</span>
              </li>
            </ul>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Время анализа</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Обычно анализ занимает от 30 секунд до 2 минут в зависимости от объема документа
            </p>
            <div className="flex items-center gap-2 text-sm text-accent">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              AI анализирует документ...
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-red-500">
              <div className="text-center">
                <div className="text-3xl font-semibold text-red-500 mb-1">
                  {risks.filter(r => r.severity === 'high').length}
                </div>
                <div className="text-sm text-muted-foreground">Критические риски</div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <div className="text-center">
                <div className="text-3xl font-semibold text-yellow-600 mb-1">
                  {risks.filter(r => r.severity === 'medium').length}
                </div>
                <div className="text-sm text-muted-foreground">Умеренные риски</div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <div className="text-center">
                <div className="text-3xl font-semibold text-blue-500 mb-1">
                  {recommendations.length}
                </div>
                <div className="text-sm text-muted-foreground">Рекомендации</div>
              </div>
            </Card>
          </div>

          {/* Risks */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              Выявленные риски
            </h2>
            <div className="space-y-4">
              {risks.map((risk, index) => (
                <Alert key={index} type={risk.severity === 'high' ? 'error' : 'warning'}>
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{risk.title}</h4>
                      <span className="text-xs bg-white/50 px-2 py-1 rounded">
                        {risk.clause}
                      </span>
                    </div>
                    <p className="text-sm">{risk.description}</p>
                  </div>
                </Alert>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-blue-500" />
              Комментарии
            </h2>
            <Card>
              <div className="space-y-4">
                {comments.map((comment, index) => (
                  <div key={index} className="pb-4 border-b last:border-b-0 border-border">
                    <div className="font-medium mb-1">{comment.clause}</div>
                    <p className="text-sm text-muted-foreground">{comment.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recommendations */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Рекомендации
            </h2>
            <Card>
              <ul className="space-y-3">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={() => { setAnalyzed(false); setFile(null); }}>
              Проверить другой договор
            </Button>
            <Button variant="outline">
              Скачать отчет
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
