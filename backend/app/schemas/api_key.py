from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ApiKeyCreate(BaseModel):
    name: str

class ApiKeyOut(BaseModel):
    id: int
    name: str
    prefix: str
    created_at: datetime
    last_used_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ApiKeyCreatedResponse(ApiKeyOut):
    raw_key: str
