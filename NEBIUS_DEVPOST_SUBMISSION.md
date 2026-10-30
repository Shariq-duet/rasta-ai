# 🚀 Rasta AI — Nebius x NVIDIA Global AI Hackathon Submission Guide

---

## 📌 Project Overview for Devpost

* **Project Title:** Rasta AI — Voice-First Autonomous Banking & Financial Inclusion Agent
* **Tagline:** Empowering 70M+ digitally excluded & elderly citizens with bilingual voice navigation, dual Guidance/Smart Fill autonomy, and real-time fraud defense powered by NVIDIA Nemotron on Nebius Token Factory.
* **Target Track:** **Best Apps and Agents Track** (Alternative: **Personal AI Track**)
* **Repository:** Public GitHub link to this repo

---

## 📝 Devpost Form Fields (Copy & Paste Ready)

### 1. Elevator Pitch (Inspiration)
Over 70% of adults in developing regions—especially the elderly and rural populations—suffer from digital interface anxiety. They find modern banking apps unintuitive, hostile, and intimidating, frequently handing their smartphones to strangers or shopkeepers to execute basic transfers and bill payments. This creates severe financial exclusion and massive exposure to fraud. 

**Rasta AI** ("Path" in Urdu) bridges this divide by turning mobile banking into an empathetic, voice-guided conversation. Users speak naturally in their native language (Urdu or English), and Rasta AI visually guides them through the interface step-by-step or safely executes the transaction for them, backed by an autonomous Scam Shield.

---

### 2. What It Does
1. **Bilingual Voice-Guided Screen Navigation:**
   * Understands everyday colloquial language and slang in both Urdu and English.
   * Directly drives the web/mobile DOM over high-speed duplex WebSockets, highlighting the exact buttons, dropdowns, and input fields to press in real time.
2. **Dual-Mode Interaction (Autonomy vs. Empowerment):**
   * **🎯 Guidance Mode (`رہنمائی`):** Designed for elderly and cautious users. The agent navigates to the screen, highlights step-1 elements with conversational voice prompts, and leaves the human in complete control of typing and confirming.
   * **⚡ Smart Fill Mode (`آٹوفل`):** Autonomous autopilot for experienced users. Extracts recipient, biller, and amount slots, pre-fills the forms automatically, and navigates directly to the review step.
3. **Scam Shield & Anomaly Defense:**
   * Automatically validates payees against registered beneficiaries; alerts users if an unknown recipient is detected.
   * Analyzes single-transaction limits and flags high-anomaly transfers (>PKR 25,000 threshold) before funds are moved.
4. **Voice Accessibility & Screen Reading:**
   * Reads account balances, spending summaries, and screen contents aloud for low-literacy users.
   * Generates bilingual spoken transaction receipts upon transfer completion.

---

### 3. How We Built It (Nebius Token Factory & NVIDIA Nemotron Architecture)

Rasta AI utilizes an ultra-low-latency, multi-tier agentic architecture:
* **Intelligence Core:** Powered by **NVIDIA Nemotron-3 Super (120B)** (`nvidia/nemotron-3-super-120b-a12b`) hosted on **Nebius Token Factory** (`https://api.tokenfactory.us-central1.nebius.com/v1/`).
* **Why NVIDIA Nemotron on Nebius?**
  * **Complex Multi-Turn Reasoning:** Nemotron’s 120B parameter capacity excels at understanding nuanced bilingual Pakistani slang (e.g. *"Hamza ko 5000 paise lagao"*, *"bijli ka bill baqi hai kya"*) while strictly extracting structured JSON slots.
  * **Safety & Guardrails:** Nemotron powers our dynamic security engine, performing multi-tier risk scoring (NORMAL vs. UNKNOWN_BENEFICIARY vs. HIGH_ANOMALY) on every financial intent.
  * **Enterprise Infrastructure:** Nebius Token Factory delivers the enterprise throughput and low token latency necessary for real-time conversational duplexing over WebSockets.
* **Frontend & Presentation:** Built with Next.js 15, Tailwind CSS, and React, featuring an interactive **AI Brain Inspector** that displays live inference telemetry directly to the user.
* **Audio Pipeline:** Whisper STT with neural speech synthesis delivering crystal-clear bilingual voice guidance.

---

### 4. Technical Architecture Diagram

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
 │   - Multilingual Intent Classification                  │
 │   - Entity Slot Extraction (Recipient, Amount, Biller)  │
 │   - Risk Anomaly Detection (>25k & Beneficiary Check)   │
 │   - Dual Mode Policy (Guidance vs. Smart Fill)          │
 └────────────────────────────┬────────────────────────────┘
                              │ JSON Action Payload
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

### 5. Challenges We Overcame
* **Bilingual Ambiguity & Slang:** Everyday colloquial financial terms (like *"paise lagao"* or *"hisaab batao"*) fail on standard English models. NVIDIA Nemotron provided the parameter depth to reliably mirror language nuances and parse entity slots accurately.
* **Elderly User Trust:** Technology-averse users fear autonomous AI clicking buttons on their bank accounts. We solved this with **Guidance Mode**, giving users full physical agency while the agent visually guides their hand.

---

### 6. What's Next
* Deploying fine-tuned NVIDIA NeMo models on Nebius AI Cloud compute for regional provincial languages (Punjabi, Pashto, Sindhi).
* Integrating biometric voiceprint authentication as a second factor before funds release.

---

### 7. Built With
`nebius`, `token-factory`, `nvidia`, `nemotron`, `python`, `websockets`, `nextjs`, `react`, `tailwind`, `fastapi`
