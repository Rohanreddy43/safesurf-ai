from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.user import User
from app.models.api_key import ApiKey
from app.schemas.api_key import ApiKeyCreate, ApiKeyOut, ApiKeyCreatedResponse
from app.core.security import generate_api_key
from app.api.v1.deps import get_current_user

router = APIRouter()

@router.get("", response_model=List[ApiKeyOut])
async def list_api_keys(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(ApiKey).filter(ApiKey.user_id == current_user.id))
    return result.scalars().all()

@router.post("", response_model=ApiKeyCreatedResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    data: ApiKeyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    raw_key, key_hash, prefix = generate_api_key()
    api_key_obj = ApiKey(
        name=data.name,
        prefix=prefix,
        key_hash=key_hash,
        user_id=current_user.id
    )
    db.add(api_key_obj)
    await db.commit()
    await db.refresh(api_key_obj)

    res = ApiKeyCreatedResponse.model_validate(api_key_obj)
    res.raw_key = raw_key
    return res

@router.delete("/{key_id}", status_code=204)
async def delete_api_key(
    key_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(ApiKey).filter(ApiKey.id == key_id, ApiKey.user_id == current_user.id))
    key_obj = result.scalars().first()
    if not key_obj:
        raise HTTPException(status_code=404, detail="API key not found")

    await db.delete(key_obj)
    await db.commit()
    return None
