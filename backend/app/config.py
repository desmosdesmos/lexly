from pydantic_settings import BaseSettings
from typing import List
from pydantic import field_validator


class Settings(BaseSettings):
    # Приложение
    APP_NAME: str = "Law AI Agent"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-this-secret-key-in-production"
    API_V1_PREFIX: str = "/api/v1"

    # База данных
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "law_ai_agent"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/law_ai_agent"

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_URL: str = "redis://localhost:6379/0"

    # n8n
    N8N_WEBHOOK_URL: str = "http://localhost:5678/webhook"
    N8N_API_KEY: str = ""

    # AI Provider (groq or openai)
    AI_PROVIDER: str = "groq"
    
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
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
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

    # Логирование
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

