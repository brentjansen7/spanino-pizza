@echo off
echo Spanino Pizza Beheer starten...

echo.
echo [1/4] Backend paketten installeren...
cd backend
call npm install
if errorlevel 1 (echo FOUT: npm install mislukt & pause & exit /b 1)

echo.
echo [2/4] Database opzetten...
call npx prisma generate
call npx prisma migrate dev --name init
call node src/seed.js

echo.
echo [3/4] Frontend paketten installeren...
cd ..\frontend
call npm install
if errorlevel 1 (echo FOUT: npm install mislukt & pause & exit /b 1)

echo.
echo [4/4] App starten...
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Druk Ctrl+C om te stoppen.
echo.

start "Spanino Backend" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 2 /nobreak >nul
start "Spanino Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo App gestart! Ga naar http://localhost:5173
echo Standaard wachtwoord: spanino2026
pause
