import React, { useState } from 'react';

const ConsumerClaim = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-primary mb-8 text-center">Защита прав потребителей</h1>
      <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
        <p className="text-xl mb-6 text-center">Генератор претензий на возврат денег (ЗОПП)</p>
        <div className="space-y-4">
          <input className="w-full p-2 rounded border bg-background" placeholder="Что вы купили?" />
          <input className="w-full p-2 rounded border bg-background" placeholder="Название магазина" />
          <textarea className="w-full p-2 rounded border bg-background h-32" placeholder="Опишите причину возврата" />
          <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold">
            Сгенерировать за 299 ₽
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsumerClaim;
