from fastapi import APIRouter, HTTPException

from app.models.github import GitHubInput, GitHubProfile
from app.services.github_analyzer import analyze_github

router = APIRouter()


@router.post("/github/analyze", response_model=GitHubProfile)
async def analyze_github_profile(github_input: GitHubInput):
    try:
        return analyze_github(github_input)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
