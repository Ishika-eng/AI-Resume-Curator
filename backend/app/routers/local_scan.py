from fastapi import APIRouter, HTTPException

from app.models.local_project import LocalScanInput, LocalScanResult
from app.services.local_scanner import scan_directory

router = APIRouter()


@router.post("/local/scan", response_model=LocalScanResult)
async def scan_local_projects(scan_input: LocalScanInput):
    try:
        return scan_directory(scan_input)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
