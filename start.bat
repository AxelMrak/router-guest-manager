@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1
title Router Guest Manager

echo ============================================
echo        Router Guest Manager
echo ============================================
echo.

:: Check for Bun
where bun >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Bun is not installed.
    echo Install it from https://bun.sh and try again.
    pause
    exit /b 1
)

:: Install backend deps
echo [1/4] Installing backend dependencies...
cd /d "%~dp0backend"
call bun install
if %errorlevel% neq 0 (
    echo [ERROR] Backend install failed.
    pause
    exit /b 1
)

:: Install frontend deps
echo [2/4] Installing frontend dependencies...
cd /d "%~dp0frontend"
call bun install
if %errorlevel% neq 0 (
    echo [ERROR] Frontend install failed.
    pause
    exit /b 1
)

echo.
echo [3/4] Starting backend on http://localhost:3000...
start "Router Backend" cmd /c "cd /d "%~dp0backend" && echo Backend running on http://localhost:3000 && bun run dev"

:: Small delay so backend wakes up before frontend
timeout /t 2 /nobreak >nul

echo [4/4] Starting frontend on http://localhost:5173...
start "Router Frontend" cmd /c "cd /d "%~dp0frontend" && echo Frontend running on http://localhost:5173 && bun run dev"

echo.
echo ============================================
echo   All servers started!
echo   Dashboard:  http://localhost:5173
echo   API:        http://localhost:3000
echo ============================================
echo.
echo Close the console windows or press Ctrl+C in each to stop.
echo.
pause
