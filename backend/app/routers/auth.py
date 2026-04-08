from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
import uuid

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
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Аутентификация"])


@router.post(
    "/register",
    response_model=UserResponse,
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
    
    return new_user


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
    
    # Создание токенов
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
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
    response_model=TokenResponse,
    summary="Вход через Google",
)
async def google_login(request: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """
    Вход или регистрация через Google OAuth2.
    """
    try:
        from google.oauth2 import id_token as google_id_token
        from google.auth.transport import requests as google_requests

        idinfo = google_id_token.verify_oauth2_token(
            request.credential, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )

        email = idinfo.get("email")
        full_name = idinfo.get("name", "")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Не удалось получить email из Google",
            )

        # Проверка, существует ли пользователь
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if user:
            # Существующий пользователь
            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Учётная запись деактивирована",
                )
        else:
            # Новый пользователь через Google
            user = User(
                id=str(uuid.uuid4()),
                email=email,
                password_hash="",
                full_name=full_name,
                user_type="individual",
                email_verified=1,
                is_active=1,
            )
            db.add(user)
            await db.flush()

            subscription = Subscription(user_id=user.id, plan_type="free", status="active")
            db.add(subscription)
            usage_limit = UsageLimit(user_id=user.id, plan_type="free", max_documents=2, max_contracts=1)
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

    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth не настроен. Установите google-auth.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Ошибка Google авторизации: {str(e)}",
        )

