from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, PasswordReset, Token, UserOut
from app.core.security import verify_password, get_password_hash, create_access_token
from app.api.v1.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(func.lower(User.email) == user_in.email.lower()))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email/username already exists."
        )

    # First user is automatically assigned admin role for easy testing
    count_res = await db.execute(select(User))
    user_count = len(count_res.scalars().all())
    role = "admin" if user_count == 0 else "user"

    user = User(
        email=user_in.email.lower(),
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role=role
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token, user=UserOut.model_validate(user))

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(func.lower(User.email) == credentials.email.lower()))
    user = result.scalars().first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated."
        )

    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token, user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/reset-password")
async def reset_password(data: PasswordReset, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(func.lower(User.email) == data.email.lower()))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    user.hashed_password = get_password_hash(data.new_password)
    await db.commit()
    return {"message": "Password successfully reset."}
