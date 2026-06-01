"""AI Agent for intelligent resume parsing using Gemini (primary) and Groq (fallback).

This agent takes raw extracted text from any resume format and returns
a clean, structured JSON representation. It understands:
- Multi-column layouts (Canva, designed resumes)
- Non-standard section names
- Interleaved text from column extraction
- Semantic grouping of related content
- Reading order reconstruction

The agent NEVER hallucates — it only restructures and rewrites what exists.
"""

import json
import os
import re
import urllib.request
import urllib.error
from typing import Any


GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

RESUME_PARSE_PROMPT = """You are an expert resume parser and ATS optimization specialist.

You will receive raw text extracted from a resume PDF. The text may be messy because:
- It might come from a multi-column layout (Canva, designed resumes)
- Sections might be interleaved (e.g., Skills and Projects text mixed together)
- Reading order might be scrambled
- There may be artifacts, icons, or broken text

Your job is to UNDERSTAND the resume semantically and reconstruct it into clean, structured sections.

CRITICAL RULES:
1. NEVER invent or hallucinate any information — only use what's in the text
2. NEVER add skills, experiences, metrics, or achievements that don't exist in the original
3. You MAY rewrite bullet points for better ATS readability (stronger action verbs, clearer impact)
4. You MAY fix grammar and standardize formatting
5. You MUST standardize section names to: Profile, Experience, Education, Skills, Projects, Certifications, Achievements, Publications, Volunteer, Interests
6. You MUST separate interleaved content into correct sections
7. For bullet points, start with strong action verbs (Developed, Engineered, Implemented, Led, etc.)
8. Combine broken/fragmented lines into complete sentences

Return ONLY valid JSON in this exact format (no markdown, no code blocks, no explanation):
{
  "candidate_name": "Full Name",
  "candidate_email": "email or null",
  "candidate_phone": "phone or null",
  "candidate_location": "location or null",
  "candidate_linkedin": "linkedin url or null",
  "candidate_github": "github url or null",
  "sections": [
    {
      "title": "Section Name",
      "content": [
        "Line 1 of content",
        "Line 2 of content",
        "- Bullet point if applicable"
      ]
    }
  ]
}

For the Profile/Summary section, combine all lines into ONE flowing paragraph.
For Skills, list them as a single comma-separated line.
For Education, format as: "Institution | Degree | Year | GPA/CGPA" on one line per entry.
For Projects, format each project as:
  "PROJECT NAME"
  "Context | Technologies"
  "- Achievement bullet 1"
  "- Achievement bullet 2"
For Experience, format each role as:
  "Company Name | Role | Duration"
  "- Achievement bullet 1"
  "- Achievement bullet 2"

Here is the raw resume text:

"""

CURATE_PROMPT = """You are an expert ATS resume optimizer.

You will receive:
1. A structured resume (as JSON)
2. A job description analysis (as JSON) — this may be null

Your job is to optimize the resume for ATS (Applicant Tracking Systems) while preserving all factual information.

CRITICAL RULES:
1. NEVER invent or hallucinate any information
2. NEVER add skills, experiences, or metrics that don't exist in the original resume
3. You MAY rewrite bullet points with stronger action verbs and clearer impact
4. You MAY reorder sections for better ATS flow (Profile → Experience → Skills → Projects → Education)
5. You MAY improve grammar and wording
6. If a job description is provided, emphasize matching skills and keywords
7. Standardize section names for ATS compatibility

Return ONLY valid JSON in this exact format:
{
  "sections": [
    {
      "title": "Section Name",
      "content": ["line1", "line2"],
      "changes": ["description of what was changed"]
    }
  ],
  "rewritten_bullets": [
    {
      "original": "original text",
      "rewritten": "improved text",
      "reason": "why it was changed"
    }
  ],
  "ats_keywords_found": ["keyword1", "keyword2"],
  "ats_keywords_missing": ["keyword1", "keyword2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}

"""


def _call_gemini(prompt: str, text: str) -> dict | None:
    """Call Google Gemini API (free tier: 15 RPM, 1M tokens/day)."""
    if not GEMINI_API_KEY:
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

    payload = json.dumps({
        "contents": [{
            "parts": [{"text": prompt + text}]
        }],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 4096,
            "responseMimeType": "application/json",
        }
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            text_content = data["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text_content)
    except (urllib.error.URLError, KeyError, json.JSONDecodeError, IndexError) as e:
        print(f"Gemini error: {e}")
        return None


def _call_groq(prompt: str, text: str) -> dict | None:
    """Call Groq API with Llama 3.3 70B (free tier: 30 RPM)."""
    if not GROQ_API_KEY:
        return None

    url = "https://api.groq.com/openai/v1/chat/completions"

    payload = json.dumps({
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": "You are an expert resume parser. Return ONLY valid JSON, no markdown or explanation."},
            {"role": "user", "content": prompt + text},
        ],
        "temperature": 0.1,
        "max_completion_tokens": 4096,
        "response_format": {"type": "json_object"},
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {GROQ_API_KEY}",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            text_content = data["choices"][0]["message"]["content"]
            return json.loads(text_content)
    except (urllib.error.URLError, KeyError, json.JSONDecodeError, IndexError) as e:
        print(f"Groq error: {e}")
        return None


def _extract_json_from_text(text: str) -> dict | None:
    """Extract JSON from text that might have markdown code blocks."""
    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try extracting from markdown code block
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Try finding first { to last }
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(text[start:end + 1])
        except json.JSONDecodeError:
            pass

    return None


def ai_parse_resume(raw_text: str) -> dict | None:
    """Parse raw resume text using AI (Gemini primary, Groq fallback).

    Returns structured resume dict or None if both fail.
    """
    # Try Gemini first
    result = _call_gemini(RESUME_PARSE_PROMPT, raw_text)
    if result and "sections" in result:
        result["_ai_provider"] = "gemini"
        return result

    # Fallback to Groq
    result = _call_groq(RESUME_PARSE_PROMPT, raw_text)
    if result and "sections" in result:
        result["_ai_provider"] = "groq"
        return result

    return None


def ai_curate_resume(resume_json: dict, job_analysis: dict | None = None) -> dict | None:
    """Use AI to curate/optimize a structured resume for ATS.

    Returns curated resume dict or None if both fail.
    """
    input_text = f"RESUME:\n{json.dumps(resume_json, indent=2)}"
    if job_analysis:
        input_text += f"\n\nJOB DESCRIPTION ANALYSIS:\n{json.dumps(job_analysis, indent=2)}"
    else:
        input_text += "\n\nJOB DESCRIPTION: Not provided. Optimize for general ATS compatibility."

    # Try Gemini first
    result = _call_gemini(CURATE_PROMPT, input_text)
    if result and "sections" in result:
        return result

    # Fallback to Groq
    result = _call_groq(CURATE_PROMPT, input_text)
    if result and "sections" in result:
        return result

    return None
