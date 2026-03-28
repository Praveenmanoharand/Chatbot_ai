@echo off
echo ==========================================
echo    Starting Aura AI Backend ✨
echo ==========================================

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python.
    pause
    exit /b
)

echo [INFO] Installing dependencies...
pip install -r requirements.txt

echo [INFO] Starting Flask server...
echo [INFO] Chatbot will be available at http://localhost:5000
python app.py

pause
