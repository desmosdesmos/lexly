import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentsAPI, purchasesAPI } from '../services/api';
import { Loader } from '../components/ui/Loader';

const MarketplaceClaim = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    marketplace_name: 'Wildberries',
    seller_name: '',
    seller_inn: '',
    seller_address: '',
    problem_type: 'uterya',
    amount: '',
    circumstances: '',
    doc_numbers: ''
  });
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Подготовка данных для API
      const apiData = {
        ...formData,
        claims: formData.problem_type === 'uterya' ? 'Выплатить стоимость утерянного товара' : 'Отменить незаконный штраф'
      };
      
      const response = await documentsAPI.generate('wb_claim', apiData);
      setPreview(response.generated_content);
      setDocumentId(response.id);
      setStep(3);
    } catch (error) {
      console.error("Generation error", error);
      alert("Ошибка при генерации. Проверьте лимиты или попробуйте позже.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const purchase = await purchasesAPI.create(documentId, 490);
      // В реальности — редирект на purchase.payment_url
      // Для демо — сразу подтверждаем
      await purchasesAPI.confirmMock(purchase.purchase_id);
      
      // После оплаты скачиваем
      const downloadUrl = `/api/v1/documents/${documentId}/download/pdf`;
      window.open(downloadUrl, '_blank');
      alert("Оплата успешно прошла! Документ открыт в новой вкладке.");
    } catch (error) {
      console.error("Payment error", error);
      alert("Ошибка при обработке платежа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4 text-white">Генератор претензий к Wildberries / Ozon</h1>
        <p className="text-xl text-slate-400">
          Верните деньги за утерю товара или незаконные штрафы за 5 минут.
        </p>
      </div>

      <div className="bg-[#0F172A] p-8 rounded-xl shadow-lg border border-white/5">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Шаг 1: Ваша информация</h2>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Маркетплейс</label>
              <select 
                className="w-full p-3 rounded-lg border border-white/10 bg-[#1E293B] text-white"
                value={formData.marketplace_name}
                onChange={(e) => setFormData({...formData, marketplace_name: e.target.value})}
              >
                <option>Wildberries</option>
                <option>Ozon</option>
                <option>Яндекс.Маркет</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Название ИП/ООО</label>
                <input 
                  className="w-full p-3 rounded-lg border border-white/10 bg-[#1E293B] text-white"
                  placeholder="ИП Иванов И.И."
                  value={formData.seller_name}
                  onChange={(e) => setFormData({...formData, seller_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">ИНН</label>
                <input 
                  className="w-full p-3 rounded-lg border border-white/10 bg-[#1E293B] text-white"
                  placeholder="123456789012"
                  value={formData.seller_inn}
                  onChange={(e) => setFormData({...formData, seller_inn: e.target.value})}
                />
              </div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Юридический адрес</label>
                <input 
                  className="w-full p-3 rounded-lg border border-white/10 bg-[#1E293B] text-white"
                  placeholder="г. Москва, ул. Ленина, д. 1"
                  value={formData.seller_address}
                  onChange={(e) => setFormData({...formData, seller_address: e.target.value})}
                />
              </div>
            <button 
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              onClick={() => setStep(2)}
            >
              Далее
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Шаг 2: Суть проблемы</h2>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Тип проблемы</label>
              <select 
                className="w-full p-3 rounded-lg border border-white/10 bg-[#1E293B] text-white"
                value={formData.problem_type}
                onChange={(e) => setFormData({...formData, problem_type: e.target.value})}
              >
                <option value="uterya">Утеря товара на складе / при логистике</option>
                <option value="fine">Незаконный штраф (габариты, КИЗ и др.)</option>
                <option value="block">Блокировка личного кабинета / счета</option>
                <option value="damage">Повреждение товара</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Сумма ущерба (₽)</label>
                <input 
                  className="w-full p-3 rounded-lg border border-white/10 bg-[#1E293B] text-white" 
                  placeholder="50000"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Номера актов / тикетов</label>
                <input 
                  className="w-full p-3 rounded-lg border border-white/10 bg-[#1E293B] text-white" 
                  placeholder="Акт №123, Тикет №456"
                  value={formData.doc_numbers}
                  onChange={(e) => setFormData({...formData, doc_numbers: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Описание ситуации</label>
              <textarea 
                className="w-full p-3 rounded-lg border border-white/10 bg-[#1E293B] text-white h-32" 
                placeholder="Опишите подробно, что произошло..."
                value={formData.circumstances}
                onChange={(e) => setFormData({...formData, circumstances: e.target.value})}
              />
            </div>
            <div className="flex gap-4">
              <button className="flex-1 py-4 border border-white/10 rounded-xl text-slate-300 hover:bg-white/5" onClick={() => setStep(1)}>Назад</button>
              <button 
                className="flex-[2] py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? "ИИ составляет претензию..." : "Сгенерировать черновик"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20 text-blue-400">
              ✅ <strong>Черновик готов!</strong> ИИ проанализировал вашу ситуацию и подготовил текст претензии.
            </div>
            
            <div className="bg-[#1E293B] p-6 rounded-lg font-serif opacity-75 relative overflow-hidden h-64 border border-dashed border-white/10">
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] to-transparent pointer-events-none"></div>
              <pre className="whitespace-pre-wrap text-slate-300 text-sm">{preview}</pre>
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="font-bold text-blue-400">Это превью. Полный документ доступен после оплаты.</p>
              </div>
            </div>

            <div className="bg-green-500/5 p-6 rounded-xl border border-green-500/20 text-center">
              <h3 className="text-2xl font-bold text-green-400 mb-2">Получить готовую претензию</h3>
              <p className="text-slate-400 mb-6 text-sm">
                Вы получите полностью готовый PDF и DOCX файл с водяным знаком LAXLY LAW, 
                который можно сразу отправлять через ЭДО или Почтой России.
              </p>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold mb-4 text-white">490 ₽</span>
                <button 
                  className="w-full max-w-sm py-4 bg-green-600 text-white rounded-xl font-bold text-xl shadow-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? <Loader size="sm" className="inline mr-2" /> : null}
                  Оплатить и скачать
                </button>
                <p className="mt-4 text-[10px] text-slate-500 uppercase tracking-widest">
                  Безопасная оплата • Чек на email • Гарантия возврата
                </p>
              </div>
            </div>
            
            <button className="w-full text-sm text-slate-500 underline" onClick={() => setStep(2)}>
              Изменить данные
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceClaim;
