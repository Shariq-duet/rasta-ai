@echo off
title Zenith Voice Agent - Live Backend & Tunnel Launcher
echo ============================================================
echo   ZENITH BANK VOICE AGENT - LIVE BACKEND LAUNCHER
echo ============================================================
echo.
echo [1/2] Starting Python FastAPI Backend on port 8000...
start "Voice Agent Server (Port 8000)" cmd /k "python server.py"
timeout /t 2 >nul
echo Backend is running on http://localhost:8000
echo.
echo [2/2] Launching Public Tunnel...
echo ------------------------------------------------------------
echo Cloudflare will print a public link below:
echo Look for:  https://xxxx-xxxx.trycloudflare.com
echo.
echo Your Voice Agent WebSocket URL will be:
echo   wss://xxxx-xxxx.trycloudflare.com/ws
echo.
echo To connect your live Vercel app instantly, open:
echo   https://bank-ui-olive.vercel.app/dashboard?agent_url=wss://xxxx-xxxx.trycloudflare.com/ws
echo ------------------------------------------------------------
echo.
npx -y cloudflared tunnel --url http://localhost:8000
pause
