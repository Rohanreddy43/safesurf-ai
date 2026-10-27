from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.db.session import get_db
from app.models.user import User
from app.models.scan import ScanReport
from app.schemas.auth import UserOut
from app.schemas.scan import ScanSummaryOut
from app.api.v1.deps import get_current_admin

router = APIRouter()

@router.get("/users", response_model=List[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    result = await db.execute(select(User).order_by(User.id))
    return result.scalars().all()

@router.patch("/users/{user_id}/status")
async def toggle_user_status(
    user_id: int,
    is_active: Optional[bool] = None,
    role: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if is_active is not None:
        user.is_active = is_active
    if role in ["user", "admin"]:
        user.role = role

    await db.commit()
    return {"message": "User updated successfully", "is_active": user.is_active, "role": user.role}

@router.get("/malicious-domains", response_model=List[ScanSummaryOut])
async def list_malicious_domains(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    result = await db.execute(
        select(ScanReport).filter(ScanReport.status.in_(["suspicious", "malicious"])).order_by(ScanReport.created_at.desc())
    )
    return result.scalars().all()

@router.get("/system-logs")
async def get_system_logs(
    admin: User = Depends(get_current_admin)
):
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    logs = [
        {"timestamp": now, "level": "INFO", "service": "ScannerEngine", "message": "10 Security modules initialized successfully."},
        {"timestamp": now, "level": "INFO", "service": "ThreatIntel", "message": "Pattern matching heuristic active."},
        {"timestamp": now, "level": "INFO", "service": "FastAPI", "message": "Uvicorn worker running on http://0.0.0.0:8000."},
        {"timestamp": now, "level": "DEBUG", "service": "RedisCache", "message": "In-memory cache fallback ready."}
    ]
    return logs
