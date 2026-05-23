from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_db, close_db
from app.routers import auth, documents, contracts, user, payments, court_practice, legislation, legal_consult, support, api_keys, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Инициализация и закрытие приложения."""
    # Startup
    await init_db()
    print("[OK] База данных инициализирована")

    yield

    # Shutdown
    await close_db()
    print("[OK] Соединение с базой данных закрыто")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-юридическая платформа для автоматизации юридических задач с использованием GROQ AI",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Роуты
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(documents.router, prefix=settings.API_V1_PREFIX)
app.include_router(contracts.router, prefix=settings.API_V1_PREFIX)
app.include_router(user.router, prefix=settings.API_V1_PREFIX)
app.include_router(payments.router, prefix=settings.API_V1_PREFIX)
app.include_router(court_practice.router, prefix=settings.API_V1_PREFIX)
app.include_router(legislation.router, prefix=settings.API_V1_PREFIX)
app.include_router(legal_consult.router, prefix=settings.API_V1_PREFIX)
app.include_router(support.router, prefix=settings.API_V1_PREFIX)
app.include_router(api_keys.router, prefix=settings.API_V1_PREFIX)
app.include_router(admin.router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    """Корневой эндпоинт."""
    return {
        "name": settings.APP_NAME,
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """Проверка здоровья."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
