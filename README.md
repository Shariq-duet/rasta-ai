# Rasta AI

**A bilingual (English / اردو) voice agent that drives a banking app end-to-end.**
Say *"I want to pay my electricity bill"* or *"پیسے بھیجنا ہے"* — Rasta AI
navigates the Zenith Bank demo app, highlights the exact element to tap, and
talks you through every step of the flow in Urdu.

Built for the Banowabil Hackathon. The name nods to **Raast**, Pakistan's
instant-payment system — *rasta* also means "the way".

---

## What Rasta AI can do

15 intents, 7 of them fully guided multi-step flows:

| Say this (English / Urdu) | Rasta AI does this |
|---|---|
| "what's my balance" / "میرا بیلنس کتنا ہے" | Highlights the balance on the dashboard |
| "send money" / "پیسے بھیجنا ہے" | Guides the transfer: recipient → amount → submit |
| "pay my bill" / "بجلی کا بل جمع کرنا ہے" | Guides the bill flow: biller → amount → submit |
| "scan a QR code" / "کیو آر" | Guides Raast QR pay: scan → amount → confirm |
| "freeze my card" / "کارڈ منجمد کرو" | Card management: open card → freeze → PIN → block |
| "order a cheque book" / "چیک بک منگوانی ہے" | Cheque-book request, step by step |
| "stop a cheque" / "چیک روکنا ہے" | Stop-cheque instruction, step by step |
| "I need a certificate" / "سرٹیفکیٹ چاہیے" | Balance / tax certificate request |
| "where did my money go" / "میرا خرچ کہاں گیا" | Opens spending analytics |
| "nearest ATM" / "قریبی اے ٹی ایم" | Branch & ATM locator |
| "show my transactions" / statements / notifications / profile | …and more |

Every guided step:

- **glows the exact element** with a bouncing arrow (pointing right on the desktop sidebar),
- **speaks Urdu instructions** in the browser via the Web Speech API,
- **auto-advances** after 12 s — or instantly on "next" / "agla",
- and when the flow completes, **announces the result** ("بل کامیابی سے ادا ہو گیا!")
  and highlights the *Back to home* button.

If you ask from the wrong screen ("pay my bills" while on the transfer form),
Rasta AI highlights the navigation button **and tells you where to go** — then
starts step 1 automatically the moment you arrive.

## 60-second demo script

1. Open http://localhost:3000 and sign in (credentials are prefilled).
2. Tap the **اُ language pill** (bottom-right) to switch to Urdu, then tap the **mic button**.
3. Say **"پیسے بھیجنا ہے"** (or "send money" in English mode).
4. Watch the nav button glow + hear the Urdu instruction, click through.
5. Each form step glows and speaks, auto-advancing — no typing needed.
6. Success: Urdu congratulations + the home button glows.
7. Repeat with **"freeze my card"**, **"چیک بک منگوانی ہے"**, or **"I need a balance certificate"**.

## How it works

```
   Bank-Ui (Next.js 15)                agent.py (Python)              speech stack
┌───────────────────────────┐  ws://localhost:8765  ┌────────────────┐  ┌──────────────────┐
│ data-agent-id on ~165     │ ────────────────────► │ screen tracker │  │ faster-whisper   │
│ interactive elements      │   AGENT_SCREEN_CHANGE │ intent engine ─┼─►│ (STT, forced     │
│ agentBridge.js            │ ◄──────────────────── │ decide_target()│  │  EN/UR language) │
│  • highlight + arrow      │   AGENT_HIGHLIGHT     │ guided flows   │  │ Ollama qwen2.5:3b│
│  • Urdu speech (Web API)  │   AGENT_CLICK         │ (auto-advance, │  │ (LLM intents +   │
│  • mic button (AGENT_AUDIO│   + flow guidance     │  completion)   │  │  keyword fallback│
│  • EN/اُ toggle            │                       └────────────────┘  │ edge-tts (Urdu)  │
└───────────────────────────┘                                           └──────────────────┘
```

- **Intent classification** — a local LLM (Ollama, `qwen2.5:3b-instruct`) with a
  multi-script keyword fallback (English, Roman Urdu, Urdu) so the demo never
  dies on stage.
- **Language** — pick EN / اُ in the app UI; Whisper then transcribes with that
  forced language. One pass, no auto-detection, no misclassifications.
- **STT + LLM run locally** — no API keys; TTS uses edge-tts (free, no key).
- **Responsive** — the same agent drives the phone layout and the desktop
  sidebar; candidate id lists (`["nav-home", "side-nav-dashboard"]`) resolve
  to whichever exists in the DOM.

## Project layout

```
Rasta-AI/
├── Bank-Ui/                  # Next.js 15 banking app (Tailwind, Zustand)
│   └── src/lib/agentBridge.js  # WebSocket bridge: highlights, speech, mic
├── agent.py                  # voice agent orchestrator (WebSocket server)
├── intent.py                 # LLM intent classifier (Ollama) 
├── transcribe.py             # standalone STT tester
├── test_flows.py             # end-to-end test: all 7 flows, 30 assertions
├── requirements.txt          # Python dependencies
└── PROJECT_GUIDE.md          # deep-dive documentation
```

## Quickstart

```powershell
# 1. Python deps (STT, agent, TTS)
pip install -r requirements.txt

# 2. The banking app
cd Bank-Ui
npm install
npm run dev                   # http://localhost:3000

# 3. The voice agent (new terminal, repo root)
python agent.py               # defaults to English; switch with the in-app toggle
```

Optional — LLM-powered intents (the keyword fallback works fine without it):

```powershell
ollama serve
ollama pull qwen2.5:3b-instruct
```

First `mic` / audio command downloads the Whisper `medium` model (~1.5 GB) —
do one test run before presenting.

## Verify without the app

```powershell
python agent.py --self-test   # smoke test: server + classify + highlight
python test_flows.py          # full suite: all guided flows, cross-screen nav
```

## Tech stack

Next.js 15 · Tailwind CSS · Zustand · WebSocket · faster-whisper · Ollama
(qwen2.5:3b-instruct) · edge-tts · Web Speech API · sounddevice
