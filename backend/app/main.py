from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import curate, github, job, local_scan, resume

app = FastAPI(title="AI Resume Curator", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router, prefix="/api")
app.include_router(job.router, prefix="/api")
app.include_router(github.router, prefix="/api")
app.include_router(local_scan.router, prefix="/api")
app.include_router(curate.router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
