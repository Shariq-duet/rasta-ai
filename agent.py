"""
The voice-agent orchestrator — the piece that ties everything together.

    1. Runs the WebSocket server on ws://localhost:8765 (the browser app
       connects here automatically via Bank-Ui/src/lib/agentBridge.js)
    2. Tracks which screen the user is on        (AGENT_SCREEN_CHANGE)
    3. Takes an utterance — typed, or a voice file via `voice <file>`
    4. Classifies it with the local LLM          (intent.py, needs Ollama)
       — falls back to simple keyword matching if Ollama is not running
    5. Highlights the matching element           (AGENT_HIGHLIGHT)

Run it, open the app in the browser, then talk to it in this console:

    mera balance kitna hai          classify + highlight the balance
    voice audio2.ogg                transcribe an audio file, then classify it
    mic                             record from microphone, then classify
    screen                          show which screen the user is on
    quit

Or run `python agent.py --self-test` to verify the whole pipeline without
the app: it connects to itself as a fake browser and checks that a spoken
request produces a highlight.

Requires:  pip install websockets requests
           faster-whisper is only needed for the `voice` command.
"""

import asyncio
import base64
import json
import os
import re
import sys
import tempfile
import time
import unicodedata

import websockets
import sounddevice as sd
from scipy.io import wavfile as _wav
from edge_tts import Communicate

from intent import classify_intent

# Navigation fallbacks — each list has the mobile bottom-nav id first, then
# the desktop sidebar equivalent. The browser bridge tries them in order and
# highlights the first one it finds in the DOM, so the same code works on
# both phone-width and desktop windows.
NAV_HOME = ["nav-home", "side-nav-dashboard"]
NAV_CARDS = ["nav-cards", "side-nav-cards"]
NAV_ANALYTICS = ["nav-analytics", "side-nav-analytics"]
NAV_QR = ["nav-qrpay", "side-nav-qrpay"]
NAV_TRANSFER = ["nav-sendmoney", "side-nav-transfer"]
NAV_BILLS = ["side-nav-bills"]  # no mobile tab for bills
NAV_STATEMENTS = ["side-nav-statements"]
NAV_LOCATOR = ["side-nav-locator"]
NAV_NOTIFICATIONS = ["side-nav-notifications"]
NAV_PROFILE = ["side-nav-profile"]
NAV_CHEQUE_BOOK = ["side-nav-cheque-book"]
NAV_CERTIFICATES = ["side-nav-certificates"]

# Navigation guidance — spoken when the agent needs the user to navigate
# to a different screen before the guided flow can begin.
NAV_GUIDANCE = {
    "send_money": "پہلے رقم بھیجنے والے صفحے پر جائیں۔",
    "pay_bill": "پہلے بل ادا کرنے والے صفحے پر جائیں۔",
    "qr_pay": "پہلے اسکین اور پے والے صفحے پر جائیں۔",
    "request_certificate": "پہلے سرٹیفکیٹ والے صفحے پر جائیں۔",
    "request_cheque_book": "پہلے چیک بک والے صفحے پر جائیں۔",
    "stop_cheque": "پہلے چیک بک والے صفحے پر جائیں۔",
    "manage_card": "پہلے کارڈز والے صفحے پر جائیں۔",
}

# Keyword fallback for when Ollama is not running. Order matters: the first
# matching row wins, so specific action intents (freeze my card, balance
# certificate, stop cheque) come BEFORE generic view intents — otherwise
# "card" in view_cards would swallow "freeze my card". Covers English,
# Roman Urdu, Urdu script, AND Hindi (Devanagari) script — Hindi is fused
# into Urdu since Whisper often detects spoken Urdu as Hindi.
FALLBACK_RULES = [
    ("stop_cheque", [
        "stop cheque", "stop check", "چیک روک", "चेक रोक",
        "cancel cheque", "چیک منسوخ",
    ]),
    ("request_cheque_book", [
        "cheque book", "check book", "چیک بک", "चेक बुक",
        "cheque leaves", "order cheque", "چیک منگوا", "new cheque",
    ]),
    ("request_certificate", [
        "certificate", "سرٹیفکیٹ", "सर्टिफिकेट", "document", "دستاویز",
        "tax certificate",
    ]),
    ("manage_card", [
        "freeze", "منجمد", "फ्रीज़",
        "block card", "block my card", "card limit", "card pin",
        "کارڈ بلاک", "कार्ड ब्लॉक",
        "manage card", "card settings", "کارڈ کی ترتیبات",
    ]),
    ("pay_bill", [
        "bill", "بل", "बिल",
        "bijli", "بجلی", "बिजली",
        "گیس", "utility", "ادا", "भुगतान",
    ]),
    ("send_money", [
        "send", "bhej", "بھیج", "भेज",
        "transfer", "منتقل", "स्थानांतरण",
        "paisa bhej", "पैसे भेज",
    ]),
    ("qr_pay", [
        "scan", "qr", "کیو آر", "क्यू आर",
    ]),
    ("check_balance", [
        "balance", "بیلنس", "बैलेंस",
        "kitna paisa", "kitne paise", "کتنے پیسے", "कितने पैसे",
        "how much money",
    ]),
    ("check_transactions", [
        "transaction", "history", "statement", "کھاتہ", "ٹرانزیکشن", "लेन-देन", "record",
    ]),
    ("view_cards", [
        "card", "کارڈ", "कार्ड",
        "debit", "credit", "pin",
    ]),
    ("view_analytics", [
        "analytics", "spending", "insight", "budget", "category", "where did", "کیا خرچ", "खर्च",
    ]),
    ("find_branch", [
        "atm", "branch", "near", "locat", "نزدیک", "شاخ", "नज़दीक", "शाखा",
    ]),
    ("view_notifications", [
        "notification", "alert", "bell", "اطلاع", "सूचना",
    ]),
    ("view_statements", [
        "export", "download statement", "statement filter", "بیان", "विवरण",
    ]),
    ("view_profile", [
        "profile", "settings", "account", "پروفائل", "ترتیبات", "प्रोफ़ाइल", "सेटिंग्स",
    ]),
]
# Short spoken confirmations after each highlight. Urdu; keep them brief so the
# agent feels responsive rather than chatty.
NEXT_WORDS = {"next", "agla", "aage", "اگلا", "آگے", "phir", "अगला", "आगे"}

SPEECH_REPLIES = {
    "check_balance": "آپ کا بیلنس دکھا رہا ہوں",
    "send_money": "پیسے بھیجنے کے لیے رہنمائی کر رہا ہوں",
    "pay_bill": "بل ادا کرنے کے لیے رہنمائی کر رہا ہوں",
    "check_transactions": "ٹرانزیکشنز دکھا رہا ہوں",
    "view_cards": "کارڈز دکھا رہا ہوں",
    "view_analytics": "خرچ کا تجزیہ دکھا رہا ہوں",
    "find_branch": "قریبی برانچ دکھا رہا ہوں",
    "view_notifications": "اطلاعات دکھا رہا ہوں",
    "view_statements": "اکاؤنٹ سٹیٹمنٹ دکھا رہا ہوں",
    "view_profile": "پروفائل دکھا رہا ہوں",
    "qr_pay": "اسکین اور پے کے لیے رہنمائی کر رہا ہوں",
    "request_certificate": "سرٹیفکیٹ کی درخواست کے لیے رہنمائی کر رہا ہوں",
    "request_cheque_book": "چیک بک کی درخواست کے لیے رہنمائی کر رہا ہوں",
    "stop_cheque": "چیک روکنے کے لیے رہنمائی کر رہا ہوں",
    "manage_card": "کارڈ مینجمنٹ کے لیے رہنمائی کر رہا ہوں",
}

# Agent ids are letters, digits, dashes and underscores — matches the
# regex used by the browser bridge. Used to validate click targets.
SAFE_AGENT_ID = re.compile(r"^[A-Za-z0-9_-]+$")

# Step-by-step Urdu guidance spoken by the browser's Web Speech API during
# guided multi-step flows (send money, pay bill). Each key is a specific
# element id that appears as a step in GUIDED_STEPS.
FLOW_GUIDANCE = {
    # --- send money ---
    "sendmoney-recipient-select":
        "پہلا قدم: وصول کنندہ منتخب کریں۔ اپنے محفوظ کردہ لوگوں کی فہرست سے کسی کا نام چنیں،"
        " یا نیا شخص شامل کرنے کے لیے 'Add new' پر کلک کریں۔",
    "sendmoney-amount-input":
        "دوسرا قدم: رقم درج کریں۔ آپ کتنے پیسے بھیجنا چاہتے ہیں؟ رقم ٹائپ کریں"
        " اور پھر 'Next' دبائیں۔",
    "sendmoney-submit":
        "تیسرا قدم: تمام تفصیلات غور سے چیک کریں — وصول کنندہ، رقم، اور اکاؤنٹ۔"
        " اگر سب صحیح ہے تو 'Send' کا بٹن دبائیں۔",
    # --- pay bill ---
    "paybill-biller-select":
        "پہلا قدم: بل دہندہ منتخب کریں۔ کے الیکٹرک، سوئی گیس، پی ٹی سی ایل،"
        " یا جو بھی بل ادا کرنا ہے اس پر کلک کریں۔",
    "paybill-amount-input":
        "دوسرا قدم: بل کی رقم درج کریں۔ بل پر لکھی ہوئی رقم دیکھیں اور یہاں ٹائپ کریں۔"
        " پھر 'Next' دبائیں۔",
    "paybill-submit":
        "تیسرا قدم: تمام تفصیلات چیک کریں — بل دہندہ اور رقم۔"
        " اگر سب صحیح ہے تو 'Pay' کا بٹن دبائیں۔",
    # --- qr pay ---
    "qrpay-simulate-scan":
        "پہلا قدم: اسکین بٹن دبائیں یا نیچے سے دکاندار منتخب کریں۔",
    "qrpay-amount-input":
        "دوسرا قدم: رقم درج کریں جو آپ ادا کرنا چاہتے ہیں۔",
    "qrpay-confirm-approve":
        "تیسرا قدم: تفصیلات چیک کریں اور ادائیگی کے لیے 'Pay' دبائیں۔",
    # --- certificate ---
    "certificate-option-balance":
        "پہلا قدم: سرٹیفکیٹ کی قسم منتخب کریں — بیلنس، ٹیکس، یا اکاؤنٹ مینٹیننس۔",
    "certificate-account-select":
        "دوسرا قدم: اکاؤنٹ منتخب کریں جس کے لیے سرٹیفکیٹ چاہیے۔",
    "certificate-submit":
        "تیسرا قدم: تمام تفصیلات چیک کریں اور درخواست جمع کروائیں۔",
    # --- cheque book request ---
    "cheque-tab-request":
        "پہلا قدم: 'Request book' ٹیب پر جائیں۔",
    "cheque-account-select":
        "دوسرا قدم: اکاؤنٹ منتخب کریں جس کے لیے چیک بک چاہیے۔",
    "cheque-leaves-select":
        "تیسرا قدم: پتوں کی تعداد چنیں — ۲۵، ۵۰، یا ۱۰۰۔",
    "cheque-request-submit":
        "چوتھا قدم: درخواست جمع کروائیں۔ چیک بک ۳ سے ۵ دن میں تیار ہو جائے گی۔",
    # --- stop cheque ---
    "cheque-tab-stop":
        "پہلا قدم: چیک روکنے والے ٹیب پر کلک کریں۔",
    "cheque-stop-number-input":
        "دوسرا قدم: چیک نمبر درج کریں جو آپ روکنا چاہتے ہیں۔",
    "cheque-stop-submit":
        "تیسرا قدم: چیک روکنے کی درخواست جمع کروائیں۔",
    # --- card management ---
    "cards-open-card-debit-visa":
        "پہلا قدم: اپنے کارڈ پر کلک کریں۔",
    "cards-freeze-toggle":
        "دوسرا قدم: کارڈ منجمد کریں یا کھولیں۔",
    "cards-view-pin":
        "تیسرا قدم: اپنا پن دیکھنے کے لیے 'Reveal' دبائیں۔",
    "cards-block-card":
        "چوتھا قدم: اگر ضرورت ہو تو کارڈ مکمل طور پر بلاک کریں۔",
}

# Guided multi-step flows: saying "next" on the same screen walks
# the user through the form one glowing element at a time.
GUIDED_STEPS = {
    ("send_money", "sendmoney-screen"): [
        "sendmoney-recipient-select",
        "sendmoney-amount-input",
        "sendmoney-submit",
    ],
    ("pay_bill", "paybill-screen"): [
        "paybill-biller-select",
        "paybill-amount-input",
        "paybill-submit",
    ],
    ("qr_pay", "qr-pay-screen"): [
        "qrpay-simulate-scan",
    ],
    # The confirm step is a separate broadcast screen (internal state change,
    # not a route change) — its own step list starts fresh when it opens.
    ("qr_pay", "qrpay-confirm-screen"): [
        "qrpay-amount-input",
        "qrpay-confirm-approve",
    ],
    ("request_certificate", "certificates-screen"): [
        "certificate-option-balance",
        "certificate-account-select",
        "certificate-submit",
    ],
    ("request_cheque_book", "cheque-book-screen"): [
        "cheque-tab-request",
        "cheque-account-select",
        "cheque-leaves-select",
        "cheque-request-submit",
    ],
    ("stop_cheque", "cheque-book-screen"): [
        "cheque-tab-stop",
        "cheque-stop-number-input",
        "cheque-stop-submit",
    ],
    ("manage_card", "cards-screen"): [
        "cards-open-card-debit-visa",
    ],
    ("manage_card", "card-detail-screen"): [
        "cards-freeze-toggle",
        "cards-view-pin",
        "cards-block-card",
    ],
}

# Screens that trigger auto-guidance when the user navigates to them with an
# active flow intent. The handler auto-highlights step 1 on these screens.
FORM_SCREENS = {
    "sendmoney-screen", "paybill-screen", "qr-pay-screen", "qrpay-confirm-screen",
    "certificates-screen", "cheque-book-screen",
    "cards-screen", "card-detail-screen",
}

# Success screens that end a guided flow and reset the last intent. qr-pay,
# certificates and cheque-book swap to their success view via internal state —
# the pages broadcast these screen ids themselves.
FLOW_END_SCREENS = {
    "sendmoney-success-screen", "paybill-success-screen",
    "qrpay-success-screen", "certificate-success-screen", "cheque-success-screen",
}

# When a guided flow reaches its success screen, highlight the "Back to home"
# button and speak a completion message — a natural end for the demo.
FLOW_END_HOME = {
    "sendmoney-success-screen": ["sendmoney-success-home"],
    "paybill-success-screen": ["paybill-success-home"],
    "qrpay-success-screen": ["qrpay-success-home"],
    "certificate-success-screen": ["certificate-success-home"],
    "cheque-success-screen": ["cheque-success-home"],
}
FLOW_END_GUIDANCE = {
    "sendmoney-success-screen": "پیسے کامیابی سے بھیج دیے گئے!",
    "paybill-success-screen": "بل کامیابی سے ادا ہو گیا!",
    "qrpay-success-screen": "ادائیگی کامیابی سے مکمل ہو گئی!",
    "certificate-success-screen": "آپ کی درخواست موصول ہو گئی!",
    "cheque-success-screen": "درخواست کامیابی سے جمع ہو گئی!",
}

# Intents that start guided flows — kept alive across screen changes so the
# handler can auto-guide the form screen when the user navigates to it.
FLOW_INTENTS = {
    "send_money", "pay_bill", "qr_pay",
    "request_certificate", "request_cheque_book", "stop_cheque",
    "manage_card",
}

connected_clients = set()
current_screen = None  # the screen the browser last reported
last_intent = None  # preserved across screens so "next" advances a guided flow
flow_position = {}  # (intent, screen) -> next step index in GUIDED_STEPS

# Auto-advance delay: after highlighting a guided step, the agent
# automatically advances to the next step after this many seconds.
AUTO_ADVANCE_DELAY = 12
_flow_timer = None  # asyncio timer handle for auto-advance

# The agent supports English and Urdu. The user picks a language in the
# banking UI; the browser sends AGENT_LANGUAGE to update _stt_language.
# Defaults to English until the UI says otherwise.
_stt_language = "en"

_whisper_model = None  # loaded lazily on first `voice` command
last_highlighted = None  # the data-agent-id of the most recent highlight


def _normalize_command(text: str) -> str:
    """Lowercase and strip punctuation/symbols for command matching.

    Keeps combining marks (Hindi/Urdu vowel signs) intact — a naive
    [^\\w\\s] regex would eat Devanagari matras ('अगला' -> 'अगल').
    """
    return "".join(
        ch for ch in text.lower()
        if unicodedata.category(ch)[:1] not in ("P", "S", "C")
    ).strip()


def fallback_classify(transcript: str) -> dict:
    text = transcript.lower()
    for intent, keywords in FALLBACK_RULES:
        if any(word in text for word in keywords):
            return {"intent": intent, "confidence": "medium (keyword fallback)"}
    return {"intent": "unknown", "confidence": "low"}


def classify(transcript: str) -> dict:
    """LLM first; keyword fallback when Ollama is unreachable or errors out."""
    try:
        return classify_intent(transcript, current_screen or "unknown-screen")
    except Exception as error:  # Ollama down, model missing, timeout, bad JSON...
        print(f"[intent] Ollama unavailable ({type(error).__name__}) — using keyword fallback")
        return fallback_classify(transcript)


def decide_target(intent: str, screen: str):
    """Intent + current screen -> list of candidate data-agent-ids to highlight.

    Returns a list so the browser bridge can try each id in order and pick
    the first one that exists in the DOM (handles mobile vs desktop nav).
    Returns an empty list when nothing matches.
    """
    # Check guided flow steps first — "next" walks through them
    steps = GUIDED_STEPS.get((intent, screen))
    if steps:
        index = flow_position.get((intent, screen), 0)
        flow_position[(intent, screen)] = (index + 1) % len(steps)
        return [steps[index]]

    if intent == "check_balance":
        if screen == "home-screen":
            return ["home-balance-amount"]
        return NAV_HOME
    if intent == "send_money":
        if screen == "home-screen":
            return ["home-quick-action-send"]
        if screen == "sendmoney-confirm-screen":
            return ["sendmoney-confirm-approve"]
        if screen == "sendmoney-success-screen":
            return ["sendmoney-success-home"]
        return NAV_TRANSFER
    if intent == "pay_bill":
        if screen == "home-screen":
            return ["home-quick-action-paybill"]
        if screen == "paybill-confirm-screen":
            return ["paybill-confirm-approve"]
        if screen == "paybill-success-screen":
            return ["paybill-success-home"]
        return NAV_BILLS
    if intent == "check_transactions":
        if screen == "home-screen":
            return ["home-transactions-see-all"]
        if screen == "statements-screen":
            return ["statements-totals"]
        return NAV_STATEMENTS
    if intent == "view_cards":
        if screen == "cards-screen":
            return ["cards-open-card-debit-visa"]
        return NAV_CARDS
    if intent == "view_analytics":
        return NAV_ANALYTICS
    if intent == "find_branch":
        return NAV_LOCATOR
    if intent == "view_notifications":
        return NAV_NOTIFICATIONS
    if intent == "view_statements":
        return NAV_STATEMENTS
    if intent == "view_profile":
        return NAV_PROFILE
    if intent == "qr_pay":
        if screen == "home-screen":
            return ["home-quick-action-qr"]
        if screen == "qr-pay-screen":
            return ["qrpay-simulate-scan"]
        return NAV_QR
    if intent == "request_certificate":
        if screen == "certificates-screen":
            return ["certificate-option-balance"]
        return NAV_CERTIFICATES
    if intent == "request_cheque_book":
        if screen == "cheque-book-screen":
            return ["cheque-account-select"]
        return NAV_CHEQUE_BOOK
    if intent == "stop_cheque":
        if screen == "cheque-book-screen":
            return ["cheque-tab-stop"]
        return NAV_CHEQUE_BOOK
    if intent == "manage_card":
        if screen == "cards-screen":
            return ["cards-open-card-debit-visa"]
        if screen == "card-detail-screen":
            return ["cards-freeze-toggle"]
        return NAV_CARDS
    return []


async def send_highlight(target_ids, flow_guidance=None):
    """Send AGENT_HIGHLIGHT with a list of candidate ids.

    The browser bridge tries each id in order and highlights the first one
    it finds, which handles responsive layouts (mobile vs desktop nav).
    If flow_guidance is provided, the browser speaks it via Web Speech API.
    """
    if isinstance(target_ids, str):
        target_ids = [target_ids]
    if not target_ids:
        print("[highlight] nothing to highlight")
        return
    if not connected_clients:
        print("[highlight] no browser connected — open the app first")
        return
    payload = {"type": "AGENT_HIGHLIGHT", "targetIds": target_ids}
    if flow_guidance:
        payload["flowGuidance"] = flow_guidance
    message = json.dumps(payload, ensure_ascii=False)
    await asyncio.gather(*(client.send(message) for client in connected_clients))
    label = flow_guidance or target_ids
    print(f"[highlight] -> {label}")


def record_mic(seconds: float = 4.0) -> str:
    """Record from the default microphone; return path to a temp WAV file."""
    rate = 16_000
    print(f"[mic] recording {seconds}s from default microphone...")
    audio = sd.rec(int(seconds * rate), samplerate=rate, channels=1, dtype="int16")
    sd.wait()
    path = os.path.join(tempfile.gettempdir(), "agent_mic.wav")
    _wav.write(path, rate, audio)
    print(f"[mic] saved to {path}")
    return path


async def speak_reply(text: str) -> None:
    """Generate TTS audio via edge-tts and play it through the default output."""
    try:
        communicate = Communicate(text, voice="ur-PK-AsadNeural")
        # Use a timestamp-based filename so the media player never locks the
        # next write. Old files clean up on reboot (temp dir).
        path = os.path.join(tempfile.gettempdir(), f"agent_tts_{int(time.time() * 1000)}.mp3")
        await communicate.save(path)
        os.startfile(path)  # opens with Windows default player
        print(f"[tts] spoke: {text}")
    except Exception as error:
        print(f"[tts] failed: {error}")


async def send_click(target_id: str):
    """Send AGENT_CLICK so the browser simulates a click on the target."""
    if not connected_clients:
        print("[click] no browser connected")
        return
    message = json.dumps({"type": "AGENT_CLICK", "targetId": target_id})
    await asyncio.gather(*(client.send(message) for client in connected_clients))
    print(f"[click] -> {target_id}")


def transcribe_file(path: str) -> str:
    """Blocking faster-whisper call — always run through an executor.

    Transcribes with the language the user chose at startup (no auto-detect,
    no dual-pass). Whisper is forced to one language so it cannot mishear
    Urdu as Hindi/Thai/Chinese.
    """
    global _whisper_model
    from faster_whisper import WhisperModel  # heavy import, only when needed

    if _whisper_model is None:
        print("[stt] loading whisper (first run also downloads the model)...")
        _whisper_model = WhisperModel("medium", device="cpu", compute_type="int8")

    segments, _ = _whisper_model.transcribe(path, language=_stt_language)
    result = " ".join(seg.text.strip() for seg in segments if seg.text.strip()).strip()
    if result:
        print(f"[stt] ({_stt_language}) \"{result}\"")
    else:
        print(f"[stt] ({_stt_language}) nothing intelligible")
    return result


async def handle_browser_audio(data: dict):
    """Audio recorded by the in-app mic button: save, transcribe, classify."""
    loop = asyncio.get_event_loop()
    try:
        raw = base64.b64decode(data.get("audio", ""))
    except Exception:
        print("[mic] invalid audio payload from browser")
        return
    if not raw:
        print("[mic] empty audio payload from browser")
        return
    mime = data.get("mimeType") or "audio/webm"
    ext = ".webm" if "webm" in mime else (".m4a" if "mp4" in mime else ".ogg")
    path = os.path.join(tempfile.gettempdir(), f"agent_browser_{int(time.time() * 1000)}{ext}")
    with open(path, "wb") as handle:
        handle.write(raw)
    print(f"[mic] browser audio saved ({len(raw) // 1024} KB)")
    try:
        transcript = await loop.run_in_executor(None, transcribe_file, path)
    except Exception as error:
        print(f"[stt] failed: {error}")
        return
    print(f'[stt] "{transcript}"')
    await handle_utterance(transcript)


def schedule_flow_advance():
    """Schedule auto-advance to the next guided step after AUTO_ADVANCE_DELAY."""
    global _flow_timer
    cancel_flow_advance()
    _flow_timer = asyncio.get_event_loop().call_later(
        AUTO_ADVANCE_DELAY, lambda: asyncio.ensure_future(_auto_advance_flow())
    )


def cancel_flow_advance():
    """Cancel any pending auto-advance timer."""
    global _flow_timer
    if _flow_timer:
        _flow_timer.cancel()
        _flow_timer = None


async def _auto_advance_flow():
    """Timer callback — advance the guided flow automatically."""
    global _flow_timer
    _flow_timer = None
    if not last_intent or not current_screen:
        return
    if (last_intent, current_screen) not in GUIDED_STEPS:
        return
    target = decide_target(last_intent, current_screen)
    if not target:
        return
    guidance = FLOW_GUIDANCE.get(target[0])
    await send_highlight(target, flow_guidance=guidance)
    last_highlighted = target[0]
    # Schedule the next auto-advance
    schedule_flow_advance()


async def handle_utterance(text: str):
    global last_intent
    utterance = text.strip()
    if not utterance:
        return

    # "next" advances the guided flow without re-classifying. Punctuation
    # from whisper ("Next.") is stripped before matching.
    if _normalize_command(utterance) in NEXT_WORDS and last_intent:
        intent_result = {"intent": last_intent, "confidence": "high (next)"}
    else:
        intent_result = classify(utterance)
        if intent_result["intent"] != "unknown":
            last_intent = intent_result["intent"]

    intent = intent_result["intent"]
    print(f"[intent] {json.dumps(intent_result, ensure_ascii=False)}")

    if intent == "unknown":
        print("[agent] sorry, I did not recognise that request")
        return

    if not current_screen:
        print("[agent] no browser connected yet — I don't know which screen you're on")
        return

    target = decide_target(intent, current_screen)
    if target:
        # If the target is a step in a guided flow, include step-by-step
        # Urdu guidance that the browser will speak via Web Speech API.
        guidance = FLOW_GUIDANCE.get(target[0])
        # If this is a flow intent and we're not on the form screen yet,
        # speak navigation guidance so the user knows to click the nav
        # button to reach the right screen first.
        if not guidance and intent in NAV_GUIDANCE and (intent, current_screen) not in GUIDED_STEPS:
            guidance = NAV_GUIDANCE[intent]
        await send_highlight(target, flow_guidance=guidance)
        last_highlighted = target[0]  # store the first candidate for `click`
        # For non-guided intents, speak the short confirmation via edge-tts.
        # For guided steps, the browser speaks the detailed guidance instead.
        if not guidance:
            asyncio.create_task(speak_reply(SPEECH_REPLIES.get(intent, "")))
            # Flow intents stay pending so auto-guide picks them up when the
            # user reaches the form screen; anything else replaces the flow.
            if intent not in FLOW_INTENTS:
                last_intent = None
                cancel_flow_advance()
        else:
            # Guided step — schedule auto-advance to the next step
            schedule_flow_advance()
    else:
        print(f"[agent] nothing mapped for intent '{intent}' on '{current_screen}'")


async def handler(websocket):
    global current_screen, last_intent, _stt_language
    connected_clients.add(websocket)
    print(f"[+] Browser connected. Total: {len(connected_clients)}")
    try:
        async for message in websocket:
            data = json.loads(message)
            if data.get("type") == "AGENT_AUDIO":
                await handle_browser_audio(data)
                continue
            if data.get("type") == "AGENT_LANGUAGE":
                _stt_language = data.get("language", "en")
                print(f"[lang] speech-to-text language set to: {_stt_language}")
                continue
            if data.get("type") == "AGENT_SCREEN_CHANGE":
                current_screen = data.get("screen")
                flow_position.clear()  # a new screen restarts any guided flow
                cancel_flow_advance()  # cancel any pending auto-advance
                last_highlighted = None
                print(f"[screen] -> {current_screen}")

                # End the guided flow when the user reaches a success screen —
                # highlight the "Back to home" button and speak a completion
                # message so the demo has a natural finish.
                if current_screen in FLOW_END_SCREENS:
                    if last_intent:
                        home_target = FLOW_END_HOME.get(current_screen)
                        end_guidance = FLOW_END_GUIDANCE.get(current_screen)
                        if home_target:
                            await send_highlight(home_target, flow_guidance=end_guidance)
                            last_highlighted = home_target[0]
                    last_intent = None

                # Auto-guide: if the user navigated to a form screen and we
                # have a pending flow intent, automatically highlight the first
                # step and speak the guidance — no re-engagement needed.
                if (last_intent
                        and current_screen in FORM_SCREENS
                        and (last_intent, current_screen) in GUIDED_STEPS):
                    target = decide_target(last_intent, current_screen)
                    if target:
                        guidance = FLOW_GUIDANCE.get(target[0])
                        await send_highlight(target, flow_guidance=guidance)
                        last_highlighted = target[0]
                        # Schedule auto-advance to the next step
                        schedule_flow_advance()
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected_clients.discard(websocket)
        print(f"[-] Browser disconnected. Total: {len(connected_clients)}")


HELP_TEXT = """Commands:
  <any sentence>   classify it and highlight the matching element
  mic              record 4 s from the default microphone, then classify + highlight
  voice <file.ogg> transcribe an audio file (faster-whisper), then classify it
  click            simulate a click on the currently highlighted element
  next             advance to the next step in a guided flow
  screen           show which screen the user is on
  help             show this help
  quit             stop the agent"""


async def console():
    loop = asyncio.get_event_loop()
    print(HELP_TEXT)
    while True:
        try:
            text = await loop.run_in_executor(None, input, "\nYou> ")
        except EOFError:
            break  # stdin closed (piped input finished) — shut down cleanly
        command = text.strip()
        if not command:
            continue
        if command in {"quit", "exit"}:
            break
        if command == "help":
            print(HELP_TEXT)
        elif command == "screen":
            print(f"Current screen: {current_screen}")
        elif command.startswith("voice "):
            path = command[len("voice "):].strip()
            try:
                transcript = await loop.run_in_executor(None, transcribe_file, path)
            except Exception as error:
                print(f"[stt] failed: {error}")
                continue
            print(f'[stt] "{transcript}"')
            await handle_utterance(transcript)
        elif command == "mic":
            try:
                path = await loop.run_in_executor(None, record_mic)
            except Exception as error:
                print(f"[mic] failed: {error}")
                continue
            try:
                transcript = await loop.run_in_executor(None, transcribe_file, path)
            except Exception as error:
                print(f"[stt] failed: {error}")
                continue
            print(f'[stt] "{transcript}"')
            await handle_utterance(transcript)
        elif command == "click":
            if not last_highlighted:
                print("[click] nothing is currently highlighted")
            elif not SAFE_AGENT_ID.match(last_highlighted):
                print("[click] invalid target id")
            else:
                await send_click(last_highlighted)
        else:
            await handle_utterance(command)

    print("[agent] shutting down")


async def main():
    async with websockets.serve(handler, "localhost", 8765):
        print("Voice agent running on ws://localhost:8765")
        print("Open the banking app in the browser — it connects automatically.")
        print("Use the language toggle in the UI to switch between English and Urdu.")
        await console()


async def run_self_test():
    """End-to-end check without the app: be our own browser client.

    Exercises the full chain — server bind, WebSocket connect, screen
    tracking, classification (Ollama or keyword fallback), target selection
    and highlight delivery — and reports PASS/FAIL.
    """
    async with websockets.serve(handler, "localhost", 8765):
        print("Self-test: server running on ws://localhost:8765")
        async with websockets.connect("ws://localhost:8765") as browser:
            await browser.send(json.dumps({"type": "AGENT_SCREEN_CHANGE", "screen": "home-screen"}))
            await asyncio.sleep(0.5)  # let the handler register the screen
            print(f"Self-test: announced screen -> {current_screen}")
            await handle_utterance("mera balance kitna hai")
            try:
                # handle_utterance has already sent the highlight, so this
                # recv returns immediately; the timeout is only a safety net.
                data = json.loads(await asyncio.wait_for(browser.recv(), timeout=90))
            except asyncio.TimeoutError:
                print("Self-test FAILED: no message arrived within 90 seconds")
                return
            if data.get("type") == "AGENT_HIGHLIGHT" and "home-balance-amount" in data.get("targetIds", []):
                print(f"Self-test PASSED — highlight delivered: {data['targetIds']}")
            else:
                print(f"Self-test FAILED — unexpected message: {data}")


if __name__ == "__main__":
    try:
        if "--self-test" in sys.argv:
            asyncio.run(run_self_test())
        else:
            asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[agent] stopped")
