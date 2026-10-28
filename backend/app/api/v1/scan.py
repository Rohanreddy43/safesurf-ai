import io
import csv
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc, or_

from app.db.session import get_db
from app.models.user import User
from app.models.scan import ScanReport
from app.schemas.scan import ScanRequest, ScanDetailOut, ScanSummaryOut, GlobalStats
from app.services.scanner.orchestrator import run_full_scan
from app.services.scanner.community_threat import add_community_report
from app.services.pdf_exporter import generate_pdf_report
from app.api.v1.deps import get_current_user_optional, get_current_user

router = APIRouter()

@router.post("/scan", response_model=ScanDetailOut, status_code=status.HTTP_201_CREATED)
async def create_scan(
    request: ScanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")

    scan_result = await run_full_scan(url)

    report = ScanReport(
        url=scan_result["target_url"],
        domain=scan_result["domain"],
        risk_score=scan_result["risk_score"],
        status=scan_result["status"],
        summary=scan_result["summary"],
        report_data=scan_result,
        user_id=current_user.id if current_user else None
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)

    return report

@router.post("/community/report")
async def report_community_url(
    domain: str = Query(..., description="Target domain to flag as malicious")
):
    """
    Crowdsourced Community Threat Reporting Endpoint
    Allows users to report suspicious phishing domains directly into SafeSurf AI's community database.
    """
    if not domain:
        raise HTTPException(status_code=400, detail="Domain parameter is required")
    
    clean_domain = domain.replace("https://", "").replace("http://", "").split("/")[0]
    new_count = add_community_report(clean_domain)
    
    return {
        "status": "success",
        "message": f"Domain '{clean_domain}' reported to SafeSurf AI Community Threat Feed",
        "total_community_reports": new_count
    }

@router.get("/report/{scan_id}", response_model=ScanDetailOut)
async def get_scan_report(
    scan_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(ScanReport).filter(ScanReport.id == scan_id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Scan report not found")
    return report

@router.get("/history", response_model=List[ScanSummaryOut])
async def get_history(
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    saved_only: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query = select(ScanReport).order_by(desc(ScanReport.created_at))

    if current_user:
        query = query.filter(or_(ScanReport.user_id == current_user.id, ScanReport.user_id == None))

    if search:
        query = query.filter(or_(ScanReport.url.icontains(search), ScanReport.domain.icontains(search)))

    if status_filter:
        query = query.filter(func.lower(ScanReport.status) == status_filter.lower())

    if saved_only:
        query = query.filter(ScanReport.is_saved == True)

    result = await db.execute(query.limit(100))
    return result.scalars().all()

@router.post("/saved/{scan_id}")
async def toggle_save_report(
    scan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(ScanReport).filter(ScanReport.id == scan_id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report.is_saved = not report.is_saved
    await db.commit()
    return {"message": "Bookmark updated", "is_saved": report.is_saved}

@router.delete("/scan/{scan_id}", status_code=204)
async def delete_scan(
    scan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(ScanReport).filter(ScanReport.id == scan_id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    await db.delete(report)
    await db.commit()
    return Response(status_code=204)

@router.get("/stats", response_model=GlobalStats)
async def get_stats(db: AsyncSession = Depends(get_db)):
    res_total = await db.execute(select(func.count(ScanReport.id)))
    total_scans = res_total.scalar() or 0

    res_safe = await db.execute(select(func.count(ScanReport.id)).filter(func.lower(ScanReport.status) == "safe"))
    safe_cnt = res_safe.scalar() or 0

    res_susp = await db.execute(select(func.count(ScanReport.id)).filter(func.lower(ScanReport.status) == "suspicious"))
    susp_cnt = res_susp.scalar() or 0

    res_mal = await db.execute(select(func.count(ScanReport.id)).filter(func.lower(ScanReport.status) == "malicious"))
    mal_cnt = res_mal.scalar() or 0

    return GlobalStats(
        total_scans=total_scans,
        threats_detected=susp_cnt + mal_cnt,
        avg_scan_time=1.42,
        safe_urls=safe_cnt,
        suspicious_urls=susp_cnt,
        malicious_urls=mal_cnt
    )

@router.get("/export/csv")
async def export_csv(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query = select(ScanReport).order_by(desc(ScanReport.created_at))
    if current_user:
        query = query.filter(or_(ScanReport.user_id == current_user.id, ScanReport.user_id == None))

    result = await db.execute(query.limit(500))
    scans = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "URL", "Domain", "Risk Score", "Status", "Is Saved", "Created At"])

    for s in scans:
        writer.writerow([s.id, s.url, s.domain, s.risk_score, s.status, s.is_saved, s.created_at])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=safesurf_scan_history.csv"}
    )

@router.get("/export/pdf/{scan_id}")
async def export_pdf(
    scan_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(ScanReport).filter(ScanReport.id == scan_id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Scan report not found")

    scan_dict = {
        "url": report.url,
        "domain": report.domain,
        "risk_score": report.risk_score,
        "status": report.status,
        "summary": report.summary,
        "created_at": report.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "report_data": report.report_data
    }

    pdf_bytes = generate_pdf_report(scan_dict)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=SafeSurf_Report_{scan_id}.pdf"}
    )
