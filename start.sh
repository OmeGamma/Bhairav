#!/bin/bash

echo "========================================="
echo "Starting Bhairav Intelligence Platform"
echo "========================================="

# Check for Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "[ERROR] Python is not installed or not in PATH!"
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed or not in PATH!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

PYTHON_CMD=python
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
fi

echo "[1/2] Starting Backend Server..."
(cd backend && pip install -r requirements.txt && $PYTHON_CMD main.py) &
BACKEND_PID=$!

echo "[2/2] Starting Frontend Server..."
(cd frontend && npm install && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "Both servers are starting up!"
echo "The frontend will be available at http://localhost:5173"
echo "The backend API will be available at http://localhost:8000"
echo "Press Ctrl+C to stop both servers."
echo "========================================="

# Wait for both processes to end
wait $BACKEND_PID $FRONTEND_PID
