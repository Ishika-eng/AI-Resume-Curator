import re

from app.models.job import ExtractedSkill, JobAnalysis, JobDescriptionInput

SKILL_TAXONOMY = {
    "languages": [
        "python", "javascript", "typescript", "java", "c++", "c#", "go", "golang",
        "rust", "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "perl",
        "html", "css", "sql", "bash", "shell", "powershell", "dart", "lua",
        "objective-c", "assembly", "haskell", "elixir", "clojure", "groovy",
    ],
    "frameworks": [
        "react", "angular", "vue", "next.js", "nextjs", "nuxt", "svelte",
        "django", "flask", "fastapi", "spring", "spring boot", "express",
        "node.js", "nodejs", ".net", "asp.net", "rails", "ruby on rails",
        "laravel", "symfony", "gin", "fiber", "actix", "rocket",
        "flutter", "react native", "electron", "tauri", "qt",
        "tailwind", "bootstrap", "material ui", "chakra",
    ],
    "databases": [
        "postgresql", "postgres", "mysql", "mongodb", "redis", "sqlite",
        "dynamodb", "cassandra", "elasticsearch", "neo4j", "firebase",
        "firestore", "supabase", "cockroachdb", "mariadb", "oracle",
        "sql server", "mssql", "couchdb", "influxdb",
    ],
    "cloud_devops": [
        "aws", "azure", "gcp", "google cloud", "heroku", "vercel", "netlify",
        "docker", "kubernetes", "k8s", "terraform", "ansible", "jenkins",
        "github actions", "gitlab ci", "circleci", "travis ci",
        "ci/cd", "nginx", "apache", "linux", "unix",
        "cloudflare", "digitalocean", "lambda", "ec2", "s3",
    ],
    "ai_ml": [
        "machine learning", "deep learning", "tensorflow", "pytorch", "keras",
        "scikit-learn", "sklearn", "pandas", "numpy", "scipy", "matplotlib",
        "nlp", "natural language processing", "computer vision", "opencv",
        "transformers", "hugging face", "langchain", "llm", "gpt",
        "neural network", "reinforcement learning", "data science",
        "jupyter", "spark", "hadoop", "airflow", "mlflow",
    ],
    "tools": [
        "git", "github", "gitlab", "bitbucket", "jira", "confluence",
        "figma", "postman", "swagger", "graphql", "rest api", "restful",
        "grpc", "websocket", "kafka", "rabbitmq", "celery",
        "webpack", "vite", "babel", "eslint", "prettier",
        "pytest", "jest", "mocha", "cypress", "selenium",
        "agile", "scrum", "kanban", "microservices", "monorepo",
    ],
}

EXPERIENCE_PATTERNS = [
    (r"(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience", None),
    (r"entry[\s-]?level|junior|new\s+grad|fresh\s+graduate", "entry"),
    (r"mid[\s-]?level|intermediate", "mid"),
    (r"senior|sr\.?|lead|principal|staff", "senior"),
    (r"intern|internship|co-op|coop", "intern"),
]

EDUCATION_PATTERNS = [
    r"(?:bachelor|bs|b\.s\.|ba|b\.a\.)(?:'?s?)?\s*(?:degree|in)?\s*(?:in\s+)?[\w\s]+",
    r"(?:master|ms|m\.s\.|ma|m\.a\.|mba)(?:'?s?)?\s*(?:degree|in)?\s*(?:in\s+)?[\w\s]+",
    r"(?:ph\.?d|doctorate|doctoral)\s*(?:degree|in)?\s*(?:in\s+)?[\w\s]+",
    r"(?:computer science|software engineering|information technology|data science|mathematics|statistics|engineering)",
    r"(?:associate|diploma)\s+(?:degree\s+)?(?:in\s+)?[\w\s]+",
]

REQUIREMENT_MARKERS = [
    r"(?:required|must\s+have|minimum|essential|mandatory|need|necessary)",
    r"(?:you\s+(?:will|should|must)\s+have)",
    r"(?:qualifications?\s*:)",
    r"(?:requirements?\s*:)",
]

PREFERRED_MARKERS = [
    r"(?:preferred|nice\s+to\s+have|bonus|plus|desired|advantageous|ideally)",
    r"(?:would\s+be\s+(?:a\s+)?(?:plus|great|nice|bonus))",
    r"(?:experience\s+with\s+(?:any|some)\s+of)",
]

RESPONSIBILITY_PATTERNS = [
    r"(?:you\s+will|you['']ll|responsibilities|duties|role\s+involves?)",
    r"(?:what\s+you['']ll\s+do|day[\s-]to[\s-]day|in\s+this\s+role)",
]


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower().strip())


def _extract_skills(text: str) -> tuple[list[ExtractedSkill], list[ExtractedSkill]]:
    normalized = _normalize(text)
    lines = text.split("\n")

    required: list[ExtractedSkill] = []
    preferred: list[ExtractedSkill] = []
    seen: set[str] = set()

    in_required_section = False
    in_preferred_section = False

    for line in lines:
        lower_line = line.lower().strip()

        if any(re.search(p, lower_line) for p in REQUIREMENT_MARKERS):
            in_required_section = True
            in_preferred_section = False
        elif any(re.search(p, lower_line) for p in PREFERRED_MARKERS):
            in_preferred_section = True
            in_required_section = False
        elif re.match(r"^[A-Z][\w\s]{2,30}:?\s*$", line.strip()):
            in_required_section = False
            in_preferred_section = False

        for category, skills in SKILL_TAXONOMY.items():
            for skill in skills:
                if skill in seen:
                    continue
                pattern = r"\b" + re.escape(skill) + r"\b"
                if re.search(pattern, lower_line):
                    seen.add(skill)
                    entry = ExtractedSkill(
                        name=skill.title() if len(skill) > 3 else skill.upper(),
                        category=category,
                        required=not in_preferred_section,
                    )
                    if in_preferred_section:
                        preferred.append(entry)
                    else:
                        required.append(entry)

    return required, preferred


def _extract_experience_level(text: str) -> str | None:
    normalized = _normalize(text)
    for pattern, level in EXPERIENCE_PATTERNS:
        match = re.search(pattern, normalized)
        if match:
            if level:
                return level
            years = int(match.group(1))
            if years <= 1:
                return "intern/entry"
            elif years <= 3:
                return "entry/mid"
            elif years <= 5:
                return "mid"
            elif years <= 8:
                return "mid/senior"
            else:
                return "senior"
    return None


def _extract_education(text: str) -> list[str]:
    results = []
    for pattern in EDUCATION_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for m in matches:
            cleaned = m.strip()
            if len(cleaned) > 5 and cleaned not in results:
                results.append(cleaned)
    return results[:5]


def _extract_responsibilities(text: str) -> list[str]:
    lines = text.split("\n")
    responsibilities = []
    in_section = False

    for line in lines:
        stripped = line.strip()
        lower = stripped.lower()

        if any(re.search(p, lower) for p in RESPONSIBILITY_PATTERNS):
            in_section = True
            continue

        if in_section:
            if not stripped:
                in_section = False
                continue
            cleaned = re.sub(r"^[\-\•\*\>\d\.]+\s*", "", stripped)
            if len(cleaned) > 15:
                responsibilities.append(cleaned)

        if stripped.startswith(("-", "*", "•")) and len(stripped) > 20:
            cleaned = re.sub(r"^[\-\•\*]+\s*", "", stripped)
            if any(
                word in lower
                for word in ["develop", "build", "design", "implement", "maintain",
                             "create", "write", "test", "deploy", "collaborate",
                             "lead", "manage", "optimize", "analyze", "review"]
            ):
                if cleaned not in responsibilities:
                    responsibilities.append(cleaned)

    return responsibilities[:15]


def _extract_ats_keywords(
    required: list[ExtractedSkill],
    preferred: list[ExtractedSkill],
    text: str,
) -> list[str]:
    keywords = []
    for skill in required + preferred:
        if skill.name not in keywords:
            keywords.append(skill.name)

    buzzwords = [
        "agile", "scrum", "ci/cd", "tdd", "oop", "solid", "design patterns",
        "data structures", "algorithms", "system design", "distributed systems",
        "api", "sdk", "saas", "b2b", "b2c", "startup", "enterprise",
        "full-stack", "frontend", "backend", "devops", "sre", "qa",
        "cross-functional", "stakeholder", "product", "performance",
        "scalability", "reliability", "security", "accessibility",
    ]
    normalized = _normalize(text)
    for word in buzzwords:
        if word in normalized and word.title() not in keywords and word.upper() not in keywords:
            keywords.append(word.upper() if len(word) <= 4 else word.title())

    return keywords[:40]


def _generate_summary(
    required: list[ExtractedSkill],
    preferred: list[ExtractedSkill],
    exp_level: str | None,
) -> str:
    parts = []

    if exp_level:
        parts.append(f"This is a {exp_level}-level position")

    req_count = len(required)
    pref_count = len(preferred)

    if req_count:
        categories = set(s.category for s in required)
        cat_names = [c.replace("_", "/") for c in categories]
        parts.append(
            f"requiring {req_count} core skills across {', '.join(cat_names)}"
        )

    if pref_count:
        parts.append(f"with {pref_count} additional preferred skills")

    if not parts:
        return "Could not extract enough information for a detailed summary."

    return ". ".join(parts) + "."


def analyze_job(job_input: JobDescriptionInput) -> JobAnalysis:
    text = job_input.text
    required, preferred = _extract_skills(text)
    exp_level = _extract_experience_level(text)
    education = _extract_education(text)
    responsibilities = _extract_responsibilities(text)
    ats_keywords = _extract_ats_keywords(required, preferred, text)
    summary = _generate_summary(required, preferred, exp_level)

    return JobAnalysis(
        title=job_input.title,
        company=job_input.company,
        required_skills=required,
        preferred_skills=preferred,
        ats_keywords=ats_keywords,
        experience_level=exp_level,
        education_requirements=education,
        responsibilities=responsibilities,
        match_summary=summary,
    )
