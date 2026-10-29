@echo off
title GlaciAgua - Docker Compose
echo ========================================================
echo   Levantando GlaciAgua con Docker Compose
echo   (ML API: 8001 + Backend: 8000 + Frontend: 5173)
echo ========================================================
echo.

docker compose up --build
pause
