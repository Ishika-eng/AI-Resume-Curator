import shutil
import tempfile
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile

from app.models.resume import ParsedResume, ParsedSection
from app.services.text_extractor import extract_text
from app.services.ai_agent import ai_parse_resume
from app.services.resume_parser import parse_resume as rule_based_parse

router = APIRouter()

UPLOAD_DIR = Path(tempfile.gettempdir()) / "ai_resume_curator_uploads"
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"}


def _ai_result_to_parsed_resume(ai_result: dict, filename: str, raw_text: str, metadata: dict) -> ParsedResume:
    """Convert AI agent output to ParsedResume model."""
    sections = []
    for s in ai_result.get("sections", []):
        sections.append(ParsedSection(
            title=s.get("title", "Unknown"),
            content=s.get("content", []),
        ))

    # Store AI-extracted contact info in metadata
    for field in ["candidate_name", "candidate_email", "candidate_phone",
                   "candidate_location", "candidate_linkedin", "candidate_github"]:
        val = ai_result.get(field)
        if val:
            metadata[field] = val

    metadata["parser"] = "ai_agent"
    metadata["ai_provider"] = ai_result.get("_ai_provider", "unknown")

    return ParsedResume(
        filename=filename,
        file_type=Path(filename).suffix.lstrip("."),
        raw_text=raw_text,
        sections=sections,
        metadata=metadata,
    )


@router.post("/resume/upload", response_model=ParsedResume)
async def upload_resume(file: UploadFile):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {suffix}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    safe_name = Path(file.filename).name
    file_path = UPLOAD_DIR / safe_name

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        # Step 1: Extract raw text from file
        raw_text, metadata = extract_text(file_path)

        if not raw_text or len(raw_text.strip()) < 20:
            raise ValueError("Could not extract enough text from the file. Try a different format.")

        # Step 2: Try AI agent for intelligent parsing
        ai_result = ai_parse_resume(raw_text)

        if ai_result and "sections" in ai_result:
            result = _ai_result_to_parsed_resume(ai_result, safe_name, raw_text, metadata)
        else:
            # Step 3: Fallback to rule-based parsing if AI fails
            metadata["parser"] = "rule_based"
            result = rule_based_parse(file_path)

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse resume: {e}")
    finally:
        file_path.unlink(missing_ok=True)

    return result
