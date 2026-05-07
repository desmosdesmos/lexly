import { useState } from 'react';
import { Search, Filter, ExternalLink, ThumbsUp, ThumbsDown, Calendar } from 'lucide-react';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function CaseLaw() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    setSearched(true);
  };

  const cases = [
    {
      id: 1,
      title: 'Определение ВС РФ от 15.03.2025 № 305-ЭС25-1234',
      court: 'Верховный Суд РФ',
      date: '15.03.2025',
      category: 'Взыскание задолженности',
      summary: 'Суд указал, что при взыскании задолженности по договору поставки необходимо учитывать фактическое исполнение обязательств сторонами. Отсутствие акта сверки не является основанием для отказа в иске.',
      outcome: 'positive',
      relevance: 95,
    },
    {
      id: 2,
      title: 'Постановление АС МО от 10.02.2025 № А40-12345/2025',
      court: 'Арбитражный суд Московской области',
      date: '10.02.2025',
      category: 'Договорные обязательства',
      summary: 'Арбитражный суд признал правомерным требование о взыскании неустойки в размере 0,1% за каждый день просрочки. Односторонний отказ от договора был признан незаконным.',
      outcome: 'negative',
      relevance: 88,
    },
    {
      id: 3,
      title: 'Решение АС г. Москвы от 05.01.2025 № А40-98765/2024',
      court: 'Арбитражный суд г. Москвы',
      date: '05.01.2025',
      category: 'Взыскание задолженности',
      summary: 'Суд удовлетворил требования о взыскании основного долга и процентов. Ответчик не представил доказательств исполнения обязательств по оплате.',
      outcome: 'positive',
      relevance: 92,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold mb-2">Анализ судебной практики</h1>
        <p className="text-muted-foreground">
          Найдите релевантные судебные решения и получите краткий анализ
        </p>
      </div>

      {/* Search */}
      <Card>
        <div className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Например: взыскание задолженности по договору поставки"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="w-5 h-5" />
              Найти
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
              Все суды
            </Button>
            <Button variant="outline" size="sm">
              Последний год
            </Button>
            <Button variant="outline" size="sm">
              По релевантности
            </Button>
          </div>
        </div>
      </Card>

      {searched && (
        <>
          {/* Summary */}
          <Card className="bg-gradient-to-r from-accent/10 to-primary/10">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Обобщение судебной практики</h3>
              <p className="text-sm leading-relaxed">
                По запросу "взыскание задолженности" найдено <strong>247 решений</strong>.
                Анализ показывает, что в <strong>78% случаев</strong> суды удовлетворяют требования
                о взыскании основного долга при наличии документального подтверждения задолженности.
                Ключевые факторы успеха: наличие подписанного договора, товарных накладных и направленной претензии.
              </p>
              <div className="flex gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm">
                    <strong>78%</strong> в пользу истца
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsDown className="w-5 h-5 text-red-500" />
                  <span className="text-sm">
                    <strong>22%</strong> отказ
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Results */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Найдено {cases.length} наиболее релевантных решений
            </h2>
            <div className="space-y-4">
              {cases.map((caseItem) => (
                <Card key={caseItem.id} hover>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{caseItem.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>{caseItem.court}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {caseItem.date}
                          </span>
                          <span className="px-2 py-0.5 bg-secondary rounded-md">
                            {caseItem.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">
                          Релевантность
                        </div>
                        <div className="text-2xl font-semibold text-accent">
                          {caseItem.relevance}%
                        </div>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed">{caseItem.summary}</p>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        {caseItem.outcome === 'positive' ? (
                          <>
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <span className="text-sm text-green-700">В пользу истца</span>
                          </>
                        ) : (
                          <>
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            <span className="text-sm text-red-700">Отказ в иске</span>
                          </>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                        Полный текст
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Load More */}
          <div className="text-center">
            <Button variant="outline">Загрузить еще</Button>
          </div>
        </>
      )}

      {!searched && (
        <Card>
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Начните поиск</h3>
            <p className="text-sm text-muted-foreground">
              Введите запрос для поиска релевантных судебных решений
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
