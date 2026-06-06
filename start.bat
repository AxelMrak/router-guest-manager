@echo off
echo Starting Router Guest Manager...
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.

start "Router Backend" cmd /c "cd backend && bun run dev"
start "Router Frontend" cmd /c "cd frontend && bun run dev"

echo Press Ctrl+C or close this window to stop both servers.
pause
