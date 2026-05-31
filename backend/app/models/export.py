from pydantic import BaseModel

from app.models.curation import CurationResult


class ExportRequest(BaseModel):
    curation_result: CurationResult
    candidate_name: str = "Candidate"
    candidate_email: str | None = None
    candidate_phone: str | None = None
    candidate_location: str | None = None
    candidate_linkedin: str | None = None
    candidate_github: str | None = None
