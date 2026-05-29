#!/bin/bash
set -e

echo "================================================"
echo "  AI Resume Curator - Starting..."
echo "================================================"

cleanup() {
    echo ""
    echo "Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

# Start backend
cd backend
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Start frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "================================================"
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo "  Press Ctrl+C to stop"
echo "================================================"
echo ""

wait
