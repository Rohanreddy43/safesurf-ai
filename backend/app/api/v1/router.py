from fastapi import APIRouter
from app.api.v1 import auth, scan, apikeys, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(scan.router, tags=["URL Scanner & Reports"])
api_router.include_router(apikeys.router, prefix="/apikeys", tags=["API Keys"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Console"])
