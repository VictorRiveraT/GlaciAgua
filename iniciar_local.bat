@echo off
title GlaciAgua - Inicio Local
echo ========================================================
echo   Iniciando GlaciAgua (ML API + Backend + Frontend PWA)
echo ========================================================
echo.

echo [1/3] Levantando Microservicio ML (FastAPI en puerto 8001)...
start "GlaciAgua - ML API" cmd /k "cd /d %~dp0api && python -m uvicorn glaciagua.api:app --reload --port 8001"

echo [2/3] Levantando Backend Orquestador (FastAPI en puerto 8000)...
start "GlaciAgua - Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --reload --port 8000"

echo [3/3] Levantando Frontend PWA (Vite en puerto 5173)...
start "GlaciAgua - Frontend" cmd /k "cd /d %~dp0front && npm run dev"

echo.
echo ========================================================
echo   Ecosistema GlaciAgua activo:
echo   - Frontend PWA:       http://localhost:5173
echo   - Backend Core API:   http://localhost:8000  (Docs: /docs)
echo   - Machine Learning:   http://localhost:8001  (Docs: /docs)
echo ========================================================
