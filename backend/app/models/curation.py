from pydantic import BaseModel

from app.models.github import GitHubProfile
from app.models.job import JobAnalysis
from app.models.local_project import LocalScanResult
from app.models.resume import ParsedResume


class CurationInput(BaseModel):
    resume: ParsedResume
    job_analysis: JobAnalysis
    github_profile: GitHubProfile | None = None
    local_scan: LocalScanResult | None = None


class RewrittenBullet(BaseModel):
    original: str
    rewritten: str
    reason: str


class MissingSkill(BaseModel):
    name: str
    source: str
    confidence: str
    suggestion: str


class MissingProject(BaseModel):
    name: str
    source: str
    languages: list[str]
    frameworks: list[str]
    relevance: str


class ScoringBreakdown(BaseModel):
    ats_compatibility: int
    skill_match: int
    project_relevance: int
    resume_structure: int
    keyword_optimization: int
    github_strength: int
    technical_evidence: int
    total: int


class CuratedSection(BaseModel):
    title: str
    content: list[str]
    changes: list[str]


class CurationResult(BaseModel):
    curated_sections: list[CuratedSection]
    rewritten_bullets: list[RewrittenBullet]
    missing_skills: list[MissingSkill]
    missing_projects: list[MissingProject]
    added_keywords: list[str]
    scoring: ScoringBreakdown
    recommendations: list[str]
