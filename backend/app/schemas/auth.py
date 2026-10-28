from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None

    @field_validator('email')
    @classmethod
    def clean_email(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if not cleaned:
            raise ValueError("Email or username cannot be empty")
        return cleaned

    @field_validator('password')
    @classmethod
    def check_password(cls, v: str) -> str:
        if len(v) < 4:
            raise ValueError("Password must be at least 4 characters")
        return v

class UserLogin(BaseModel):
    email: str
    password: str

    @field_validator('email')
    @classmethod
    def clean_email(cls, v: str) -> str:
        return v.strip().lower()

class PasswordReset(BaseModel):
    email: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class UserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

Token.model_rebuild()
