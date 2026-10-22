# Live Demo Setup Guide (Zenith Voice Agent)

This guide explains how to run your voice backend from your laptop and connect it directly to your live Vercel frontend ([https://bank-ui-olive.vercel.app](https://bank-ui-olive.vercel.app)) with **zero redeployments and zero cloud costs**.

---

## Whenever you want to run the live backend:

### Step 1: Double-click `run_live_backend.bat`
*(Or in PowerShell: `.\run_live_backend.ps1`)*

This script will:
1. Start your Python backend (`server.py`) on port 8000 in a separate window.
2. Launch a free Cloudflare tunnel.

---

### Step 2: Grab the Tunnel URL
In the tunnel window, look for the URL printed by Cloudflare:
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
|  https://random-name-here.trycloudflare.com                                                |
+--------------------------------------------------------------------------------------------+
```

---

### Step 3: Connect your Live Vercel Frontend Instantly
You **do not need to change any Vercel settings or redeploy**.

Simply open your browser to:
```
https://bank-ui-olive.vercel.app/dashboard?agent_url=wss://random-name-here.trycloudflare.com/ws
```
*(Replace `random-name-here.trycloudflare.com` with the URL from Step 2).*

### How it works:
* The app will automatically connect to your tunnel WebSocket.
* It saves this address to browser `localStorage` — so navigating between screens or refreshing keeps the connection active.
* If you ever want to reset it back to default, just visit: `https://bank-ui-olive.vercel.app/dashboard?agent_url=default`

---

## 100% Offline / Local Fallback (If venue Wi-Fi fails completely):
If the presentation venue has unstable internet during the finals:
1. Terminal 1: `python agent.py`
2. Terminal 2: `cd Bank-Ui && npm run dev`
3. Open `http://localhost:3000`
Everything works locally without depending on external cloud servers.
