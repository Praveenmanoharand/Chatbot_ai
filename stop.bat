@echo off
echo ==========================================
echo    Stopping Aura AI Backend 🛑
echo ==========================================

:: Find the PID using port 5000 and kill it
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    echo [INFO] Found process on port 5000 (PID: %%a). Killing...
    taskkill /F /PID %%a
)

echo [SUCCESS] Backend stopped.
pause
