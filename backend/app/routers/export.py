from fastapi import APIRouter
from fastapi.responses import Response

from app.models.export import ExportRequest
from app.services.resume_exporter import export_docx, export_pdf

router = APIRouter()


@router.post("/export/pdf")
async def export_resume_pdf(req: ExportRequest):
    pdf_bytes = export_pdf(req)
    filename = f"{req.candidate_name.replace(' ', '_')}_Resume.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/export/docx")
async def export_resume_docx(req: ExportRequest):
    docx_bytes = export_docx(req)
    filename = f"{req.candidate_name.replace(' ', '_')}_Resume.docx"
    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
