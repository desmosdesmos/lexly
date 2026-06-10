from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import uuid
import secrets
import logging

from app.database import get_db
from app.models.user import User
from app.models.usage_limit import UsageLimit
from app.models.subscription import Subscription
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    authenticate_user,
    decode_token,
)
from app.services.email_service import email_service
from app.services.telegram_notifier import telegram_notifier
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Аутентификация"])
logger = logging.getLogger(__name__)


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    summary="Регистрация пользователя",
)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Зарегистрировать нового пользователя.

    - **email**: Email адрес
    - **password**: Пароль (минимум 8 символов, заглавные и строчные буквы, цифры)
    - **full_name**: Полное имя
    - **user_type**: Тип пользователя (individual или legal)
    """
    # Проверка, существует ли пользователь
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким email уже существует",
        )

    # Создание пользователя
    new_user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        full_name=user_data.full_name,
        user_type=user_data.user_type,
        phone=user_data.phone,
        company_name=user_data.company_name,
        company_inn=user_data.company_inn,
        email_verified=False,  # Требуется подтверждение
        pdp_consent=user_data.pdp_consent,
        pdp_consent_date=datetime.utcnow() if user_data.pdp_consent else None,
        marketing_consent=user_data.marketing_consent,
    )

    db.add(new_user)
    await db.flush()

    # Создание записей в subscription и usage_limits (через триггер или вручную)
    subscription = Subscription(
        user_id=new_user.id,
        plan_type="free",
        status="active",
    )
    db.add(subscription)

    usage_limit = UsageLimit(
        user_id=new_user.id,
        plan_type="free",
        max_documents=5,
        max_contracts=3,
    )
    db.add(usage_limit)

    await db.commit()
    await db.refresh(new_user)

    # Генерируем и отправляем код подтверждения
    try:
        from app.services.email_service import email_service
        code = secrets.randbelow(1000000)
        code_str = f"{code:06d}"
        expires_at = datetime.utcnow() + timedelta(minutes=10)

        new_user.email_verification_code = code_str
        new_user.email_verification_code_expires = expires_at
        await db.commit()

        # Отправляем код через Resend
        await email_service.send_verification_code(new_user.email, code_str)
        logger.info(f"Код подтверждения отправлен на {new_user.email}: {code_str}")
    except Exception as e:
        logger.warning(f"Не удалось отправить код: {e}")

    # Уведомление в Telegram
    try:
        await telegram_notifier.notify_registration(
            user_email=new_user.email,
            user_name=new_user.full_name,
            user_type=new_user.user_type,
        )
    except Exception as e:
        logger.warning(f"Failed to send Telegram notification: {e}")

    # Возвращаем пользователя
    return {
        "id": str(new_user.id),
        "email": new_user.email,
        "full_name": new_user.full_name,
        "user_type": new_user.user_type,
        "email_verified": False,
    }


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Вход в систему",
)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Аутентифицировать пользователя и вернуть токены.

    - **email**: Email адрес
    - **password**: Пароль
    """
    user = await authenticate_user(credentials.email, credentials.password, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Учётная запись деактивирована",
        )

    # Проверка подтверждения email
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="email_not_verified",
        )

    # Создание токенов
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    # Уведомление в Telegram
    try:
        await telegram_notifier.notify_login(
            user_email=user.email,
            user_name=user.full_name,
        )
    except Exception as e:
        logger.warning(f"Failed to send Telegram notification: {e}")

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Обновление токена",
)
async def refresh_token(token: str, db: AsyncSession = Depends(get_db)):
    """
    Обновить access token с помощью refresh token.
    """
    try:
        payload = decode_token(token)
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный тип токена",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный токен",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Пользователь не найден или деактивирован",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Создание новых токенов
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Ошибка обновления токена: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


class GoogleAuthRequest(BaseModel):
    credential: str


@router.post(
    "/google",
    status_code=status.HTTP_403_FORBIDDEN,
    summary="Вход через Google (Отключен)",
)
async def google_login():
    """
    Вход через Google отключен в соответствии с законодательством РФ (149-ФЗ).
    """
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Вход через зарубежные сервисы авторизации (Google) отключен в соответствии с требованиями Федерального закона № 149-ФЗ. Используйте вход по email или отечественные сервисы.",
    )


class YandexAuthRequest(BaseModel):
    code: str


@router.post(
    "/yandex",
    response_model=TokenResponse,
    summary="Вход через Яндекс ID",
)
async def yandex_login(request: YandexAuthRequest, db: AsyncSession = Depends(get_db)):
    """
    Вход или регистрация через Яндекс ID (149-ФЗ).
    """
    # Если ключи не настроены или передан демо-код, используем демо-режим для тестирования
    if not settings.YANDEX_CLIENT_ID or not settings.YANDEX_CLIENT_SECRET or request.code.startswith("mock_"):
        logger.info("Использование демонстрационного режима для Яндекс ID")
        email = "yandex_test@laxlylaw.ru"
        full_name = "Тестовый Пользователь Яндекс"
        
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if user:
            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Учётная запись деактивирована",
                )
        else:
            user = User(
                id=str(uuid.uuid4()),
                email=email,
                password_hash="",
                full_name=full_name,
                user_type="individual",
                email_verified=True,
                is_active=True,
            )
            db.add(user)
            await db.flush()
            
            subscription = Subscription(user_id=user.id, plan_type="free", status="active")
            db.add(subscription)
            usage_limit = UsageLimit(user_id=user.id, plan_type="free", max_documents=2, max_contracts=2)
            db.add(usage_limit)
            await db.commit()
            await db.refresh(user)
            
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    import httpx
    try:
        async with httpx.AsyncClient() as client:
            token_resp = await client.post(
                "https://oauth.yandex.ru/token",
                data={
                    "grant_type": "authorization_code",
                    "code": request.code,
                    "client_id": settings.YANDEX_CLIENT_ID,
                    "client_secret": settings.YANDEX_CLIENT_SECRET,
                },
                timeout=10.0,
            )
            
            if token_resp.status_code != 200:
                logger.error(f"Yandex token error: {token_resp.text}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Не удалось получить токен доступа от Яндекс",
                )
            
            token_data = token_resp.json()
            access_token_yandex = token_data.get("access_token")
            
            profile_resp = await client.get(
                "https://login.yandex.ru/info?format=json",
                headers={"Authorization": f"OAuth {access_token_yandex}"},
                timeout=10.0,
            )
            
            if profile_resp.status_code != 200:
                logger.error(f"Yandex profile error: {profile_resp.text}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Не удалось получить данные профиля Яндекс",
                )
                
            profile_data = profile_resp.json()
            email = profile_data.get("default_email") or (profile_data.get("emails")[0] if profile_data.get("emails") else None)
            full_name = profile_data.get("display_name") or profile_data.get("real_name") or "Пользователь Яндекс"
            
            if not email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Не удалось получить email из Яндекс профиля",
                )
                
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()
            
            if user:
                if not user.is_active:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Учётная запись деактивирована",
                    )
            else:
                user = User(
                    id=str(uuid.uuid4()),
                    email=email,
                    password_hash="",
                    full_name=full_name,
                    user_type="individual",
                    email_verified=True,
                    is_active=True,
                )
                db.add(user)
                await db.flush()
                
                subscription = Subscription(user_id=user.id, plan_type="free", status="active")
                db.add(subscription)
                usage_limit = UsageLimit(user_id=user.id, plan_type="free", max_documents=2, max_contracts=2)
                db.add(usage_limit)
                await db.commit()
                await db.refresh(user)
                
            access_token = create_access_token(data={"sub": str(user.id)})
            refresh_token = create_refresh_token(data={"sub": str(user.id)})
            
            return TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                token_type="bearer",
                expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            )
            
    except httpx.HTTPError as e:
        logger.error(f"HTTP request to Yandex failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка соединения с сервисом Яндекс: {str(e)}",
        )






# ========== Восстановление пароля ==========

class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


# ========== Подтверждение Email кодом ==========

class VerifyEmailCodeRequest(BaseModel):
    email: EmailStr
    code: str


class ResendCodeRequest(BaseModel):
    email: EmailStr


@router.post(
    "/send-verification-code",
    summary="Отправить код подтверждения email",
    status_code=status.HTTP_200_OK,
)
async def send_verification_code(
    request: ResendCodeRequest,
    db: AsyncSession = Depends(get_db),
):
    """Отправить 6-значный код на email для подтверждения."""
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user or user.email_verified:
        return {"message": "ok"}

    # Генерируем 6-значный код
    code = secrets.randbelow(1000000)
    code_str = f"{code:06d}"
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    user.email_verification_code = code_str
    user.email_verification_code_expires = expires_at
    await db.commit()

    # Отправляем письмо с кодом
    email_sent = await email_service.send_verification_code(request.email, code_str)

    if not email_sent:
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(
            f"Не удалось отправить код подтверждения: {request.email}. "
            f"Код: {code_str} (для тестирования)"
        )

    return {"message": "Код отправлен на email"}


@router.post(
    "/verify-email",
    summary="Подтвердить email кодом",
    status_code=status.HTTP_200_OK,
)
async def verify_email(
    request: VerifyEmailCodeRequest,
    db: AsyncSession = Depends(get_db),
):
    """Проверить код и подтвердить email."""
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь не найден",
        )

    if user.email_verified:
        return {"message": "Email уже подтверждён"}

    # Проверяем код
    if not user.email_verification_code or user.email_verification_code != request.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный код подтверждения",
        )

    # Проверяем срок действия
    if user.email_verification_code_expires and user.email_verification_code_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Код истёк. Запросите новый.",
        )

    # Подтверждаем email
    user.email_verified = True
    user.email_verification_code = None
    user.email_verification_code_expires = None
    await db.commit()

    return {"message": "Email успешно подтверждён!"}


@router.post(
    "/forgot-password",
    summary="Запрос на восстановление пароля",
    status_code=status.HTTP_200_OK,
)
async def forgot_password(
    request: PasswordResetRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Отправить письмо для восстановления пароля.

    - **email**: Email адрес пользователя
    """
    # Ищем пользователя
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    # Всегда возвращаем 200 (не раскрываем существует ли пользователь)
    if not user or not user.is_active:
        return {
            "message": "Если пользователь с таким email существует, письмо отправлено"
        }

    # Генерируем токен сброса
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)

    # Сохраняем в БД
    user.password_reset_token = reset_token
    user.password_reset_expires_at = expires_at
    await db.commit()

    # Формируем ссылку (frontend URL)
    frontend_url = "https://laxlylaw.ru"
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"

    # Отправляем письмо
    email_sent = await email_service.send_password_reset(request.email, reset_link)

    if not email_sent:
        # Если email не отправлен, логируем но не показываем ошибку пользователю
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(
            f"Не удалось отправить email для сброса пароля: {request.email}. "
            f"Токен: {reset_token} (для тестирования)"
        )

    return {"message": "Если пользователь с таким email существует, письмо отправлено"}


@router.post(
    "/reset-password",
    summary="Сброс пароля",
    status_code=status.HTTP_200_OK,
)
async def reset_password(
    request: PasswordResetConfirm,
    db: AsyncSession = Depends(get_db),
):
    """
    Установить новый пароль по токену.

    - **token**: Токен сброса пароля
    - **new_password**: Новый пароль (минимум 8 символов)
    """
    # Ищем пользователя по токену
    result = await db.execute(
        select(User).where(
            User.password_reset_token == request.token,
            User.password_reset_expires_at > datetime.utcnow(),
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный или просроченный токен",
        )

    # Валидация пароля
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пароль должен содержать минимум 8 символов",
        )

    # Устанавливаем новый пароль
    user.password_hash = hash_password(request.new_password)
    user.password_reset_token = None
    user.password_reset_expires_at = None
    await db.commit()

    return {"message": "Пароль успешно изменен"}

