import urllib.request
import urllib.error
import json
from datetime import datetime, timezone

from app.models.github import (
    GitHubInput,
    GitHubProfile,
    RepoAnalysis,
    SkillConfidence,
)

API_BASE = "https://api.github.com"

FRAMEWORK_INDICATORS = {
    "react": ["package.json"],
    "next.js": ["next.config.js", "next.config.ts", "next.config.mjs"],
    "vue": ["vue.config.js", "nuxt.config.js"],
    "angular": ["angular.json"],
    "svelte": ["svelte.config.js"],
    "django": ["manage.py", "settings.py"],
    "flask": ["app.py", "wsgi.py"],
    "fastapi": ["main.py"],
    "express": ["server.js", "app.js"],
    "spring boot": ["pom.xml", "build.gradle"],
    "flutter": ["pubspec.yaml"],
    "react native": ["metro.config.js"],
    "docker": ["Dockerfile", "docker-compose.yml", "docker-compose.yaml"],
    "kubernetes": ["k8s", "kubernetes"],
    "terraform": ["main.tf", "terraform.tfstate"],
    "tailwind": ["tailwind.config.js", "tailwind.config.ts"],
}

LANGUAGE_TO_SKILLS = {
    "Python": ["Python"],
    "JavaScript": ["Javascript"],
    "TypeScript": ["Typescript"],
    "Java": ["Java"],
    "C++": ["C++"],
    "C#": ["C#"],
    "Go": ["Go"],
    "Rust": ["Rust"],
    "Ruby": ["Ruby"],
    "PHP": ["PHP"],
    "Swift": ["Swift"],
    "Kotlin": ["Kotlin"],
    "Dart": ["Dart"],
    "HTML": ["HTML"],
    "CSS": ["CSS"],
    "Shell": ["Bash", "Shell"],
    "Jupyter Notebook": ["Python", "Data Science"],
    "HCL": ["Terraform"],
}


def _api_get(url: str, token: str | None = None) -> dict | list:
    headers = {"Accept": "application/vnd.github.v3+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        if e.code == 404:
            raise ValueError(f"GitHub user not found: {url}")
        if e.code == 403:
            raise ValueError("GitHub API rate limit exceeded. Provide a personal access token to increase limits.")
        raise ValueError(f"GitHub API error: {e.code}")


def _fetch_user(username: str, token: str | None) -> dict:
    return _api_get(f"{API_BASE}/users/{username}", token)


def _fetch_repos(username: str, token: str | None) -> list[dict]:
    repos = []
    page = 1
    while True:
        batch = _api_get(
            f"{API_BASE}/users/{username}/repos?per_page=100&sort=updated&page={page}",
            token,
        )
        if not batch:
            break
        repos.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    return repos


def _fetch_repo_languages(owner: str, repo: str, token: str | None) -> dict:
    try:
        return _api_get(f"{API_BASE}/repos/{owner}/{repo}/languages", token)
    except ValueError:
        return {}


def _fetch_repo_contents(owner: str, repo: str, token: str | None) -> list[str]:
    try:
        contents = _api_get(f"{API_BASE}/repos/{owner}/{repo}/contents", token)
        if isinstance(contents, list):
            return [item.get("name", "") for item in contents]
    except ValueError:
        pass
    return []


def _detect_frameworks(file_names: list[str], topics: list[str]) -> list[str]:
    detected = []
    lower_files = [f.lower() for f in file_names]
    lower_topics = [t.lower() for t in topics]

    for framework, indicators in FRAMEWORK_INDICATORS.items():
        for indicator in indicators:
            if indicator.lower() in lower_files or indicator.lower() in lower_topics:
                if framework not in detected:
                    detected.append(framework)
                break
        if framework in lower_topics and framework not in detected:
            detected.append(framework)

    return detected


def _calculate_confidence(byte_count: int, repo_count: int) -> str:
    if repo_count >= 3 and byte_count > 50000:
        return "high"
    if repo_count >= 2 or byte_count > 20000:
        return "medium"
    return "low"


def _assess_activity(repos: list[dict]) -> str:
    if not repos:
        return "inactive"

    now = datetime.now(timezone.utc)
    recent = 0
    for repo in repos:
        updated = repo.get("updated_at", "")
        if updated:
            try:
                dt = datetime.fromisoformat(updated.replace("Z", "+00:00"))
                days = (now - dt).days
                if days < 90:
                    recent += 1
            except (ValueError, TypeError):
                pass

    if recent >= 5:
        return "very active"
    if recent >= 2:
        return "active"
    if recent >= 1:
        return "moderate"
    return "inactive"


def analyze_github(github_input: GitHubInput) -> GitHubProfile:
    username = github_input.username.strip().strip("/").split("/")[-1]
    token = github_input.token

    user = _fetch_user(username, token)
    all_repos = _fetch_repos(username, token)

    owned_repos = [r for r in all_repos if not r.get("fork", False)]
    owned_repos.sort(key=lambda r: r.get("stargazers_count", 0), reverse=True)

    top_repos_raw = owned_repos[:15]

    language_totals: dict[str, int] = {}
    all_frameworks: list[str] = []
    skill_evidence: dict[str, dict] = {}
    repo_analyses: list[RepoAnalysis] = []

    for repo in top_repos_raw:
        repo_name = repo["name"]
        languages = _fetch_repo_languages(username, repo_name, token)
        root_files = _fetch_repo_contents(username, repo_name, token)
        topics = repo.get("topics", [])

        for lang, bytes_count in languages.items():
            language_totals[lang] = language_totals.get(lang, 0) + bytes_count

            mapped = LANGUAGE_TO_SKILLS.get(lang, [lang])
            for skill_name in mapped:
                if skill_name not in skill_evidence:
                    skill_evidence[skill_name] = {
                        "bytes": 0,
                        "repos": set(),
                        "category": "languages",
                    }
                skill_evidence[skill_name]["bytes"] += bytes_count
                skill_evidence[skill_name]["repos"].add(repo_name)

        frameworks = _detect_frameworks(root_files, topics)
        for fw in frameworks:
            if fw not in all_frameworks:
                all_frameworks.append(fw)
            if fw.title() not in skill_evidence:
                skill_evidence[fw.title()] = {
                    "bytes": 0,
                    "repos": set(),
                    "category": "frameworks",
                }
            skill_evidence[fw.title()]["repos"].add(repo_name)

        has_readme = any(f.lower() == "readme.md" for f in root_files)
        primary = repo.get("language")

        repo_analyses.append(
            RepoAnalysis(
                name=repo_name,
                description=repo.get("description"),
                url=repo.get("html_url", ""),
                languages=languages,
                primary_language=primary,
                stars=repo.get("stargazers_count", 0),
                forks=repo.get("forks_count", 0),
                is_fork=repo.get("fork", False),
                has_readme=has_readme,
                topics=topics,
                size_kb=repo.get("size", 0),
                last_updated=repo.get("updated_at", ""),
            )
        )

    skill_confidences = []
    for skill_name, data in skill_evidence.items():
        repo_count = len(data["repos"])
        confidence = _calculate_confidence(data["bytes"], repo_count)
        skill_confidences.append(
            SkillConfidence(
                name=skill_name,
                category=data["category"],
                confidence=confidence,
                evidence_count=repo_count,
                sources=sorted(data["repos"]),
            )
        )

    skill_confidences.sort(
        key=lambda s: (
            {"high": 3, "medium": 2, "low": 1}[s.confidence],
            s.evidence_count,
        ),
        reverse=True,
    )

    language_totals = dict(
        sorted(language_totals.items(), key=lambda x: x[1], reverse=True)
    )

    total_stars = sum(r.get("stargazers_count", 0) for r in owned_repos)

    return GitHubProfile(
        username=username,
        name=user.get("name"),
        bio=user.get("bio"),
        avatar_url=user.get("avatar_url"),
        public_repos=user.get("public_repos", 0),
        followers=user.get("followers", 0),
        following=user.get("following", 0),
        profile_url=user.get("html_url", ""),
        repos_analyzed=len(repo_analyses),
        top_repos=repo_analyses,
        language_breakdown=language_totals,
        skill_confidences=skill_confidences,
        frameworks_detected=all_frameworks,
        total_stars=total_stars,
        activity_level=_assess_activity(all_repos),
    )
