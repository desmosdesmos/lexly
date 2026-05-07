"""Генератор кодов активации подписки."""
import secrets
import string
import json
from datetime import datetime


def generate_code(plan_id="pro", months=1):
    """Сгенерировать код активации."""
    code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
    return {
        'code': code,
        'plan_id': plan_id,
        'months': months,
        'generated_at': datetime.now().isoformat()
    }


if __name__ == "__main__":
    print("🔑 ГЕНЕРАТОР КОДОВ АКТИВАЦИИ")
    print("=" * 60)
    print("\nДоступные тарифы:")
    print("  1. basic   — 990 ₽/мес")
    print("  2. pro     — 2 990 ₽/мес")
    print("  3. enterprise — 9 990 ₽/мес")
    print("\nВведите номер тарифа (1-3):")
    
    choice = input("> ").strip()
    
    plans = {
        '1': ('basic', 990),
        '2': ('pro', 2990),
        '3': ('enterprise', 9990),
    }
    
    if choice not in plans:
        print("❌ Неверный выбор")
        exit(1)
    
    plan_id, price = plans[choice]
    months = int(input("На сколько месяцев? [1]: ").strip() or "1")
    
    # Генерируем код
    code_data = generate_code(plan_id, months)
    
    print(f"\n✅ КОД АКТИВАЦИИ:")
    print(f"   📝 Код: {code_data['code']}")
    print(f"   💼 Тариф: {plan_id} ({price} ₽/мес)")
    print(f"   📅 Срок: {months} мес.")
    print(f"\n📋 Отправьте этот код клиенту в Telegram")
    print(f"   Для активации клиент введёт код в профиле")
    
    # Сохраняем в JSON файл
    codes_file = f"activation_codes_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(codes_file, 'w', encoding='utf-8') as f:
        json.dump([code_data], f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Сохранено в: {codes_file}")
