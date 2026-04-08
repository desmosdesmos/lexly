from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.services.auth_service import decode_token


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Получить текущего аутентифицированного пользователя.

    Используется как зависимость в защищённых роутах.
    """
    token = credentials.credentials

    try:
        payload = decode_token(token)

        if payload.get("type") != "access":
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

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Ошибка аутентификации: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Fetch user from database using parameterized query
    from sqlalchemy import text
    
    result = await db.execute(
        text("SELECT id, email, password_hash, full_name, user_type, phone, company_name, company_inn, is_active, email_verified, created_at, updated_at FROM users WHERE id = :user_id"),
        {"user_id": user_id}
    )
    user_row = result.fetchone()

    if user_row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден",
        )

    # Create a simple dict-based user object
    user = type('User', (), {
        'id': user_row[0],
        'email': user_row[1],
        'password_hash': user_row[2],
        'full_name': user_row[3],
        'user_type': user_row[4],
        'phone': user_row[5],
        'company_name': user_row[6],
        'company_inn': user_row[7],
        'is_active': user_row[8],
        'email_verified': user_row[9],
        'created_at': user_row[10],
        'updated_at': user_row[11],
    })()

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Учётная запись деактивирована",
        )

    return user


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """
    Получить текущего пользователя, если он аутентифицирован.
    Не вызывает ошибку, если токен отсутствует.
    """
    if credentials is None:
        return None
    
    try:
        payload = decode_token(credentials.credentials)
        user_id: str = payload.get("sub")
        
        if user_id is None:
            return None
        
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if user and user.is_active:
            return user
    
    except Exception:
        pass
    
    return None

