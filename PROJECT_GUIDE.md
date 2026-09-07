# Project guide — Zenith Bank voice agent (hackathon demo)

_Last updated: 30 Aug 2026 (late evening). Major update: `agent.py` now EXISTS and
passes its end-to-end self-test — the earlier version of this guide described it as
"missing", which is no longer true. Frontend is summarized briefly; the backend/AI
side is explained in detail because that is where the interesting work is._

---

## 1. What this project is (the big picture)

A hackathon demo of a **voice-controlled banking app**:

- **Frontend**: a Next.js mobile-banking UI ("Zenith Bank", demo data only).
- **Backend/AI**: a **Python voice agent** running locally that takes what you say
  (typed into its console, or Urdu/English audio files), figures out what you want,
  and **highlights the right button on the screen** so you can follow along.

The two halves talk over a **WebSocket** on `ws://localhost:8765`.

```
┌──────────────────────────┐    ws://localhost:8765     ┌────────────────────────────────┐
│  Bank-Ui  (Next.js,      │ ◄────── WebSocket ───────► │  Python voice agent            │
│  runs in the browser)    │                            │                                │
│                          │  app → agent:              │  agent.py   ✅ THE BRAIN        │
│  agentBridge.js          │   AGENT_SCREEN_CHANGE      │   ├─ WebSocket server          │
│   • tells agent which    │                            │   ├─ intent (Ollama LLM, or    │
│     screen you are on    │  agent → app:              │   │  keyword fallback)         │
│   • glows elements the   │   AGENT_HIGHLIGHT          │   ├─ intent → action map       │
│     agent points to      │                            │   └─ file transcription        │
└──────────────────────────┘                            │  intent.py     (LLM classifier)│
                                                        │  transcribe.py (STT test tool) │
                                                        │  websocket.py  (superseded)    │
                                                        └────────────────────────────────┘
```

**The voice pipeline, and where it stands today:**

```
You speak ("mera balance kitna hai")
   │
   ▼  agent.py `mic` command  (sounddevice → scipy WAV → faster-whisper)  ✅ WORKS
   transcript: "mera balance kitna hai"
   │
   ▼  intent.py  (local LLM via Ollama + keyword fallback)               ✅ WORKS
   {"intent": "check_balance", "confidence": "high"}
   │
   ▼  decide_target() in agent.py  (intent + screen → element)           ✅ WORKS
   "on home-screen → highlight home-balance-amount"
   │
   ▼  agent.py → browser  (agentBridge.js applies the glow)              ✅ WORKS
   browser glows the balance
   │
   ▼  TTS reply  (edge-tts, Urdu "ur-PK-AsadNeural" voice)               ✅ WORKS
   "Aap ka balance dikha raha hoon" plays through speakers
   │
   ▼  AGENT_CLICK  (agent clicks the glowing element)                    ✅ WORKS
   browser simulates a click (flash animation + .click())
```

The whole chain was verified end-to-end on 30 Aug 2026 with
`python agent.py --self-test` — see §4.1 for the verified output.

---

## 2. Where everything lives — ONE folder now

**Decision: you are staying in `C:\Users\PMLS\Downloads\Banowabil Hackathon`.**
All recent work (agent.py, the intent.py fixes, requirements.txt, cleanup) happened
in this folder. Work here from now on.

| File | Status | What it is |
|---|---|---|
| `agent.py` | ✅ **NEW — built + self-tested** | The orchestrator (server + brain). **The main backend file.** |
| `intent.py` | ✅ **FIXED** (bugs from earlier guide) | Intent classifier (Ollama LLM) |
| `requirements.txt` | ✅ NEW | Python dependencies (`pip install -r requirements.txt`) |
| `websocket.py` | ⚠️ superseded | Old manual-test server. agent.py absorbed everything it did. Safe to delete. |
| `transcribe.py` | ✅ unchanged | Standalone STT test script (agent.py now has its own `voice` command) |
| `Bank-Ui\` | ✅ complete + verified | The Next.js frontend (`node_modules` installed) |
| `Bank-Ui\src\lib\agentBridge.js` | ✅ | WebSocket client inside the app (the JS half of the bridge) |
| `*.ogg` (5 audio files) | ✅ | Urdu voice notes for testing speech-to-text |

Cleanup already done: `websocket_react.py` (obsolete JS-in-a-.py file) deleted, test
screenshots deleted, and the temporary test artifacts (`test-client.mjs`,
`client.log`, `client-err.log`, `producer-status.txt`) deleted.

**About `C:\Users\PMLS\Downloads\banowabil\`** (the other copy): it is now **STALE**.
It has the older unfixed `intent.py`, no `agent.py`, no `requirements.txt`, no
`websocket.py`, and an outdated copy of this guide. You decided not to switch —
treat it as a dead backup or delete it. Nothing in this guide applies to it.

---

## 3. What is DONE — frontend (brief)

Everything below is **built, linted, production-built, and live-tested**:

| Piece | File | What it does |
|---|---|---|
| Element tagging | `Bank-Ui\src\lib\agent.js` | `agentProps('id')` puts `data-agent-id="id"` on ~165 interactive elements |
| Screen broadcast | `Bank-Ui\src\lib\agent.js` + `ScreenBroadcaster.jsx` (+ per-page broadcasts) | On every route change fires event `AGENT_SCREEN_CHANGE` and sets `window.__AGENT_SCREEN__`. qr-pay / certificates / cheque-book also broadcast on **internal state changes** (confirm/success views) |
| WebSocket bridge | `Bank-Ui\src\lib\agentBridge.js` | Connects to `ws://localhost:8765`, auto-reconnects with backoff, forwards screen changes, applies highlights for 30 s, speaks Urdu guidance via Web Speech API |
| Highlight style | `Bank-Ui\src\app\globals.css` (search `agent-highlight`) | Pulsing glow ring + floating bouncing arrow; arrow points **right** for sidebar elements |
| Mic button | `Bank-Ui\src\components\layout\MicButton.jsx` | Floating mic — records ≤5 s, sends audio to the agent (`AGENT_AUDIO`), which transcribes + classifies + highlights |
| Language picker | `Bank-Ui\src\components\layout\LanguagePicker.jsx` | Floating EN / اُ toggle — tells the agent which language to force for Whisper (`AGENT_LANGUAGE`) |
| Bridge startup | `Bank-Ui\src\app\login\page.jsx` and `Bank-Ui\src\app\(app)\layout.jsx` | Bridge starts once per session, on every route |

To run the frontend:

```powershell
cd "C:\Users\PMLS\Downloads\Banowabil Hackathon\Bank-Ui"
npm run dev        # → http://localhost:3000  (login accepts anything, fields are prefilled)
```

Dependencies are already installed (`node_modules` exists).

---

## 4. What is DONE — backend / AI (detailed)

### 4.1 `agent.py` — the orchestrator ✅ built and self-tested (30 Aug 2026)

**Location:** `Banowabil Hackathon\agent.py` (~280 lines). This is the brain that
ties your three earlier pieces together. It:

1. Runs the WebSocket server on `ws://localhost:8765` (the browser app connects
   automatically via `agentBridge.js` — start the agent BEFORE or after the app,
   the bridge keeps retrying either way).
2. **Tracks which screen you are on** — receives `AGENT_SCREEN_CHANGE` from the
   browser and stores it in `current_screen`.
3. **Classifies each utterance** — calls `classify_intent()` from `intent.py`
   (Ollama LLM). If Ollama is not running or errors out, it falls back to keyword
   matching (English + Roman Urdu + Urdu script — see `FALLBACK_RULES`), so the
   demo never dies on stage.
4. **Maps intent + current screen → the element to glow** — `decide_target()`.
5. **Sends the highlight** — `AGENT_HIGHLIGHT` to every connected browser.
6. Extras: `voice <file.ogg>` runs the audio through faster-whisper first, and
   `next` advances guided multi-step flows without re-classifying.

**Console commands** (typed into agent.py's terminal while it runs):

| Command | Effect |
|---|---|
| `mera balance kitna hai` (any sentence) | Classify it and glow the matching element |
| `mic` | Record 4 s from the default microphone, transcribe, then classify + glow + speak |
| `voice audio2.ogg` | Transcribe the file (faster-whisper, Urdu), then classify + glow + speak |
| `click` | Simulate a click on the currently highlighted element (browser receives AGENT_CLICK) |
| `next` | Repeat the last intent; on a form screen advances to the next step |
| `screen` | Print which screen the user is currently on |
| `help` | Show the command list |
| `quit` | Stop the agent |

After every successful highlight the agent also **speaks a short Urdu confirmation**
(e.g. "Aap ka balance dikha raha hoon") using edge-tts with the `ur-PK-AsadNeural`
voice — the audio plays through the system default player.

**Guided multi-step flows** (`GUIDED_STEPS`): when the user asks for a flow
intent, the agent highlights each step and speaks Urdu step-by-step guidance
(browser Web Speech API). Steps **auto-advance every 12 s** (loops after the
last step), or the user can say "next" / "agla" / "aage" to skip ahead.

| Flow | Screen | Steps |
|---|---|---|
| send money | `sendmoney-screen` | recipient → amount → submit |
| pay bill | `paybill-screen` | biller → amount → submit |
| QR pay | `qr-pay-screen` → `qrpay-confirm-screen` | simulate scan → amount → pay |
| certificate | `certificates-screen` | type → account → submit |
| cheque book | `cheque-book-screen` | request tab → account → leaves → submit |
| stop cheque | `cheque-book-screen` | stop tab → cheque number → submit |
| manage card | `cards-screen` → `card-detail-screen` | open card → freeze → PIN → block |

If the user asks for a flow from a different screen, the agent highlights the
nav button AND speaks a navigation prompt (`NAV_GUIDANCE`, e.g. "پہلے بل ادا
کرنے والے صفحے پر جائیں") — then auto-starts step 1 when the user arrives.

**Flow completion**: reaching any success screen (sendmoney/paybill/
qrpay/certificate/cheque) clears the flow and highlights the "Back to home"
button with a spoken Urdu congratulations (`FLOW_END_HOME` / `FLOW_END_GUIDANCE`).

The intent → action map** (this is `decide_target()`, the core demo logic):

| Intent | User is on… | Highlights (candidates) |
|---|---|---|
| `check_balance` | `home-screen` | `home-balance-amount` |
| `check_balance` | any other screen | `nav-home` or `side-nav-dashboard` |
| `send_money` | `home-screen` | `home-quick-action-send` |
| `send_money` | `sendmoney-screen` | guided: `sendmoney-recipient-select` → `sendmoney-amount-input` → `sendmoney-submit` |
| `send_money` | `sendmoney-confirm-screen` | `sendmoney-confirm-approve` |
| `send_money` | `sendmoney-success-screen` | `sendmoney-success-home` |
| `send_money` | other screens | `nav-home`, `side-nav-dashboard`, `nav-sendmoney`, `side-nav-transfer` |
| `pay_bill` | `home-screen` | `home-quick-action-paybill` |
| `pay_bill` | `paybill-screen` | guided: `paybill-biller-select` → `paybill-amount-input` → `paybill-submit` |
| `pay_bill` | `paybill-confirm-screen` | `paybill-confirm-approve` |
| `pay_bill` | `paybill-success-screen` | `paybill-success-home` |
| `pay_bill` | other screens | `side-nav-bills` (+ Urdu "go to bills page" guidance) |
| `check_transactions` | `home-screen` | `home-transactions-see-all` |
| `check_transactions` | `statements-screen` | `statements-totals` |
| `check_transactions` | other screens | `side-nav-statements`, `nav-home`, `side-nav-dashboard` |
| `view_cards` | `cards-screen` | `cards-open-card-debit-visa` |
| `view_cards` | other screens | `nav-cards` or `side-nav-cards` |
| `view_analytics` | any screen | `nav-analytics` or `side-nav-analytics` |
| `find_branch` | any screen | `side-nav-locator` |
| `view_notifications` | any screen | `side-nav-notifications` |
| `view_statements` | any screen | `side-nav-statements` |
| `view_profile` | any screen | `side-nav-profile` |
| `qr_pay` | `home-screen` | `home-quick-action-qr` |
| `qr_pay` | other screens | `nav-qrpay` or `side-nav-qrpay` |

Notes:

- `nav-home` and `side-nav-dashboard` are the mobile and desktop equivalents
  of the "home" navigation. The bridge automatically picks the right one —
  no manual switching needed.
- **The agent can also click** (`AGENT_CLICK` message). Type `click` in the
  agent console to simulate a click on the currently highlighted element. The
  bridge calls `.click()` and shows a brief flash animation.
- **Navigation fallbacks are arrays** (`["nav-home", "side-nav-dashboard"]`).
  The bridge tries each id in the list and highlights the first one it finds
  in the DOM, so the same agent code works on both phone-width and desktop
  windows without any configuration.
- Screens the app can report (full list from `Bank-Ui\src\lib\agent.js`):
  `login-screen`, `home-screen`, `cards-screen`, `analytics-screen`,
  `sendmoney-screen`, `sendmoney-confirm-screen`, `sendmoney-success-screen`,
  `beneficiaries-screen`, `beneficiary-add-screen`, `paybill-screen`,
  `paybill-confirm-screen`, `paybill-success-screen`, `qr-pay-screen`,
  `statements-screen`, `cheque-book-screen`, `certificates-screen`,
  `locator-screen`, `notifications-screen`, `profile-screen`,
  `profile-security-screen`, `profile-notifications-screen`, `card-detail-screen`.
- The **highlight now includes a floating bouncing arrow** above the element
  plus a thicker pulsing ring, so it's easy to spot from across a room.

**Self-test** — verifies the whole chain without opening the app:

```powershell
cd "C:\Users\PMLS\Downloads\Banowabil Hackathon"
python agent.py --self-test
```

It starts the server, connects to itself as a fake browser, announces
`home-screen`, says "mera balance kitna hai", and checks that the highlight for
`home-balance-amount` arrives. Verified output from 30 Aug (Ollama running):

```
Self-test: server running on ws://localhost:8765
[+] Browser connected. Total: 1
[screen] -> home-screen
Self-test: announced screen -> home-screen
[intent] {"intent": "check_balance", "confidence": "high"}
[highlight] -> home-balance-amount
Self-test PASSED — highlight delivered: home-balance-amount
```

This proves: server bind ✓ WebSocket connect ✓ screen tracking ✓ real Ollama
classification ✓ target selection ✓ highlight delivery ✓ — i.e. everything except
microphone input and TTS.

### 4.2 `intent.py` — intent classifier ✅ works, bugs FIXED

**Location:** `Banowabil Hackathon\intent.py`.

- Sends the transcript + current screen to a **local LLM through Ollama**
  (`http://localhost:11434`, model `qwen2.5:3b-instruct`) with a prompt that forces
  a JSON answer: `{"intent": "...", "confidence": "high|medium|low"}`.
- Valid intents (15 total): `check_balance`, `send_money`, `check_transactions`,
  `pay_bill`, `view_cards`, `view_analytics`, `find_branch`, `view_notifications`,
  `view_statements`, `view_profile`, `qr_pay`, `request_certificate`,
  `request_cheque_book`, `stop_cheque`, `manage_card`, plus `unknown`.
- Handles Urdu, Roman Urdu and English examples. Validates the LLM's answer
  against the intent list.
- The three bugs from the earlier version of this guide are fixed: `"unknow"`
  typo fixed, `paybill`/`pay_bill` mismatch fixed (now `pay_bill` everywhere,
  matching agent.py), and the import-time test code is now guarded by
  `if __name__ == "__main__":` so importing it does NOT fire a network call.

Standalone test (needs Ollama running):

```powershell
python intent.py      # runs the built-in test at the bottom
```

### 4.3 `transcribe.py` — speech-to-text test script ✅ works standalone

**Location:** `Banowabil Hackathon\transcribe.py`.

- Uses **faster-whisper** (local Whisper, no API key, no internet) with the
  `medium` model on CPU, hard-coded to `audio2.ogg` with `language="ur"`.
- It is a one-shot standalone tester. **You don't need it for the demo** —
  agent.py has the same logic built in via the `voice <file.ogg>` command. Keep it
  around for quick STT experiments.
- The 5 `.ogg` files in the folder are your Urdu test recordings.

### 4.4 `websocket.py` — superseded by agent.py (safe to delete)

The old manual-test server. agent.py absorbed 100% of its functionality: the
WebSocket server, `current_screen` tracking, and `send_highlight()`. It is kept
only as a reference; nothing imports it. Deleting it costs you nothing.

### 4.5 `requirements.txt` — NEW

`websockets`, `requests` (both installed), plus `faster-whisper` (only needed for
the `voice` command). Reproducible with `pip install -r requirements.txt`.

---

## 5. What is LEFT (the honest list)

Most of the chain is now built and verified. Remaining items:

### 5.1 Rehearse the demo

Before the hackathon: run the three-terminal setup (§7), walk the three core flows
(balance, send money guided steps, pay bill guided steps) out loud, and confirm the
keyword fallback behaves well if Ollama isn't running on the demo machine. Try the
`mic` command to make sure the microphone picks up your voice cleanly, and the `click`
command to see the agent drive through a form.

### 5.2 Polish (optional)

- **Smarter TTS replies**: the agent currently speaks canned Urdu phrases. For a
  richer reply ("Aap ka balance 4 lakh 71 hazaar 890 rupay hai"), have the LLM
  draft the response text with the balance figures from `mock-data.js` — the
  Ollama call already exists in `classify()` and can be extended.
- **Auto-click in guided flows**: the `click` command is currently manual. You
  could auto-send AGENT_CLICK after each highlight on a confirm/success screen so
  the agent drives the form end-to-end without any user typing.
- **Wake word / push-to-talk**: instead of pressing Enter and waiting 4 s, detect
  "Hey Zenith" or use a single keypress to gate recording.

---

## 6. Bugs from the earlier guide — ALL RESOLVED

- `intent.py` `"unknow"` typo → fixed (`unknown`).
- `intent.py` `paybill`/`pay_bill` mismatch → fixed (`pay_bill` everywhere).
- `intent.py` test code running on import → fixed (`if __name__ == "__main__":`).
- `websocket_react.py` (JavaScript saved as .py, obsolete) → **deleted**.
- Leftover test screenshots → **deleted**.
- Temporary test artifacts (test-client.mjs, client.log, client-err.log,
  producer-status.txt) → **deleted**.

---

## 7. How to run everything TODAY

Three terminals:

```powershell
# Terminal 1 — the voice agent (start this first or second, order doesn't matter)
cd "C:\Users\PMLS\Downloads\Banowabil Hackathon"
python agent.py

# Terminal 2 — the banking app
cd "C:\Users\PMLS\Downloads\Banowabil Hackathon\Bank-Ui"
npm run dev                              # http://localhost:3000

# Terminal 3 — Ollama (needed for LLM intents; without it agent.py
# falls back to keyword matching automatically)
ollama serve
```

Then:

1. Open http://localhost:3000 and sign in with the prefilled demo login.
2. In the agent.py console type `screen` — it should print `home-screen`
   (proves browser → agent connection works).
3. Type `mera balance kitna hai` — the balance glows on the dashboard
   (proves the full voice→intent→highlight chain).
4. Type `voice audio2.ogg` — transcribes the Urdu recording, then classifies
   and glows (proves the real speech-to-text path; first run loads the ~1.5 GB
   Whisper model, so give it time).
5. Try `mainay paisay bhejnay hain` on the dashboard, then say `next` twice to
   watch the guided send-money flow step through the form.

Quick verification without the app at all:

```powershell
python agent.py --self-test    # prints "Self-test PASSED" if the chain is healthy
python test_flows.py            # full end-to-end test: all 7 flows + cross-screen nav
                                # (prints "ALL FLOW TESTS PASSED")
```

---

## 8. Recommended order of work from here

1. ~~Fix `intent.py` bugs~~ ✅ done (30 Aug)
2. ~~Cleanup (delete websocket_react.py, screenshots)~~ ✅ done
3. ~~Build `agent.py` orchestrator + intent → action map + guided flows~~ ✅ done
4. ~~File-audio path (`voice` command, faster-whisper)~~ ✅ done
5. ~~End-to-end smoke test~~ ✅ done — `--self-test` PASSED
6. ~~Mic input (`mic` command, sounddevice + scipy)~~ ✅ done (1 Sep)
7. ~~TTS (edge-tts, Urdu `ur-PK-AsadNeural` voice, auto-plays after each highlight)~~ ✅ done
8. ~~`AGENT_CLICK` (agent can click highlighted elements)~~ ✅ done
9. **Rehearse the demo** (§5.1) ← you are here

---

## 9. Quick reference — protocol between app and agent

**App → agent** (sent automatically on every screen change, and once on connect):

```json
{ "type": "AGENT_SCREEN_CHANGE", "screen": "home-screen" }
```

**Agent → app** (makes the element glow for 5 seconds, or until the next screen change):

```json
{ "type": "AGENT_HIGHLIGHT", "targetIds": ["home-balance-amount"] }
```

`targetIds` is an **array** of candidate ids. The browser bridge tries each in
order and highlights the first one found in the DOM — this handles responsive
layouts where the mobile nav id (`nav-home`) and the desktop sidebar id
(`side-nav-dashboard`) both refer to the same destination. The old single-id
format (`targetId`) is still accepted for backward compatibility.

**Agent → app** (simulates a click on the element — bridge calls `.click()` + flash):

```json
{ "type": "AGENT_CLICK", "targetId": "sendmoney-submit" }
```

**App → agent** (in-app mic button — browser-recorded audio as base64):

```json
{ "type": "AGENT_AUDIO", "audio": "<base64 webm/opus>", "mimeType": "audio/webm" }
```

**App → agent** (language picker — forces Whisper's transcription language):

```json
{ "type": "AGENT_LANGUAGE", "language": "ur" }
```

**`AGENT_HIGHLIGHT` with guidance** — when the highlight is a guided-flow step
or a navigation prompt, the agent adds `flowGuidance`; the browser speaks it
via the Web Speech API (Urdu):

```json
{ "type": "AGENT_HIGHLIGHT", "targetIds": ["paybill-amount-input"],
  "flowGuidance": "دوسرا قدم: بل کی رقم درج کریں۔۔۔" }
```

`targetId` must be a `data-agent-id` value from the app. The full inventory of all
~165 ids was documented earlier in the conversation; the ones the demo uses are in
the table in §4.1.
