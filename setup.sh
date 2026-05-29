#!/bin/bash
set -e

echo "================================================"
echo "  AI Resume Curator - Setup"
echo "================================================"
echo ""

# Check Python
if command -v python3 &>/dev/null; then
    PY=python3
elif command -v python &>/dev/null; then
    PY=python
else
    echo "ERROR: Python 3 is required. Install it from https://python.org"
    exit 1
fi

PY_VERSION=$($PY --version 2>&1 | grep -oE '[0-9]+\.[0-9]+')
echo "Found Python $PY_VERSION"

# Check Node
if ! command -v node &>/dev/null; then
    echo "ERROR: Node.js is required. Install it from https://nodejs.org"
    exit 1
fi
echo "Found Node $(node --version)"

# Backend setup
echo ""
echo "Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    $PY -m venv venv
fi

source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
pip install -q -r requirements.txt

cd ..

# Frontend setup
echo "Setting up frontend..."
cd frontend
npm install --silent
cd ..

echo ""
echo "================================================"
echo "  Setup complete! Run with: ./start.sh"
echo "================================================"
