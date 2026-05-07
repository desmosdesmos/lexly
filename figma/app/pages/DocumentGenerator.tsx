import { useState } from 'react';
import { FileText, Download, Copy, Edit3 } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Select } from '../components/Select';
import { Loader } from '../components/Loader';

export function DocumentGenerator() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const documentTypes = [
    { value: 'claim', label: 'Исковое заявление' },
    { value: 'complaint', label: 'Жалоба' },
    { value: 'petition', label: 'Ходатайство' },
    { value: 'objection', label: 'Возражение' },
  ];

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setGenerated(true);
    }, 2000);
  };

  const generatedDocument = `ИСКОВОЕ ЗАЯВЛЕНИЕ
о взыскании задолженности

В Тверской районный суд г. Москвы
Истец: ООО "Компания"
ОГРН: 1234567890123
Адрес: г. Москва, ул. Примерная, д. 1

Ответчик: ООО "Должник"
ОГРН: 9876543210987
Адрес: г. Москва, ул. Другая, д. 2

Цена иска: 500 000 руб.
Госпошлина: 8 200 руб.

ИСКОВОЕ ЗАЯВЛЕНИЕ

На основании договора поставки № 123 от 15.01.2025 Истец передал Ответчику товар на сумму 500 000 руб.

Согласно условиям договора, оплата должна была быть произведена в течение 10 дней с момента получения товара. Товар был получен Ответчиком 20.01.2025, что подтверждается товарной накладной.

Однако до настоящего момента оплата не произведена, несмотря на направленные претензии.

На основании изложенного, руководствуясь ст. 309, 310 ГК РФ,

ПРОШУ:

1. Взыскать с ООО "Должник" в пользу ООО "Компания" задолженность в размере 500 000 руб.
2. Взыскать с Ответчика расходы по уплате государственной пошлины.

Приложения:
1. Копия договора поставки
2. Товарная накладная
3. Претензия
4. Платежное поручение об уплате госпошлины

Дата: 04.04.2026                                                  Подпись: _____________`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold mb-2">Генератор документов</h1>
        <p className="text-muted-foreground">
          Создайте профессиональные юридические документы за минуты
        </p>
      </div>

      {!generated ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Steps Progress */}
          <div className="lg:col-span-1">
            <Card>
              <h3 className="font-semibold mb-4">Шаги создания</h3>
              <div className="space-y-4">
                {[
                  { num: 1, label: 'Тип документа' },
                  { num: 2, label: 'Стороны' },
                  { num: 3, label: 'Описание ситуации' },
                ].map((s) => (
                  <div
                    key={s.num}
                    className={`flex items-center gap-3 ${
                      step >= s.num ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step >= s.num
                          ? 'bg-accent text-white'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {s.num}
                    </div>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Выберите тип документа</h3>
                  <Select
                    label="Тип документа"
                    options={documentTypes}
                  />
                  <Button onClick={() => setStep(2)} className="w-full">
                    Далее
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Укажите стороны</h3>
                  <Input label="Истец (ваша организация/вы)" placeholder="ООО 'Компания'" />
                  <Input label="ОГРН/ИНН истца" placeholder="1234567890123" />
                  <Input label="Ответчик" placeholder="ООО 'Должник'" />
                  <Input label="ОГРН/ИНН ответчика" placeholder="9876543210987" />
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Назад
                    </Button>
                    <Button onClick={() => setStep(3)} className="flex-1">
                      Далее
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Опишите ситуацию</h3>
                  <Textarea
                    label="Описание обстоятельств дела"
                    placeholder="Например: По договору поставки № 123 от 15.01.2025 была передана продукция на сумму 500 000 руб. Оплата не произведена..."
                    rows={8}
                  />
                  <Input label="Сумма требований (руб.)" type="number" placeholder="500000" />
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Назад
                    </Button>
                    <Button onClick={handleGenerate} className="flex-1" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader size="sm" />
                          Генерация...
                        </>
                      ) : (
                        <>
                          <FileText className="w-5 h-5" />
                          Сгенерировать
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Result Actions */}
          <Card>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button>
                <Download className="w-5 h-5" />
                Скачать PDF
              </Button>
              <Button variant="outline">
                <Copy className="w-5 h-5" />
                Скопировать текст
              </Button>
              <Button variant="outline">
                <Edit3 className="w-5 h-5" />
                Редактировать
              </Button>
              <Button variant="ghost" onClick={() => { setGenerated(false); setStep(1); }}>
                Создать новый
              </Button>
            </div>
          </Card>

          {/* Generated Document */}
          <Card>
            <h3 className="text-xl font-semibold mb-6">Результат</h3>
            <div className="bg-secondary p-8 rounded-xl border border-border">
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {generatedDocument}
              </pre>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
