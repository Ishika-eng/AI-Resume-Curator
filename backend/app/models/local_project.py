from pydantic import BaseModel


class LocalScanInput(BaseModel):
    directory: str


class DetectedProject(BaseModel):
    name: str
    path: str
    languages: list[str]
    frameworks: list[str]
    project_type: str
    files_count: int
    has_readme: bool
    has_tests: bool
    has_docker: bool
    has_ci: bool
    description: str | None
    complexity: str


class LocalScanResult(BaseModel):
    directory: str
    projects_found: int
    projects: list[DetectedProject]
    all_languages: list[str]
    all_frameworks: list[str]
    skill_summary: dict[str, list[str]]
