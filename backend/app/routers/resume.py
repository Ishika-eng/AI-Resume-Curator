import shutil
import tempfile
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile

from app.models.resume import ParsedResume
from app.services.resume_parser import parse_resume

router = APIRouter()

UPLOAD_DIR = Path(tempfile.gettempdir()) / "ai_resume_curator_uploads"
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}


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
    # Sanitize filename to avoid path issues on Windows
    safe_name = Path(file.filename).name
    file_path = UPLOAD_DIR / safe_name

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        result = parse_resume(file_path)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse resume: {e}")
    finally:
        # Clean up uploaded file
        file_path.unlink(missing_ok=True)

    return result
