import re

from app.models.curation import (
    CuratedSection,
    CurationInput,
    CurationResult,
    MissingProject,
    MissingSkill,
    RewrittenBullet,
    ScoringBreakdown,
)

WEAK_PATTERNS = [
    (r"^(built|made|created|did|worked on|helped with)\s+(.+)$", True),
    (r"^(used|using)\s+(.+)$", True),
    (r"^(responsible for)\s+(.+)$", True),
]

ACTION_VERBS = [
    "Developed", "Engineered", "Architected", "Implemented", "Designed",
    "Built", "Optimized", "Automated", "Deployed", "Integrated",
    "Streamlined", "Configured", "Established", "Delivered", "Constructed",
]

QUANTIFIER_TEMPLATES = [
    "reducing {metric} by {value}",
    "improving {metric} by {value}",
    "serving {value} users",
    "handling {value} requests",
    "achieving {value} uptime",
]


def _normalize(text: str) -> str:
    return text.lower().strip()


def _get_resume_skills(resume_sections: list) -> set[str]:
    skills = set()
    for section in resume_sections:
        if section.title.lower() in ("skills", "technical skills", "core competencies", "technologies"):
            for line in section.content:
                for part in re.split(r"[,|•·\-/]", line):
                    cleaned = part.strip()
                    if cleaned and len(cleaned) < 40:
                        skills.add(_normalize(cleaned))
    return skills


def _get_resume_text(resume_sections: list) -> str:
    return " ".join(
        " ".join(s.content) for s in resume_sections
    ).lower()


def _rewrite_bullet(bullet: str, job_keywords: list[str]) -> RewrittenBullet | None:
    lower = bullet.lower().strip()

    for pattern, should_rewrite in WEAK_PATTERNS:
        match = re.match(pattern, lower, re.IGNORECASE)
        if match and should_rewrite:
            rest = match.group(2).strip().rstrip(".")
            verb = ACTION_VERBS[hash(rest) % len(ACTION_VERBS)]

            relevant_kw = []
            rest_lower = rest.lower()
            for kw in job_keywords:
                if kw.lower() in rest_lower and kw.lower() not in relevant_kw:
                    relevant_kw.append(kw)

            tech_mention = ""
            new_kw = [kw for kw in relevant_kw if kw.lower() not in rest_lower]
            if new_kw:
                tech_mention = f" leveraging {', '.join(new_kw[:3])}"

            rewritten = f"{verb} {rest}{tech_mention} to improve performance and deliver measurable results."

            return RewrittenBullet(
                original=bullet,
                rewritten=rewritten,
                reason=f"Replaced weak opener '{match.group(1)}' with strong action verb '{verb}'",
            )

    if len(bullet.split()) < 5 and not any(c.isdigit() for c in bullet):
        rest = bullet.strip().rstrip(".")
        verb = ACTION_VERBS[hash(rest) % len(ACTION_VERBS)]
        rewritten = f"{verb} {rest[0].lower()}{rest[1:]} to deliver measurable impact on project outcomes."

        return RewrittenBullet(
            original=bullet,
            rewritten=rewritten,
            reason="Expanded short bullet with action verb and impact statement",
        )

    return None


def _find_missing_skills(
    resume_skills: set[str],
    resume_text: str,
    job_required: list,
    job_preferred: list,
    github_profile=None,
    local_scan=None,
) -> list[MissingSkill]:
    missing = []
    seen = set()

    for skill in job_required:
        skill_lower = _normalize(skill.name)
        if skill_lower not in resume_skills and skill_lower not in resume_text:
            source = "Job Description (Required)"
            confidence = "high"

            if github_profile:
                for gs in github_profile.skill_confidences:
                    if _normalize(gs.name) == skill_lower:
                        source = f"Job + GitHub ({gs.confidence} confidence, {gs.evidence_count} repos)"
                        confidence = gs.confidence
                        break

            if local_scan:
                for lang in local_scan.all_languages + local_scan.all_frameworks:
                    if _normalize(lang) == skill_lower:
                        source = f"Job + Local Projects"
                        break

            if skill_lower not in seen:
                seen.add(skill_lower)
                missing.append(MissingSkill(
                    name=skill.name,
                    source=source,
                    confidence=confidence,
                    suggestion=f"Add '{skill.name}' to your Skills section — it's a required skill for this role.",
                ))

    for skill in job_preferred:
        skill_lower = _normalize(skill.name)
        if skill_lower not in resume_skills and skill_lower not in resume_text and skill_lower not in seen:
            seen.add(skill_lower)
            missing.append(MissingSkill(
                name=skill.name,
                source="Job Description (Preferred)",
                confidence="medium",
                suggestion=f"Consider adding '{skill.name}' — it's a preferred skill that would strengthen your application.",
            ))

    if github_profile:
        for gs in github_profile.skill_confidences:
            gs_lower = _normalize(gs.name)
            if gs.confidence == "high" and gs_lower not in resume_skills and gs_lower not in resume_text and gs_lower not in seen:
                seen.add(gs_lower)
                missing.append(MissingSkill(
                    name=gs.name,
                    source=f"GitHub ({gs.evidence_count} repos, {gs.confidence} confidence)",
                    confidence=gs.confidence,
                    suggestion=f"Your GitHub shows strong {gs.name} experience across {gs.evidence_count} repos — add it to your resume.",
                ))

    return missing


def _find_missing_projects(
    resume_text: str,
    job_analysis=None,
    github_profile=None,
    local_scan=None,
) -> list[MissingProject]:
    missing = []

    if github_profile:
        for repo in github_profile.top_repos[:5]:
            repo_lower = _normalize(repo.name)
            if repo_lower not in resume_text and repo.stars > 0:
                langs = list(repo.languages.keys())[:3] if repo.languages else []
                relevance = "medium"
                if job_analysis:
                    job_skills = {_normalize(s.name) for s in job_analysis.required_skills}
                    overlap = sum(1 for l in langs if _normalize(l) in job_skills)
                    if overlap >= 2:
                        relevance = "high"
                    elif overlap == 0:
                        relevance = "low"

                missing.append(MissingProject(
                    name=repo.name,
                    source="GitHub",
                    languages=langs,
                    frameworks=[],
                    relevance=relevance,
                ))

    if local_scan:
        for project in local_scan.projects[:5]:
            proj_lower = _normalize(project.name)
            if proj_lower not in resume_text:
                relevance = "medium"
                if job_analysis:
                    job_skills = {_normalize(s.name) for s in job_analysis.required_skills}
                    all_tech = [_normalize(l) for l in project.languages + project.frameworks]
                    overlap = sum(1 for t in all_tech if t in job_skills)
                    if overlap >= 2:
                        relevance = "high"
                    elif overlap == 0:
                        relevance = "low"

                missing.append(MissingProject(
                    name=project.name,
                    source=f"Local ({project.project_type})",
                    languages=project.languages,
                    frameworks=project.frameworks,
                    relevance=relevance,
                ))

    missing.sort(key=lambda p: {"high": 3, "medium": 2, "low": 1}[p.relevance], reverse=True)
    return missing[:10]


def _curate_sections(
    resume_sections: list,
    job_analysis,
    missing_skills: list[MissingSkill],
    rewritten_bullets: list[RewrittenBullet],
) -> list[CuratedSection]:
    curated = []
    rewrite_map = {rb.original: rb.rewritten for rb in rewritten_bullets}

    for section in resume_sections:
        new_content = []
        changes = []

        if section.title.lower() in ("skills", "technical skills", "core competencies", "technologies"):
            new_content = list(section.content)

            skills_to_add = [
                ms.name for ms in missing_skills
                if "required" in ms.source.lower() or ms.confidence == "high"
            ]
            if skills_to_add:
                added_line = " | ".join(skills_to_add[:8])
                new_content.append(added_line)
                changes.append(f"Added {len(skills_to_add[:8])} missing skills: {', '.join(skills_to_add[:8])}")

        elif section.title.lower() in ("experience", "work experience", "professional experience"):
            for line in section.content:
                if line in rewrite_map:
                    new_content.append(rewrite_map[line])
                    changes.append(f"Rewrote: '{line[:50]}...' → stronger action verb")
                else:
                    new_content.append(line)

        elif section.title.lower() in ("summary", "professional summary", "objective", "profile", "about me"):
            job_title = job_analysis.title or "the target role"
            key_skills = [s.name for s in job_analysis.required_skills[:4]]

            if section.content:
                original = section.content[0]
                if key_skills:
                    skills_str = ", ".join(key_skills)
                    enhanced = f"{original.rstrip('.')} with expertise in {skills_str}, seeking to contribute to {job_title}."
                    new_content = [enhanced] + section.content[1:]
                    changes.append(f"Enhanced summary with role-specific keywords: {skills_str}")
                else:
                    new_content = list(section.content)
            else:
                new_content = list(section.content)
        else:
            new_content = list(section.content)

        curated.append(CuratedSection(
            title=section.title,
            content=new_content,
            changes=changes,
        ))

    return curated


def _calculate_score(
    resume_text: str,
    resume_sections: list,
    job_analysis,
    missing_skills: list[MissingSkill],
    github_profile=None,
) -> ScoringBreakdown:
    ats_keywords = job_analysis.ats_keywords
    matched = sum(1 for kw in ats_keywords if _normalize(kw) in resume_text)
    ats_score = min(25, int((matched / max(len(ats_keywords), 1)) * 25))

    required = job_analysis.required_skills
    req_matched = sum(1 for s in required if _normalize(s.name) in resume_text)
    skill_score = min(20, int((req_matched / max(len(required), 1)) * 20))

    project_sections = [s for s in resume_sections if s.title.lower() in ("projects", "personal projects", "academic projects")]
    project_count = sum(len(s.content) for s in project_sections)
    project_score = min(20, project_count * 4)

    section_titles = {s.title.lower() for s in resume_sections}
    expected = {"summary", "skills", "experience", "education", "projects"}
    structure_found = sum(1 for e in expected if any(e in t for t in section_titles))
    structure_score = min(10, structure_found * 2)

    missing_required = sum(1 for ms in missing_skills if "required" in ms.source.lower())
    keyword_penalty = min(missing_required * 2, 10)
    keyword_score = max(0, 10 - keyword_penalty)

    github_score = 0
    if github_profile:
        if github_profile.activity_level in ("very active", "active"):
            github_score += 4
        if github_profile.total_stars > 10:
            github_score += 3
        if len(github_profile.skill_confidences) > 3:
            github_score += 3
    github_score = min(10, github_score)

    evidence_score = min(5, (req_matched + project_count) // 2)

    total = ats_score + skill_score + project_score + structure_score + keyword_score + github_score + evidence_score

    return ScoringBreakdown(
        ats_compatibility=ats_score,
        skill_match=skill_score,
        project_relevance=project_score,
        resume_structure=structure_score,
        keyword_optimization=keyword_score,
        github_strength=github_score,
        technical_evidence=evidence_score,
        total=total,
    )


def _generate_recommendations(
    scoring: ScoringBreakdown,
    missing_skills: list[MissingSkill],
    missing_projects: list[MissingProject],
    rewritten_bullets: list[RewrittenBullet],
) -> list[str]:
    recs = []

    if scoring.ats_compatibility < 15:
        recs.append("Your resume is missing many ATS keywords. Add more job-specific technical terms to pass automated screening.")

    if scoring.skill_match < 12:
        top_missing = [ms.name for ms in missing_skills[:3] if "required" in ms.source.lower()]
        if top_missing:
            recs.append(f"Add these critical missing skills: {', '.join(top_missing)}.")

    if scoring.project_relevance < 10:
        recs.append("Add more projects to your resume. Include at least 2-3 relevant projects with technologies matching the job requirements.")

    if scoring.resume_structure < 6:
        recs.append("Your resume is missing key sections. Ensure you have: Summary, Skills, Experience, Education, and Projects.")

    high_relevance = [mp for mp in missing_projects if mp.relevance == "high"]
    if high_relevance:
        names = [p.name for p in high_relevance[:3]]
        recs.append(f"Consider adding these highly relevant projects: {', '.join(names)}.")

    if rewritten_bullets:
        recs.append(f"{len(rewritten_bullets)} bullet points were rewritten with stronger action verbs. Review and apply these improvements.")

    if scoring.github_strength < 5:
        recs.append("Strengthen your GitHub presence: pin top repositories, add README documentation, and maintain regular commit activity.")

    if scoring.total >= 80:
        recs.append("Your resume is well-optimized for this role. Focus on tailoring project descriptions to highlight the most relevant work.")
    elif scoring.total >= 60:
        recs.append("Your resume has a solid foundation. Address the missing skills and project gaps to push your score above 80.")
    else:
        recs.append("Your resume needs significant improvement for this role. Focus on adding missing skills, relevant projects, and stronger bullet points.")

    return recs


def curate_resume(curation_input: CurationInput) -> CurationResult:
    resume = curation_input.resume
    job = curation_input.job_analysis
    github = curation_input.github_profile
    local = curation_input.local_scan

    resume_skills = _get_resume_skills(resume.sections)
    resume_text = _get_resume_text(resume.sections)

    rewritten_bullets = []
    for section in resume.sections:
        if section.title.lower() in ("experience", "work experience", "professional experience", "projects"):
            for line in section.content:
                result = _rewrite_bullet(line, job.ats_keywords)
                if result:
                    rewritten_bullets.append(result)

    missing_skills = _find_missing_skills(
        resume_skills, resume_text,
        job.required_skills, job.preferred_skills,
        github, local,
    )

    missing_projects = _find_missing_projects(resume_text, job, github, local)

    curated_sections = _curate_sections(
        resume.sections, job, missing_skills, rewritten_bullets,
    )

    added_keywords = []
    for ms in missing_skills:
        if ms.name not in added_keywords:
            added_keywords.append(ms.name)

    scoring = _calculate_score(resume_text, resume.sections, job, missing_skills, github)

    recommendations = _generate_recommendations(scoring, missing_skills, missing_projects, rewritten_bullets)

    return CurationResult(
        curated_sections=curated_sections,
        rewritten_bullets=rewritten_bullets,
        missing_skills=missing_skills,
        missing_projects=missing_projects,
        added_keywords=added_keywords,
        scoring=scoring,
        recommendations=recommendations,
    )
