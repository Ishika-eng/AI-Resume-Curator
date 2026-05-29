from pydantic import BaseModel


class JobDescriptionInput(BaseModel):
    text: str
    title: str | None = None
    company: str | None = None


class ExtractedSkill(BaseModel):
    name: str
    category: str
    required: bool


class JobAnalysis(BaseModel):
    title: str | None
    company: str | None
    required_skills: list[ExtractedSkill]
    preferred_skills: list[ExtractedSkill]
    ats_keywords: list[str]
    experience_level: str | None
    education_requirements: list[str]
    responsibilities: list[str]
    match_summary: str
