# 🎬 Rasta AI — 2.5 Minute Demo Video Script
**Hackathon:** Nebius x NVIDIA Global AI Hackathon (Devpost)  
**Track:** Best Apps and Agents Track  
**Target Video Length:** 2 minutes 30 seconds  

---

## ⏱️ Video Timeline & Scene Breakdown

### SCENE 1: The Problem (0:00 – 0:25)
* **Visual on Screen:**  
  Start with title slide from `Rasta_AI_Presentation_original_design (1).html` or camera on presenter:  
  *Text Overlay:* **"70M+ citizens face digital banking anxiety"**
* **Spoken Voiceover (Presenter):**  
  > *"In emerging markets across the Global South, millions of elderly and rural citizens carry smartphones, but they fear mobile banking. The interfaces are bloated, English-centric, and confusing. Every day, our parents, grandparents, and workers literally hand their unlocked phones and secret PINs to strangers or kiosk operators just to transfer money or pay an electricity bill. This exposes them to devastating scams and strips away their financial dignity."*

---

### SCENE 2: Introducing Rasta AI (0:25 – 0:45)
* **Visual on Screen:**  
  Cut to the live web app dashboard (`http://localhost:3000/dashboard`). Point out the **Floating Voice Island** at the bottom center.
* **Spoken Voiceover (Presenter):**  
  > *"Meet Rasta AI—an empathetic, voice-guided digital banking agent designed for users who aren't comfortable with modern tech. Built with NVIDIA Nemotron on Nebius Token Factory, Rasta AI doesn't hide inside a tiny chatbot box; it actively illuminates the banking interface, guiding the user's hand step-by-step in natural, everyday Urdu and English."*

---

### SCENE 3: Demo — Guidance Mode (Elderly Hand-Holding) (0:45 – 1:15)
* **Visual on Screen:**  
  1. Show the mode toggle pill on the Voice Island set to **🎯 رہنمائی (Guidance Mode)**.
  2. Click the microphone icon.
  3. Speak the command:  
     `"Hamza ko 5000 rupay bhejo"` (or `"Send 5000 rupees to Hamza"`)
  4. The screen automatically transitions to `/transfer`, and the **Select Recipient** input glows green.
  5. The AI agent speaks:  
     *"رہنمائی موڈ: میں نے رقم ٹرانسفر کا صفحہ کھول دیا ہے۔ پہلے وصول کنندہ منتخب کریں، پھر رقم درج کریں۔"*
* **Spoken Voiceover (Presenter):**  
  > *"Here is our unique innovation: Guidance Mode. Elderly users don't want an AI autonomously clicking buttons with their life savings. In Guidance Mode, the agent navigates to the transfer screen, highlights the exact element with reassuring spoken instructions, and leaves the user in 100% control of typing and confirming."*

---

### SCENE 4: Demo — Smart Fill Mode (Autonomous Autopilot) (1:15 – 1:45)
* **Visual on Screen:**  
  1. Tap the mode button on the island to switch to **⚡ آٹوفل (Smart Fill Mode)**.
  2. Speak: `"Bijli ka bill pay karna hai"` (or `"Pay my K-Electric bill"`)
  3. The agent extracts the biller (`K-Electric`) and amount, navigates to `/bills`, and instantly populates the form for review.
  4. The AI confirms aloud:  
     *"I have selected your K-Electric bill. Please review and tap Confirm to execute."*
* **Spoken Voiceover (Presenter):**  
  > *"For tech-comfortable users, one tap switches to Smart Fill Mode. The agent autonomously extracts recipient, biller, and amount slots, pre-fills the payment form, and advances straight to the confirmation step."*

---

### SCENE 5: Demo — Autonomous Scam Shield & Anomaly Defense (1:45 – 2:10)
* **Visual on Screen:**  
  1. Speak an abnormal transfer:  
     `"Suleiman ko 50,000 rupay bhejo"`
  2. The system detects two flags:
     - Suleiman is **not in the registered beneficiary list** (Unknown Payee).
     - 50,000 PKR exceeds the single-transaction anomaly threshold (>25,000 PKR).
  3. The UI flashes an amber warning banner: **"Unknown Beneficiary & High Anomaly Detected"**.
  4. Spoken alert: *"This recipient is not in your beneficiaries and the amount exceeds your normal limit. Biometric verification required."*
* **Spoken Voiceover (Presenter):**  
  > *"Security is paramount. Rasta AI features an autonomous Scam Shield. When an utterance targets an unknown recipient or exceeds normal transfer limits, the agent halts automatic execution and demands explicit re-confirmation, safeguarding elderly users from coercion and telephone scams."*

---

### SCENE 6: Architecture — Powered by Nebius & NVIDIA (2:10 – 2:30)
* **Visual on Screen:**  
  Click the **AI Brain** button on the Floating Island to open the **Live AI Brain Inspector Drawer**.  
  Show the live stack:  
  `🎙️ Whisper ➔ ⚡ Nemotron-3-Super ➔ 🏷️ Entity Slots ➔ 🔊 Neural TTS`  
  Highlight the badge: **Provider: Nebius Token Factory | Model: NVIDIA Nemotron-3 Super (120B)**.
* **Spoken Voiceover (Presenter):**  
  > *"Under the hood, all multilingual intent classification, slot extraction, and fraud scoring run on NVIDIA Nemotron-3 Super (120B), hosted on Nebius Token Factory. Nebius's high-throughput serverless inference allows us to maintain round-trip conversational latency under 350 milliseconds over full-duplex WebSockets, providing instant, natural conversational flow."*

---

### SCENE 7: Conclusion & Vision (2:30 – 2:45)
* **Visual on Screen:**  
  Return to the dashboard or presenter. Show the project GitHub repo URL.
* **Spoken Voiceover (Presenter):**  
  > *"Rasta AI proves that financial inclusion isn't about teaching non-technical users how to navigate complex UIs—it's about making software that speaks their language. Because managing your hard-earned money should never require handing your phone to a stranger. Thank you!"*

---

## 💡 Quick Tips for Recording:
1. **Resolution:** 1080p (1920x1080) at 60 or 30 fps.
2. **Audio:** Use a clean USB microphone or headset; keep background noise minimal.
3. **Cursor:** Enable mouse click highlight rings in OBS/Loom so viewers see which buttons you click.
4. **Duration:** Keep it under 3 minutes (Devpost judges prefer 2:00 to 2:45).
