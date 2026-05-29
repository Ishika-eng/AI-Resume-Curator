from fastapi import APIRouter, HTTPException

from app.models.curation import CurationInput, CurationResult
from app.services.curation_engine import curate_resume

router = APIRouter()


@router.post("/curate", response_model=CurationResult)
async def curate(curation_input: CurationInput):
    try:
        return curate_resume(curation_input)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))
