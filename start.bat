@echo off
echo =========================================
echo Starting Bhairav Intelligence Platform
echo =========================================

:: Check if Python is installed
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not added to your PATH!
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b
)

:: Check if Node.js is installed
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not added to your PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

echo.
echo [1/2] Starting Backend Server...
cd backend
start "Bhairav Backend" cmd /k "pip install -r requirements.txt && python main.py"
cd ..

echo [2/2] Starting Frontend Server...
cd frontend
start "Bhairav Frontend" cmd /k "npm install && npm run dev"
cd ..

echo.
echo Both servers are starting up in separate windows!
echo The frontend will be available at http://localhost:5173
echo The backend API will be available at http://localhost:8000
echo =========================================
pause
