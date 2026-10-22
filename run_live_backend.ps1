# Zenith Bank Voice Agent - Live Backend & Tunnel Launcher (PowerShell)
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   ZENITH BANK VOICE AGENT - LIVE BACKEND LAUNCHER" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Starting Python FastAPI Backend on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python server.py"
Start-Sleep -Seconds 2
Write-Host "Backend running on http://localhost:8000" -ForegroundColor Green
Write-Host ""

Write-Host "[2/2] Launching Cloudflare Public Tunnel..." -ForegroundColor Yellow
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "Cloudflare will output a public HTTPS address below." -ForegroundColor White
Write-Host "Look for:  https://xxxx-xxxx.trycloudflare.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your WebSocket Agent URL is:" -ForegroundColor White
Write-Host "  wss://xxxx-xxxx.trycloudflare.com/ws" -ForegroundColor Green
Write-Host ""
Write-Host "To connect your live Vercel app without redeploying, open:" -ForegroundColor White
Write-Host "  https://bank-ui-olive.vercel.app/dashboard?agent_url=wss://xxxx-xxxx.trycloudflare.com/ws" -ForegroundColor Magenta
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

npx -y cloudflared tunnel --url http://localhost:8000
