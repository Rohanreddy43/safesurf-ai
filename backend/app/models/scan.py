from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class ScanReport(Base):
    __tablename__ = "scan_reports"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True, nullable=False)
    domain = Column(String, index=True, nullable=False)
    risk_score = Column(Integer, nullable=False, default=100) # 0-100
    status = Column(String, index=True, nullable=False, default="safe") # "safe", "suspicious", "malicious"
    summary = Column(Text, nullable=True)
    report_data = Column(JSON, nullable=False) # Full 10-module JSON output
    is_saved = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    owner = relationship("User", back_populates="scans")
