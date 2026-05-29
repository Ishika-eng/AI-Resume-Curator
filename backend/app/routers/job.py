from fastapi import APIRouter

from app.models.job import JobAnalysis, JobDescriptionInput
from app.services.job_analyzer import analyze_job

router = APIRouter()


@router.post("/job/analyze", response_model=JobAnalysis)
async def analyze_job_description(job_input: JobDescriptionInput):
    return analyze_job(job_input)
