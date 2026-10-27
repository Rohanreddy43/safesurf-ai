from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, Any, List
from datetime import datetime

class ScanRequest(BaseModel):
    url: str

class ScanSummaryOut(BaseModel):
    id: int
    url: str
    domain: str
    risk_score: int
    status: str
    summary: Optional[str] = None
    is_saved: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ScanDetailOut(ScanSummaryOut):
    report_data: Dict[str, Any]

class GlobalStats(BaseModel):
    total_scans: int
    threats_detected: int
    avg_scan_time: float # in seconds
    safe_urls: int
    suspicious_urls: int
    malicious_urls: int
