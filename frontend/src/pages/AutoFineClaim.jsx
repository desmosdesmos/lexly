import React, { useState } from 'react';

const AutoFineClaim = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-primary mb-8 text-center">Обжалование автоштрафов</h1>
      <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
        <p className="text-xl mb-6 text-center">ИИ-жалоба в ГИБДД, МАДИ или АМПП</p>
        <div className="space-y-4">
          <input className="w-full p-2 rounded border bg-background" placeholder="Номер постановления" />
          <input className="w-full p-2 rounded border bg-background" placeholder="Дата постановления" />
          <textarea className="w-full p-2 rounded border bg-background h-32" placeholder="Почему штраф несправедлив?" />
          <div className="p-4 bg-blue-50 border border-blue-200 rounded text-sm">
            Подсказка: Вы можете загрузить фото постановления, наш ИИ сам извлечет данные (скоро).
          </div>
          <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold">
            Сгенерировать за 190 ₽
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoFineClaim;
