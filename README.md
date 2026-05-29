# AI Resume Curator

AI-powered resume intelligence platform that analyzes your resume, GitHub profile, local projects, and job descriptions to produce optimized, ATS-friendly resumes.

## Features

- **Resume Parsing** — Upload PDF/DOCX, auto-detect sections
- **Job Description Analysis** — Extract required/preferred skills, ATS keywords
- **GitHub Intelligence** — Analyze repos, detect frameworks, score skill confidence
- **Local Project Scanner** — Scan directories for hidden skills and projects
- **AI Curation Engine** — Rewrite bullets, find missing skills, score resume (0-100)

## Quick Start (Any Laptop)

**Prerequisites:** Python 3.11+ and Node.js 18+

```bash
git clone https://github.com/Ishika-eng/AI-Resume-Curator.git
cd AI-Resume-Curator

# One-time setup
chmod +x setup.sh start.sh
./setup.sh

# Start the app
./start.sh
```

Open **http://localhost:5173** in your browser.

## Docker

```bash
docker compose up --build
```

Open **http://localhost:3000** in your browser.

## Cloud Deployment

### Backend (Render — free)
1. Go to [render.com](https://render.com), connect your GitHub
2. Create **New Web Service** → select this repo
3. Render will auto-detect `render.yaml`
4. Add env var: `FRONTEND_URL` = your Vercel URL

### Frontend (Vercel — free)
1. Go to [vercel.com](https://vercel.com), import this repo
2. Set **Root Directory** to `frontend`
3. Add env var: `VITE_API_URL` = your Render backend URL (e.g. `https://ai-resume-curator-api.onrender.com`)
4. Deploy

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Python, FastAPI |
| Resume Parsing | pypdf, pdfplumber, python-docx |
| GitHub API | REST API (stdlib urllib) |
| Database | None (stateless) |
| Deployment | Docker, Render, Vercel |

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── models/        # Pydantic data models
│   │   ├── routers/       # API endpoints
│   │   ├── services/      # Core business logic
│   │   └── main.py        # FastAPI app
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── api.js         # API client
│   │   └── App.jsx        # Main app with step flow
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── setup.sh               # One-time setup script
├── start.sh               # Start both servers
└── render.yaml             # Render deployment config
```

## License

MIT
