# 🌟 Rasta AI — Voice-First Autonomous Banking & Financial Inclusion Agent

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Model: NVIDIA Nemotron-3 Super 120B](https://img.shields.io/badge/NVIDIA%20Model-Nemotron--3%20Super%20(120B)-76B900?logo=nvidia)](https://build.nvidia.com)
[![Platform: Nebius Token Factory](https://img.shields.io/badge/Platform-Nebius%20Token%20Factory-00E5FF)](https://tokenfactory.nebius.com)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20Hosted-black?logo=vercel)](https://bank-ui-olive.vercel.app)

> **Built for the Nebius x NVIDIA Global AI Hackathon**  
> **Track:** Best Apps and Agents Track (Alternative: Personal AI Track)  
> **Live Hosted Application:** [https://bank-ui-olive.vercel.app](https://bank-ui-olive.vercel.app)

---

## 📌 Executive Summary

Over 70% of citizens in emerging economies—especially the elderly and rural populations—suffer from acute digital interface anxiety. Intimidated by complex mobile banking apps, millions literally hand their unlocked phones and secret PINs to strangers, tea stall owners, or kiosk agents just to send money to family or pay an electricity bill.

**Rasta AI** (راہ — *"Path"*) solves this crisis by transforming digital banking into an empathetic, bilingual voice-guided conversation in everyday Urdu, Roman Urdu, and English. Powered by **NVIDIA Nemotron-3 Super (120B)** on **Nebius Token Factory**, Rasta AI illuminates the banking interface in real time, guiding the user's hand step-by-step or safely executing transactions under an autonomous Scam Shield.

---

## 🚀 Key Innovations & Features

### 1. Dual-Mode Human Agency (Guidance vs. Smart Fill)
* **🎯 Guidance Mode (`رہنمائی`):** Tailored for elderly and hesitant users. The agent navigates to the screen, points to the required input fields with glowing visual highlights and spoken instructions, leaving the user in **100% physical control** of typing and confirming.
* **⚡ Smart Fill Mode (`آٹوفل`):** Autonomous autopilot for experienced users. Extracts recipient, biller, and amount slots, pre-fills forms automatically, and advances straight to the confirmation screen.

### 2. Autonomous Scam Shield & Anomaly Defense
* **Unknown Payee Alert:** Flags transactions directed to recipients not found in the user's saved beneficiaries.
* **High-Value Anomaly Alert:** Halts transactions exceeding the single-transfer threshold (>PKR 25,000) and demands explicit verbal and biometric re-confirmation to protect vulnerable users from telephone scams.

### 3. Real-Time Telemetry: AI Brain Inspector
An on-screen telemetry drawer exposing the live reasoning pipeline directly to judges and users:
* **Active Provider:** Nebius Token Factory
* **Active Model:** NVIDIA Nemotron-3 Super (`nvidia/nemotron-3-super-120b-a12b`)
* **Extracted Entity Slots:** Recipient, Amount, Biller, Note
* **Security Risk Scoring:** NORMAL vs. UNKNOWN_BENEFICIARY vs. HIGH_ANOMALY

### 4. Multilingual Accessibility & Voice Screen Reader
* Understands colloquial Pakistani financial slang (*"Hamza ko 5000 paise lagao"*, *"bijli ka bill baqi hai"*).
* Reads balances and screen summaries aloud for non-literate users.
* Generates spoken transaction receipts upon transfer completion.

---

## 🏗️ Technical Architecture

```
[ User Microphone / Web Speech ]
              │
              ▼
     [ Fast Whisper STT ]
              │ (Bilingual Utterance: English / Urdu)
              ▼
 ┌─────────────────────────────────────────────────────────┐
 │       NEBIUS TOKEN FACTORY (Inference API)             │
 │                                                         │
 │   🧠 NVIDIA Nemotron-3 Super (120B)                     │
 │   - Multilingual Intent Classification (30+ Flows)      │
 │   - Entity Slot Extraction (Recipient, Amount, Biller)  │
 │   - Risk Anomaly Scoring (>25k & Beneficiary Check)     │
 │   - Policy Arbitration (Guidance vs. Smart Fill)        │
 └────────────────────────────┬────────────────────────────┘
                              │ JSON Action Telemetry
                              ▼
        [ Real-Time Python Agent (WebSockets: 8765) ]
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
    [ DOM Action Engine ]           [ Neural Voice TTS ]
  - Highlights input buttons      - Spoken Urdu / English
  - Autofills form slots          - Step-by-step guidance
  - Telemetry to Brain Inspector  - Verbal confirmation
```

---

## ⚙️ Quickstart & Setup Guide for Judges

### 1. Prerequisites
* **Python:** 3.10 or 3.11+
* **Node.js:** 18.0+ and `npm`

### 2. Clone the Repository
```bash
git clone https://github.com/Shariq-duet/rasta-ai.git
cd rasta-ai
```

### 3. Backend Setup (Python Agent)
```bash
# Install Python dependencies
pip install -r requirements.txt

# Configure Environment Variables
cp .env.example .env
```

Edit `.env` with your Nebius Token Factory credentials:
```env
NEBIUS_API_KEY=your_nebius_api_key_here
NEBIUS_MODEL=nvidia/nemotron-3-super-120b-a12b
NEBIUS_BASE_URL=https://api.tokenfactory.us-central1.nebius.com/v1/

# Optional fallbacks (Groq, AssemblyAI, ElevenLabs)
GROQ_API_KEY=your_groq_api_key_here
```

Start the voice agent:
```bash
python agent.py
# Server listening on ws://0.0.0.0:8765
```

### 4. Frontend Setup (Next.js 15 Web Application)
In a separate terminal:
```bash
cd Bank-Ui
npm install
npm run dev
# Open http://localhost:3000 in your browser
```

*(Alternatively, access the live production deployment directly at **[https://bank-ui-olive.vercel.app](https://bank-ui-olive.vercel.app)**).*

---

## 🧪 Testing the Live Implementation (Demo Scenarios)

1. **Test Guidance Mode (Elderly Hand-Holding):**
   * Set the mode pill on the Floating Voice Island to **`🎯 رہنمائی` (Guidance)**.
   * Speak: *"Hamza ko 5000 rupay bhejo"*
   * The app navigates to `/transfer` and highlights the recipient dropdown without auto-typing.
2. **Test Smart Fill Mode (Autopilot):**
   * Switch the toggle pill to **`⚡ آٹوفل` (Smart Fill)**.
   * Speak: *"Bijli ka bill pay karna hai"* (or *"Pay my K-Electric bill"*).
   * The agent selects K-Electric, fills the due amount, and navigates to the review screen.
3. **Test Autonomous Scam Shield:**
   * Speak: *"Suleiman ko 50000 rupay bhejo"*
   * The agent detects an unknown payee and a transfer spike (>25k PKR), flashing an amber security alert.
4. **Inspect Live AI Telemetry:**
   * Click the **AI Brain** icon on the Voice Island to open the real-time reasoning drawer powered by **NVIDIA Nemotron on Nebius Token Factory**.

---

## 📂 Repository Structure

```
rasta-ai/
├── agent.py               # Asynchronous WebSocket orchestrator & DOM action engine
├── intent.py              # Nebius Token Factory & NVIDIA Nemotron intent reasoning
├── ai_config.py           # Configuration loader for Nebius, NVIDIA & fallbacks
├── transcription.py       # Whisper speech-to-text pipeline
├── tts.py                 # Neural bilingual text-to-speech engine
├── requirements.txt       # Python dependencies
├── .env.example           # Environment template with Nebius credentials
├── LICENSE                # MIT Open Source License
├── DEMO_VIDEO_SCRIPT.md   # Complete video demo script
├── screenshots/           # High-resolution UI screenshots for project gallery
└── Bank-Ui/               # Next.js 15 banking web client
    ├── src/
    │   ├── components/voice/VoiceHud.jsx  # Floating Voice Island & AI Brain Inspector
    │   ├── lib/agentBridge.js             # Dual-mode WebSocket client bridge
    │   └── app/                           # 25+ banking routes & interactive flows
```

---

## 📄 License
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
