@echo off
title GlaciAgua - Inicio Local
echo ==============================================
echo   Iniciando GlaciAgua (Backend + Frontend)
echo ==============================================
echo.

echo [1/2] Levantando Backend (FastAPI en puerto 8000)...
start "GlaciAgua - Backend" cmd /k "cd /d %~dp0Backend && python -m uvicorn main:app --reload --port 8000"

echo [2/2] Levantando Frontend (Vite en puerto 5173)...
start "GlaciAgua - Frontend" cmd /k "cd /d %~dp0Proyecto && npm run dev"

echo.
echo ==============================================
echo   Servicios listos:
echo   - Frontend Web / PWA: http://localhost:5173
echo   - Backend API REST:   http://localhost:8000
echo   - Documentacion Docs: http://localhost:8000/docs
echo ==============================================
