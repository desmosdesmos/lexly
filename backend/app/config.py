from pydantic_settings import BaseSettings
from typing import List
from pydantic import field_validator


class Settings(BaseSettings):
    # Приложение
    APP_NAME: str = "Laxly"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-this-secret-key-in-production"
    API_V1_PREFIX: str = "/api/v1"

    # База данных
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "laxly"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/laxly"

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_URL: str = "redis://localhost:6379/0"

    # n8n
    N8N_WEBHOOK_URL: str = "http://localhost:5678/webhook"
    N8N_API_KEY: str = ""

    # AI Provider (gigachat, groq or openai)
    AI_PROVIDER: str = "gigachat"

    # GigaChat API
    GIGACHAT_CLIENT_ID: str = ""
    GIGACHAT_CLIENT_SECRET: str = ""
    GIGACHAT_SCOPE: str = "GIGACHAT_API_PERS"
    GIGACHAT_MODEL: str = "GigaChat-Pro"
    GIGACHAT_MAX_TOKENS: int = 8192
    GIGACHAT_TEMPERATURE: float = 0.2
    GIGACHAT_API_URL: str = "https://gigachat.devices.sberbank.ru/api/v1"

    # GROQ API
    GROQ_API_KEY: str = ""
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_MAX_TOKENS: int = 8192
    GROQ_TEMPERATURE: float = 0.2

    # OpenAI API (fallback)
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    OPENAI_MODEL: str = "gpt-4o"
    AI_MAX_TOKENS: int = 4000
    AI_TEMPERATURE: float = 0.3
    
    # Общие AI настройки
    AI_SYSTEM_PROMPT_FILE: str = ""  # Кастомный системный промпт

    # JWT
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 дней
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # Файлы
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_FILE_TYPES: str = "pdf,doc,docx"

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 10

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""

    # YooKassa
    YOOKASSA_SHOP_ID: str = "1360639"
    YOOKASSA_SECRET_KEY: str = ""
    YOOKASSA_RETURN_URL: str = "https://laxlylaw.ru/dashboard/profile"

    # Admin
    ADMIN_EMAILS: List[str] = ["yan.pashhenko6486@gmail.com", "desmosymail@gmail.com"]


    # Email (для восстановления пароля и уведомлений)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""
    SMTP_FROM_NAME: str = "Пащенко Ян"
    RESEND_API_KEY: str = ""

    # Telegram Bot (для уведомлений админу)
    TELEGRAM_BOT_TOKEN: str = "8470156263:AAGM25GR-y9gUxREqxEvEMdo5mCmG16_tME"
    TELEGRAM_ADMIN_CHAT_ID: str = "478799066"

    # Логирование
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

