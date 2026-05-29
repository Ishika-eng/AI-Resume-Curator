import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import curate, github, job, local_scan, resume

app = FastAPI(title="AI Resume Curator", version="0.1.0")

allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://ai-resume-curator.vercel.app",
]

# Support Vercel preview deployment URLs
extra_origin = os.environ.get("FRONTEND_URL")
if extra_origin:
    allowed_origins.append(extra_origin)

# Also allow any Vercel preview URLs for this project
extra_origins = os.environ.get("EXTRA_ORIGINS", "")
if extra_origins:
    allowed_origins.extend([o.strip() for o in extra_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
