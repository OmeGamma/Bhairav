@echo off
setlocal enabledelayedexpansion

echo.
echo ============================================
echo   Bhairav Startup Script
echo   Starting Backend + Frontend
echo ============================================
echo.

cd /d "%~dp0"

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.11+.
    exit /b 1
)

REM Check backend venv
if not exist "backend\venv\Scripts\python.exe" (
    echo [ERROR] Backend virtual environment not found.
    echo         Run: cd backend && python -m venv venv
    exit /b 1
)

REM Check frontend node_modules
if not exist "frontend\node_modules" (
    echo [WARNING] Frontend node_modules not found. Running npm install...
    cd frontend
    npm install
    cd ..
)

REM Check .env
if not exist "backend\.env" (
    echo [ERROR] backend\.env not found. Copy from backend\.env.example and configure.
    exit /1
)

REM Start backend
echo.
echo [1/2] Starting Backend (FastAPI on port 8000)...
echo.
start "Bhairav Backend" cmd /c "cd backend && venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

REM Wait for backend
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

REM Start frontend
echo.
echo [2/2] Starting Frontend (Vite on port 5173)...
echo.
start "Bhairav Frontend" cmd /c "cd frontend && npm run dev"

echo.
echo ============================================
echo   Bhairav is starting.
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo   API:      http://localhost:8000/api/health
echo   System:   http://localhost:8000/api/system/status
echo ============================================
echo.

pause
