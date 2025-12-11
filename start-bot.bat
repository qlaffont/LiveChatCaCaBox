@echo off
REM LiveChat CaCaBox Bot Starter
REM This script starts the bot and keeps the console window open to show logs

echo ========================================
echo   LiveChat CaCaBox Bot
echo ========================================
echo.
echo Starting bot...
echo.

REM Change to the directory where the script is located
cd /d "%~dp0"

REM Check if node is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if pnpm is available
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: pnpm is not installed or not in PATH
    echo Please install pnpm: npm install -g pnpm
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo ERROR: .env file not found
    echo Please copy .env.example to .env and configure it
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call pnpm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Start the bot
echo.
echo Bot is starting... (Press Ctrl+C to stop)
echo.
call pnpm dev

REM If the bot exits, keep the window open
echo.
echo Bot has stopped.
pause
