@echo off
title Police Complaint System Setup

echo ==========================================
echo    POLICE COMPLAINT SYSTEM SETUP
echo ==========================================

echo.
echo [1/4] Installing Backend Dependencies...
cd backend
echo Installing...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing backend dependencies.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/4] Setting up Database...
echo Ensure PostgreSQL and MongoDB are running.
echo If this fails, check 'backend/.env' credentials.
echo.
call npx prisma generate
echo Pushing schema to DB...
call npx prisma db push --accept-data-loss
if %ERRORLEVEL% NEQ 0 (
    echo Error processing Database. Check if Postgres is running/credentials are correct.
    pause
    exit /b %ERRORLEVEL%
)

echo Seeding database...
call node prisma/seed.js
if %ERRORLEVEL% NEQ 0 (
    echo Warning: Seeding failed. You may have existing data or connection issues.
    echo Continuing...
)

echo.
echo [3/4] Installing Frontend Dependencies...
cd ../frontend
echo Installing (using legacy-peer-deps to fix conflicts)...
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo Error installing frontend dependencies.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [4/4] Starting Services...
cd ../backend
start "Backend API (Port 5000)" npm start

cd ../frontend
start "Frontend App (Port 5173)" npm run dev

echo.
echo ==========================================
echo    SYSTEM IS STARTING...
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo ==========================================
echo If the windows close immediately, there was a runtime error.
pause
