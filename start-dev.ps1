# Agent Monitoring API - Unified Local Development Launcher
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting Agent Monitoring API (Full-Stack AI Project)  " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$WorkspaceRoot = $PSScriptRoot

# 1. Start FastAPI Backend in a new PowerShell window
Write-Host "[1/2] Launching FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
$BackendCmd = "cd '$WorkspaceRoot'; `$env:PYTHONPATH='.'; .\backend\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $BackendCmd

# 2. Start Vite React Frontend in a new PowerShell window
Write-Host "[2/2] Launching React Vite Frontend on http://localhost:5173..." -ForegroundColor Green
$FrontendCmd = "cd '$WorkspaceRoot\frontend'; npm.cmd run dev -- --host 127.0.0.1 --port 5173"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $FrontendCmd

Write-Host "`nApplications launched successfully!" -ForegroundColor Cyan
Write-Host "  - Frontend UI:       http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend API:      http://127.0.0.1:8000" -ForegroundColor White
Write-Host "  - API Documentation: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "  - Health Check:      http://127.0.0.1:8000/health" -ForegroundColor White
Write-Host "`nKeep both terminal windows running during development and demonstration." -ForegroundColor Yellow
