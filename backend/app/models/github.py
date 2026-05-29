from pydantic import BaseModel


class GitHubInput(BaseModel):
    username: str
    token: str | None = None


class RepoAnalysis(BaseModel):
    name: str
    description: str | None
    url: str
    languages: dict[str, int]
    primary_language: str | None
    stars: int
    forks: int
    is_fork: bool
    has_readme: bool
    topics: list[str]
    size_kb: int
    last_updated: str


class SkillConfidence(BaseModel):
    name: str
    category: str
    confidence: str
    evidence_count: int
    sources: list[str]


class GitHubProfile(BaseModel):
    username: str
    name: str | None
    bio: str | None
    avatar_url: str | None
    public_repos: int
    followers: int
    following: int
    profile_url: str
    repos_analyzed: int
    top_repos: list[RepoAnalysis]
    language_breakdown: dict[str, int]
    skill_confidences: list[SkillConfidence]
    frameworks_detected: list[str]
    total_stars: int
    activity_level: str
