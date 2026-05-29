import json
import os
from pathlib import Path

from app.models.local_project import DetectedProject, LocalScanInput, LocalScanResult

LANGUAGE_EXTENSIONS = {
    ".py": "Python",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".java": "Java",
    ".cpp": "C++",
    ".cc": "C++",
    ".cxx": "C++",
    ".c": "C",
    ".h": "C",
    ".cs": "C#",
    ".go": "Go",
    ".rs": "Rust",
    ".rb": "Ruby",
    ".php": "PHP",
    ".swift": "Swift",
    ".kt": "Kotlin",
    ".kts": "Kotlin",
    ".dart": "Dart",
    ".lua": "Lua",
    ".r": "R",
    ".R": "R",
    ".scala": "Scala",
    ".ex": "Elixir",
    ".exs": "Elixir",
    ".html": "HTML",
    ".css": "CSS",
    ".scss": "SCSS",
    ".sql": "SQL",
    ".sh": "Shell",
    ".bash": "Shell",
    ".ipynb": "Jupyter/Python",
}

FRAMEWORK_DETECTORS = {
    "package.json": "_detect_node_frameworks",
    "requirements.txt": "_detect_python_frameworks",
    "Pipfile": "_detect_python_frameworks",
    "pyproject.toml": "_detect_python_frameworks",
    "setup.py": "_detect_python_frameworks",
    "pom.xml": "Spring/Maven",
    "build.gradle": "Gradle",
    "Cargo.toml": "Rust/Cargo",
    "go.mod": "Go Modules",
    "Gemfile": "Ruby/Bundler",
    "composer.json": "PHP/Composer",
    "pubspec.yaml": "Flutter/Dart",
    "angular.json": "Angular",
    "next.config.js": "Next.js",
    "next.config.ts": "Next.js",
    "next.config.mjs": "Next.js",
    "nuxt.config.js": "Nuxt.js",
    "nuxt.config.ts": "Nuxt.js",
    "svelte.config.js": "Svelte",
    "vue.config.js": "Vue",
    "tailwind.config.js": "Tailwind CSS",
    "tailwind.config.ts": "Tailwind CSS",
    "metro.config.js": "React Native",
    "manage.py": "Django",
    "app.py": "Flask/FastAPI",
    "CMakeLists.txt": "CMake",
    "Makefile": "Make",
}

SKIP_DIRS = {
    "node_modules", ".git", "__pycache__", ".venv", "venv", "env",
    ".env", "dist", "build", ".next", ".nuxt", "target", "bin", "obj",
    ".idea", ".vscode", ".gradle", ".cache", "vendor", "coverage",
    ".tox", "eggs", ".eggs", "bower_components",
}

TEST_INDICATORS = {
    "test", "tests", "spec", "specs", "__tests__", "test_", "_test",
    "pytest.ini", "jest.config", "karma.conf", "cypress",
    ".mocharc", "vitest.config",
}

CI_FILES = {
    ".github", ".gitlab-ci.yml", ".travis.yml", "Jenkinsfile",
    ".circleci", "azure-pipelines.yml", "bitbucket-pipelines.yml",
    ".drone.yml",
}


def _is_project_root(path: Path) -> bool:
    markers = [
        "package.json", "requirements.txt", "setup.py", "pyproject.toml",
        "Pipfile", "pom.xml", "build.gradle", "Cargo.toml", "go.mod",
        "Gemfile", "composer.json", "pubspec.yaml", "CMakeLists.txt",
        "Makefile", ".git", "angular.json", "manage.py",
    ]
    return any((path / m).exists() for m in markers)


def _count_source_files(path: Path) -> tuple[int, dict[str, int]]:
    count = 0
    lang_counts: dict[str, int] = {}
    try:
        for root, dirs, files in os.walk(path):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            for f in files:
                ext = Path(f).suffix.lower()
                if ext in LANGUAGE_EXTENSIONS:
                    count += 1
                    lang = LANGUAGE_EXTENSIONS[ext]
                    lang_counts[lang] = lang_counts.get(lang, 0) + 1
    except PermissionError:
        pass
    return count, lang_counts


def _detect_node_frameworks(path: Path) -> list[str]:
    frameworks = []
    pkg_path = path / "package.json"
    if not pkg_path.exists():
        return frameworks

    try:
        with open(pkg_path) as f:
            pkg = json.load(f)
    except (json.JSONDecodeError, OSError):
        return frameworks

    all_deps = {}
    all_deps.update(pkg.get("dependencies", {}))
    all_deps.update(pkg.get("devDependencies", {}))

    dep_map = {
        "react": "React",
        "next": "Next.js",
        "vue": "Vue",
        "nuxt": "Nuxt.js",
        "@angular/core": "Angular",
        "svelte": "Svelte",
        "express": "Express",
        "fastify": "Fastify",
        "nest": "NestJS",
        "@nestjs/core": "NestJS",
        "electron": "Electron",
        "react-native": "React Native",
        "tailwindcss": "Tailwind CSS",
        "bootstrap": "Bootstrap",
        "jest": "Jest",
        "mocha": "Mocha",
        "cypress": "Cypress",
        "webpack": "Webpack",
        "vite": "Vite",
        "prisma": "Prisma",
        "mongoose": "Mongoose/MongoDB",
        "sequelize": "Sequelize",
        "socket.io": "Socket.IO",
        "graphql": "GraphQL",
        "three": "Three.js",
        "tensorflow": "TensorFlow.js",
        "d3": "D3.js",
    }

    for dep, name in dep_map.items():
        if dep in all_deps and name not in frameworks:
            frameworks.append(name)

    return frameworks


def _detect_python_frameworks(path: Path) -> list[str]:
    frameworks = []
    content = ""

    for fname in ["requirements.txt", "Pipfile", "pyproject.toml", "setup.py"]:
        fpath = path / fname
        if fpath.exists():
            try:
                with open(fpath) as f:
                    content += f.read().lower() + "\n"
            except OSError:
                pass

    dep_map = {
        "django": "Django",
        "flask": "Flask",
        "fastapi": "FastAPI",
        "tornado": "Tornado",
        "celery": "Celery",
        "pandas": "Pandas",
        "numpy": "NumPy",
        "scikit-learn": "Scikit-learn",
        "tensorflow": "TensorFlow",
        "torch": "PyTorch",
        "keras": "Keras",
        "opencv": "OpenCV",
        "matplotlib": "Matplotlib",
        "streamlit": "Streamlit",
        "sqlalchemy": "SQLAlchemy",
        "pytest": "Pytest",
        "scrapy": "Scrapy",
        "beautifulsoup": "BeautifulSoup",
        "selenium": "Selenium",
        "langchain": "LangChain",
        "transformers": "Transformers/HuggingFace",
        "pydantic": "Pydantic",
    }

    for dep, name in dep_map.items():
        if dep in content and name not in frameworks:
            frameworks.append(name)

    return frameworks


def _detect_frameworks_for_project(path: Path, root_files: list[str]) -> list[str]:
    frameworks = []

    for fname in root_files:
        detector = FRAMEWORK_DETECTORS.get(fname)
        if detector is None:
            continue
        if isinstance(detector, str):
            if detector == "_detect_node_frameworks":
                frameworks.extend(_detect_node_frameworks(path))
            elif detector == "_detect_python_frameworks":
                frameworks.extend(_detect_python_frameworks(path))
            else:
                if detector not in frameworks:
                    frameworks.append(detector)

    if "package.json" in root_files and "React" not in frameworks:
        frameworks.extend(_detect_node_frameworks(path))
    for req in ["requirements.txt", "Pipfile", "pyproject.toml", "setup.py"]:
        if req in root_files:
            frameworks.extend(_detect_python_frameworks(path))
            break

    if (path / "Dockerfile").exists() and "Docker" not in frameworks:
        frameworks.append("Docker")
    if (path / "docker-compose.yml").exists() or (path / "docker-compose.yaml").exists():
        if "Docker Compose" not in frameworks:
            frameworks.append("Docker Compose")

    return list(dict.fromkeys(frameworks))


def _detect_project_type(languages: list[str], frameworks: list[str]) -> str:
    fw_lower = [f.lower() for f in frameworks]
    lang_lower = [l.lower() for l in languages]

    if any(f in fw_lower for f in ["react", "vue", "angular", "svelte", "next.js"]):
        if any(f in fw_lower for f in ["express", "fastapi", "django", "flask", "nestjs"]):
            return "Full-Stack"
        return "Frontend"
    if any(f in fw_lower for f in ["express", "fastapi", "django", "flask", "spring/maven", "nestjs"]):
        return "Backend"
    if any(f in fw_lower for f in ["react native", "flutter/dart"]):
        return "Mobile"
    if any(f in fw_lower for f in ["tensorflow", "pytorch", "keras", "scikit-learn", "pandas"]):
        return "AI/ML"
    if any(f in fw_lower for f in ["scrapy", "beautifulsoup", "selenium"]):
        return "Automation/Scraping"
    if "jupyter/python" in lang_lower:
        return "Data Science"
    if any(l in lang_lower for l in ["c", "c++", "rust"]):
        return "Systems"
    return "General"


def _assess_complexity(file_count: int, lang_count: int, fw_count: int) -> str:
    score = 0
    if file_count > 50:
        score += 3
    elif file_count > 20:
        score += 2
    elif file_count > 5:
        score += 1

    score += min(lang_count, 3)
    score += min(fw_count, 3)

    if score >= 6:
        return "high"
    if score >= 3:
        return "medium"
    return "low"


def _has_tests(path: Path, root_files: list[str]) -> bool:
    for name in root_files:
        if any(t in name.lower() for t in TEST_INDICATORS):
            return True
    for item in path.iterdir():
        if item.is_dir() and item.name.lower() in {"test", "tests", "__tests__", "spec", "specs"}:
            return True
    return False


def _has_ci(root_files: list[str], path: Path) -> bool:
    for ci in CI_FILES:
        if ci in root_files or (path / ci).exists():
            return True
    return False


def _read_description(path: Path) -> str | None:
    readme = path / "README.md"
    if not readme.exists():
        readme = path / "readme.md"
    if not readme.exists():
        return None

    try:
        with open(readme) as f:
            lines = f.readlines()
    except OSError:
        return None

    for line in lines[1:10]:
        stripped = line.strip()
        if stripped and not stripped.startswith("#") and not stripped.startswith("!") and len(stripped) > 15:
            return stripped[:200]
    return None


def scan_directory(scan_input: LocalScanInput) -> LocalScanResult:
    root = Path(scan_input.directory).expanduser().resolve()
    if not root.exists():
        raise ValueError(f"Directory not found: {root}")
    if not root.is_dir():
        raise ValueError(f"Not a directory: {root}")

    projects: list[DetectedProject] = []
    all_languages: set[str] = set()
    all_frameworks: set[str] = set()

    if _is_project_root(root):
        candidates = [root]
    else:
        candidates = []

    try:
        for item in sorted(root.iterdir()):
            if item.is_dir() and item.name not in SKIP_DIRS and not item.name.startswith("."):
                if _is_project_root(item):
                    candidates.append(item)
    except PermissionError:
        pass

    for project_path in candidates[:30]:
        try:
            root_files = [f.name for f in project_path.iterdir() if not f.name.startswith(".") or f.name == ".github"]
        except PermissionError:
            continue

        file_count, lang_counts = _count_source_files(project_path)
        if file_count == 0:
            continue

        languages = sorted(lang_counts.keys(), key=lambda l: lang_counts[l], reverse=True)
        frameworks = _detect_frameworks_for_project(project_path, root_files)
        project_type = _detect_project_type(languages, frameworks)
        complexity = _assess_complexity(file_count, len(languages), len(frameworks))
        has_readme = any(f.lower() == "readme.md" for f in root_files)

        all_languages.update(languages)
        all_frameworks.update(frameworks)

        projects.append(DetectedProject(
            name=project_path.name,
            path=str(project_path),
            languages=languages,
            frameworks=frameworks,
            project_type=project_type,
            files_count=file_count,
            has_readme=has_readme,
            has_tests=_has_tests(project_path, root_files),
            has_docker=(project_path / "Dockerfile").exists(),
            has_ci=_has_ci(root_files, project_path),
            description=_read_description(project_path),
            complexity=complexity,
        ))

    skill_summary: dict[str, list[str]] = {
        "languages": sorted(all_languages),
        "frameworks": sorted(all_frameworks),
    }

    return LocalScanResult(
        directory=str(root),
        projects_found=len(projects),
        projects=projects,
        all_languages=sorted(all_languages),
        all_frameworks=sorted(all_frameworks),
        skill_summary=skill_summary,
    )
