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

try:
    import sounddevice as sd
    from scipy.io import wavfile as _wav
except (ImportError, OSError):
    sd = None
    _wav = None
from intent import classify_intent
from transcription import transcribe_audio
from tts import synthesize_speech

# Windows consoles often default to cp1252, which cannot print Urdu script —
# force UTF-8 so printing a Urdu phrase never crashes the agent.
for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        try:
            _stream.reconfigure(encoding="utf-8", errors="replace")
        except (OSError, ValueError):
            pass

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
# to a different screen before the guided flow can begin (bilingual).
NAV_GUIDANCE = {
    "en": {
        "send_money": "First, tap on 'Send Money' below to open the transfer screen.",
        "pay_bill": "First, navigate to 'Bill Payments' from the menu.",
        "qr_pay": "First, open the QR Scan and Pay page.",
        "request_certificate": "First, go to the Certificates page.",
        "request_cheque_book": "First, go to the Cheque Book management page.",
        "stop_cheque": "First, open the Cheque Book page to stop a cheque.",
        "manage_card": "First, open the Cards tab to manage your cards.",
    },
    "ur": {
        "send_money": "پہلے نیچے سے پیسے بھیجنے والا پیج کھول لیں۔",
        "pay_bill": "پہلے بل پے کرنے والے پیج پر چلے جائیں۔",
        "qr_pay": "پہلے اسکین اور پے والا پیج کھول لیں۔",
        "request_certificate": "پہلے سرٹیفکیٹ والے پیج پر جائیں۔",
        "request_cheque_book": "پہلے چیک بک والے پیج پر جائیں۔",
        "stop_cheque": "پہلے چیک بک والے پیج پر جائیں۔",
        "manage_card": "پہلے کارڈز والے پیج پر چلے جائیں۔",
    }
}

FALLBACK_RULES = [
    ("autonomous_action_refusal", [
        "for me", "do this", "do that", "send it for me", "pay it for me", "transfer it for me",
        "click it", "enter my", "enter it", "submit it", "mere liye", "khud kar",
        "khud bhej", "khud pay", "apne hath se", "can you do this", "can you do that",
    ]),
    ("biller_guidance_gas", [
        "sui gas", "ssgc", "so you guys", "sui southern", "gas bill", "guest bill", "gas",
        "سوئی گیس", "گیس کا بل", "گیس",
    ]),
    ("biller_guidance_electricity", [
        "k-electric", "kelectric", "electric bill", "bijli ka bill", "electricity bill",
        "electricity", "bijli", "بجلی", "کے الیکٹرک",
    ]),
    ("biller_guidance_internet", [
        "ptcl", "broadband", "internet bill", "wifi bill", "internet",
        "پی ٹی سی ایل", "انٹرنیٹ کا بل", "انٹرنیٹ",
    ]),
    ("recipient_guidance", [
        "choose my recipient", "find my recipient", "pick recipient", "choose recipient",
        "select recipient", "where is recipient", "how to choose recipient", "how should i choose",
        "who am i sending", "banda kahan", "recipient kahan", "وصول کنندہ", "recipient",
    ]),
    ("amount_guidance", [
        "enter amount", "where is amount", "where to enter amount", "how much amount",
        "put amount", "amount kahan", "paise kahan likhoon", "رقم کہاں",
    ]),
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
        "utility", "ادا", "भुगतान",
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
    "en": {
        "check_balance": "Showing your account balance",
        "send_money": "Guiding you to transfer money",
        "pay_bill": "Guiding you to pay your bill",
        "check_transactions": "Showing recent transactions",
        "view_cards": "Displaying your cards",
        "view_analytics": "Showing your spending analytics",
        "find_branch": "Showing nearest branches on map",
        "view_notifications": "Opening notifications",
        "view_statements": "Opening account statements",
        "view_profile": "Opening profile settings",
        "qr_pay": "Opening QR scan and pay",
        "request_certificate": "Guiding certificate request",
        "request_cheque_book": "Guiding cheque book request",
        "stop_cheque": "Guiding stop cheque request",
        "manage_card": "Opening card management",
        "recipient_guidance": "Here is where you choose your recipient. Tap on this field to select a saved contact or tap 'Add new'.",
        "amount_guidance": "Enter the amount you wish to transfer right here in the amount field, then tap Next.",
        "biller_guidance_gas": "For your gas bill, Sui Southern Gas Company is the second option in the list, not the first or third. Tap it to proceed.",
        "biller_guidance_electricity": "For electricity, K-Electric is the first option on the list. Tap it to pay your electricity bill.",
        "biller_guidance_internet": "For your internet bill, PTCL Broadband is the third option in the list. Tap it to pay.",
        "autonomous_action_refusal": "For your security and privacy, I cannot execute transactions or enter information on your behalf. I am your guide — please tap the highlighted button to confirm it yourself.",
    },
    "ur": {
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
        "recipient_guidance": "یہاں سے آپ اپنا وصول کنندہ چن سکتے ہیں۔ اس باکس پر ٹیپ کریں اور اپنی لسٹ میں سے بندہ سلیکٹ کر لیں۔",
        "amount_guidance": "یہاں رقم والے خانے میں جتنی رقم ادا کرنی ہے وہ لکھیں اور پھر نیکسٹ دبائیں۔",
        "biller_guidance_gas": "گیس کے بل کے لیے، سوئی سدرن گیس کمپنی لسٹ میں دوسرے نمبر پر موجود ہے، نہ کہ پہلے یا تیسرے پر۔ اس پر ٹیپ کریں۔",
        "biller_guidance_electricity": "بجلی کے بل کے لیے، کے الیکٹرک لسٹ میں پہلے نمبر پر ہے۔ اس پر ٹیپ کریں۔",
        "biller_guidance_internet": "انٹرنیٹ کے بل کے لیے، پی ٹی سی ایل براڈ بینڈ لسٹ میں تیسرے نمبر پر ہے۔ اس پر کلک کریں۔",
        "autonomous_action_refusal": "آپ کے اکاؤنٹ کی سیکیورٹی کے لیے، مجھے خود ٹرانزیکشن کرنے یا آپ کی جگہ کلک کرنے کی اجازت نہیں ہے۔ میں آپ کی رہنمائی کر سکتا ہوں، برائے مہربانی اسکرین پر ہائی لائٹ کیے گئے بٹن کو خود دبائیں۔",
    }
}

# Agent ids are letters, digits, dashes and underscores — matches the
# regex used by the browser bridge. Used to validate click targets.
SAFE_AGENT_ID = re.compile(r"^[A-Za-z0-9_-]+$")

# Step-by-step bilingual guidance spoken during guided multi-step flows.
FLOW_GUIDANCE = {
    "en": {
        # --- send money ---
        "sendmoney-recipient-select":
            "First, select a recipient from your list, or tap 'Add new' to send money to someone new.",
        "sendmoney-amount-input":
            "Now enter the amount you wish to transfer and click Next.",
        "sendmoney-submit":
            "Review your transaction details and tap Send to complete the transfer.",
        # --- pay bill ---
        "paybill-biller-select":
            "First, select your utility company or service provider from the list.",
        "paybill-amount-input":
            "Now enter your bill amount and click Next.",
        "paybill-submit":
            "Review the bill summary and tap Pay to finish payment.",
        # --- qr pay ---
        "qrpay-simulate-scan":
            "Tap the scan button or choose a merchant from the list below.",
        "qrpay-amount-input":
            "Now enter the payment amount.",
        "qrpay-confirm-approve":
            "Review payment details and tap Pay to confirm.",
        # --- certificate ---
        "certificate-option-balance":
            "Select your certificate type — balance, tax, or maintenance.",
        "certificate-account-select":
            "Now select the account for which you need this certificate.",
        "certificate-submit":
            "Verify the information and tap Submit.",
        # --- cheque book request ---
        "cheque-tab-request":
            "Tap on the Request Cheque Book tab.",
        "cheque-account-select":
            "Select your bank account.",
        "cheque-leaves-select":
            "Choose the number of leaves — 25, 50, or 100.",
        "cheque-request-submit":
            "Tap Submit. Your cheque book will be delivered shortly.",
        # --- stop cheque ---
        "cheque-tab-stop":
            "Click on the Stop Cheque tab.",
        "cheque-stop-number-input":
            "Enter the cheque number you want to stop.",
        "cheque-stop-submit":
            "Submit to issue the stop payment order.",
        # --- specific billers ---
        "paybill-biller-ssgc":
            "For your gas bill, Sui Southern Gas Company is the second option in the list, not the first or third. Tap it to proceed.",
        "paybill-biller-k-electric":
            "For electricity, K-Electric is the first option on the list. Tap it to pay your electricity bill.",
        "paybill-biller-ptcl":
            "For your internet bill, PTCL Broadband is the third option in the list. Tap it to pay.",
        # --- card management ---
        "cards-open-card-debit-visa":
            "Click on your active card to manage it.",
        "cards-freeze-toggle":
            "You can freeze or unfreeze your card right here.",
        "cards-view-pin":
            "Tap Reveal to view your card PIN.",
        "cards-block-card":
            "Tap here if you need to permanently block your card.",
    },
    "ur": {
        # --- send money ---
        "sendmoney-recipient-select":
            "پہلے جسے پیسے بھیجنے ہیں، اس کا نام چن لیں یا نیا شخص شامل کرنے کے لیے 'Add new' پر ٹیپ کریں۔",
        "sendmoney-amount-input":
            "اب جتنے پیسے بھیجنے ہیں وہ رقم لکھیں اور پھر 'Next' دبائیں۔",
        "sendmoney-submit":
            "اب ساری تفصیلات چیک کر کے 'Send' کا بٹن دبا دیں۔",
        # --- pay bill ---
        "paybill-biller-select":
            "پہلے کے الیکٹرک، سوئی گیس، یا جو بھی بل ہے، وہ کمپنی سلیکٹ کر لیں۔",
        "paybill-amount-input":
            "اب اپنے بل کی رقم لکھ کر 'Next' دبائیں۔",
        "paybill-submit":
            "اب ساری تفصیلات دیکھ کر 'Pay' کا بٹن دبا دیں۔",
        # --- specific billers ---
        "paybill-biller-ssgc":
            "گیس کے بل کے لیے، سوئی سدرن گیس کمپنی لسٹ میں دوسرے نمبر پر موجود ہے، نہ کہ پہلے یا تیسرے پر۔ اس پر ٹیپ کریں۔",
        "paybill-biller-k-electric":
            "بجلی کے بل کے لیے، کے الیکٹرک لسٹ میں پہلے نمبر پر ہے۔ اس پر ٹیپ کریں۔",
        "paybill-biller-ptcl":
            "انٹرنیٹ کے بل کے لیے، پی ٹی سی ایل براڈ بینڈ لسٹ میں تیسرے نمبر پر ہے۔ اس پر کلک کریں۔",
        # --- qr pay ---
        "qrpay-simulate-scan":
            "اسکین کا بٹن دبائیں یا نیچے لسٹ سے دکاندار چن لیں۔",
        "qrpay-amount-input":
            "اب جتنی رقم ادا کرنی ہے وہ لکھ دیں۔",
        "qrpay-confirm-approve":
            "تفصیلات چیک کریں اور پیمنٹ کے لیے 'Pay' دبا دیں۔",
        # --- certificate ---
        "certificate-option-balance":
            "پہلے سرٹیفکیٹ کی قسم چن لیں — بیلنس، ٹیکس، یا مینٹیننس۔",
        "certificate-account-select":
            "اب وہ اکاؤنٹ سلیکٹ کریں جس کا سرٹیفکیٹ چاہیے۔",
        "certificate-submit":
            "تفصیلات چیک کر کے درخواست جمع کروا دیں۔",
        # --- cheque book request ---
        "cheque-tab-request":
            "پہلے 'Request book' والے ٹیب پر جائیں۔",
        "cheque-account-select":
            "اب اپنا اکاؤنٹ منتخب کریں۔",
        "cheque-leaves-select":
            "اب چیک کے پتوں کی تعداد چن لیں — ۲۵، ۵۰، یا ۱۰۰۔",
        "cheque-request-submit":
            "درخواست جمع کروا دیں، چیک بک چند دنوں میں تیار ہو جائے گی۔",
        # --- stop cheque ---
        "cheque-tab-stop":
            "چیک روکنے والے ٹیب پر کلک کریں۔",
        "cheque-stop-number-input":
            "اب جو چیک روکنا ہے اس کا نمبر لکھیں۔",
        "cheque-stop-submit":
            "چیک روکنے کی درخواست سبمٹ کر دیں۔",
        # --- card management ---
        "cards-open-card-debit-visa":
            "اپنے کارڈ پر کلک کریں۔",
        "cards-freeze-toggle":
            "یہاں سے کارڈ کو فریز یا ان فریز کر لیں۔",
        "cards-view-pin":
            "اپنا پن دیکھنے کے لیے 'Reveal' دبائیں۔",
        "cards-block-card":
            "کارڈ مکمل طور پر بلاک کرنے کے لیے یہاں دبائیں۔",
    }
}

# Guided multi-step flows: supports both Web (e.g. sendmoney-screen) and Mobile (SendMoney).
GUIDED_STEPS = {
    ("send_money", "sendmoney-screen"): [
        "sendmoney-recipient-select",
        "sendmoney-amount-input",
        "sendmoney-submit",
    ],
    ("send_money", "SendMoney"): [
        "sendmoney-recipient-select",
        "sendmoney-amount-input",
        "sendmoney-submit",
    ],
    ("pay_bill", "paybill-screen"): [
        "paybill-biller-select",
        "paybill-amount-input",
        "paybill-submit",
    ],
    ("pay_bill", "BillPayments"): [
        "paybill-biller-select",
        "paybill-amount-input",
        "paybill-submit",
    ],
    ("qr_pay", "qr-pay-screen"): [
        "qrpay-simulate-scan",
    ],
    ("qr_pay", "QR"): [
        "qrpay-simulate-scan",
    ],
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
    ("manage_card", "CardManagement"): [
        "cards-open-card-debit-visa",
    ],
    ("manage_card", "card-detail-screen"): [
        "cards-freeze-toggle",
        "cards-view-pin",
        "cards-block-card",
    ],
}

# Screens that trigger auto-guidance when navigated to with an active flow intent.
FORM_SCREENS = {
    "sendmoney-screen", "SendMoney",
    "paybill-screen", "BillPayments",
    "qr-pay-screen", "QR", "qrpay-confirm-screen",
    "certificates-screen", "cheque-book-screen",
    "cards-screen", "CardManagement", "card-detail-screen",
}

# Mapping screens to default intent for smart continuation ("what do I do next?")
SCREEN_TO_INTENT = {
    "sendmoney-screen": "send_money",
    "SendMoney": "send_money",
    "paybill-screen": "pay_bill",
    "BillPayments": "pay_bill",
    "qr-pay-screen": "qr_pay",
    "QR": "qr_pay",
    "certificates-screen": "request_certificate",
    "cheque-book-screen": "request_cheque_book",
    "cards-screen": "manage_card",
    "CardManagement": "manage_card",
    "card-detail-screen": "manage_card",
}

# Success screens that end a guided flow
FLOW_END_SCREENS = {
    "sendmoney-success-screen", "paybill-success-screen",
    "qrpay-success-screen", "certificate-success-screen", "cheque-success-screen",
}

FLOW_END_HOME = {
    "sendmoney-success-screen": ["sendmoney-success-home"],
    "paybill-success-screen": ["paybill-success-home"],
    "qrpay-success-screen": ["qrpay-success-home"],
    "certificate-success-screen": ["certificate-success-home"],
    "cheque-success-screen": ["cheque-success-home"],
}

FLOW_END_GUIDANCE = {
    "en": {
        "sendmoney-success-screen": "Money has been sent successfully!",
        "paybill-success-screen": "Bill payment was completed successfully!",
        "qrpay-success-screen": "Payment was completed successfully!",
        "certificate-success-screen": "Your certificate request has been received!",
        "cheque-success-screen": "Cheque book request submitted successfully!",
    },
    "ur": {
        "sendmoney-success-screen": "پیسے کامیابی سے بھیج دیے گئے!",
        "paybill-success-screen": "بل کامیابی سے ادا ہو گیا!",
        "qrpay-success-screen": "ادائیگی کامیابی سے مکمل ہو گئی!",
        "certificate-success-screen": "آپ کی درخواست موصول ہو گئی!",
        "cheque-success-screen": "درخواست کامیابی سے جمع ہو گئی!",
    }
}

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
    """LLM first (Groq cloud or Ollama); keyword fallback when unreachable."""
    try:
        return classify_intent(transcript, current_screen or "unknown-screen")
    except Exception as error:
        print(f"[intent] LLM unavailable ({type(error).__name__}) — using keyword fallback")
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
        if screen in ("home-screen", "Dashboard"):
            return ["home-balance-amount", "balance-card"]
        return NAV_HOME
    if intent == "send_money":
        if screen in ("home-screen", "Dashboard"):
            return ["home-quick-action-send", "send_money"]
        if screen in ("sendmoney-confirm-screen", "SendMoney"):
            return ["sendmoney-confirm-approve", "send-submit-btn"]
        if screen == "sendmoney-success-screen":
            return ["sendmoney-success-home"]
        return NAV_TRANSFER
    if intent == "pay_bill":
        if screen in ("home-screen", "Dashboard"):
            return ["home-quick-action-paybill", "pay_bill"]
        if screen in ("paybill-confirm-screen", "BillPayments"):
            return ["paybill-confirm-approve", "bill-submit-btn"]
        if screen == "paybill-success-screen":
            return ["paybill-success-home"]
        return NAV_BILLS
    if intent == "check_transactions":
        if screen in ("home-screen", "Dashboard"):
            return ["home-transactions-see-all"]
        if screen == "statements-screen":
            return ["statements-totals"]
        return NAV_STATEMENTS
    if intent == "view_cards":
        if screen in ("cards-screen", "Dashboard", "CardManagement"):
            return ["cards-open-card-debit-visa", "card_management"]
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
        if screen in ("home-screen", "Dashboard"):
            return ["home-quick-action-qr", "qr_pay"]
        if screen in ("qr-pay-screen", "QR"):
            return ["qrpay-simulate-scan", "qr-scan-btn"]
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
    if intent == "recipient_guidance":
        if screen in ("sendmoney-screen", "SendMoney"):
            return ["sendmoney-recipient-select"]
        return NAV_TRANSFER
    if intent == "amount_guidance":
        if screen in ("paybill-screen", "BillPayments"):
            return ["paybill-amount-input"]
        if screen in ("sendmoney-screen", "SendMoney"):
            return ["sendmoney-amount-input"]
        return NAV_TRANSFER
    if intent == "biller_guidance_gas":
        if screen in ("paybill-screen", "BillPayments"):
            return ["paybill-biller-ssgc", "paybill-biller-select"]
        return NAV_BILLS
    if intent == "biller_guidance_electricity":
        if screen in ("paybill-screen", "BillPayments"):
            return ["paybill-biller-k-electric", "paybill-biller-select"]
        return NAV_BILLS
    if intent == "biller_guidance_internet":
        if screen in ("paybill-screen", "BillPayments"):
            return ["paybill-biller-ptcl", "paybill-biller-select"]
        return NAV_BILLS
    if intent == "autonomous_action_refusal":
        if last_highlighted:
            return [last_highlighted]
        if screen in ("sendmoney-screen", "SendMoney"):
            return ["sendmoney-submit", "sendmoney-recipient-select"]
        if screen in ("paybill-screen", "BillPayments"):
            return ["paybill-submit", "paybill-biller-select"]
        return []
    return []


async def _client_send(client, message):
    try:
        if hasattr(client, "send_text"):
            await client.send_text(message)
        else:
            await client.send(message)
    except Exception as e:
        pass


async def send_highlight(target_ids, flow_guidance=None, audio_bytes=None):
    """Send AGENT_HIGHLIGHT with candidate ids, guidance text, and high-fidelity neural audio.

    The browser bridge highlights the element and plays the neural audio directly.
    """
    if isinstance(target_ids, str):
        target_ids = [target_ids]
    if not target_ids and not audio_bytes:
        print("[highlight] nothing to highlight")
        return
    if not connected_clients:
        print("[highlight] no browser connected — open the app first")
        return
    payload = {"type": "AGENT_HIGHLIGHT", "targetIds": target_ids or []}
    if flow_guidance:
        payload["flowGuidance"] = flow_guidance
    if audio_bytes:
        payload["audio"] = base64.b64encode(audio_bytes).decode("utf-8")
    message = json.dumps(payload, ensure_ascii=False)
    await asyncio.gather(*(_client_send(client, message) for client in list(connected_clients)))
    label = flow_guidance or target_ids
    print(f"[highlight] -> {label}")


def record_mic(seconds: float = 4.0) -> str:
    """Record from the default microphone; return path to a temp WAV file."""
    if not sd or not _wav:
        raise RuntimeError("sounddevice not available (cloud/headless environment)")
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
    await asyncio.gather(*(_client_send(client, message) for client in list(connected_clients)))
    print(f"[click] -> {target_id}")


def transcribe_file(path: str) -> str:
    """Transcribe audio using fast cloud STT (Groq Whisper / AssemblyAI) with local faster-whisper fallback."""
    result = transcribe_audio(path, language=_stt_language)
    if result:
        print(f"[stt] ({_stt_language}) \"{result}\"")
    else:
        print(f"[stt] ({_stt_language}) nothing intelligible")
    return result


async def handle_browser_audio(data: dict):
    """Audio recorded by the in-app mic button: transcribe via fast cloud STT, then classify."""
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
    filename = f"browser_mic{ext}"
    print(f"[mic] browser audio received ({len(raw) // 1024} KB)")
    try:
        transcript = await loop.run_in_executor(
            None, lambda: transcribe_audio(raw, filename=filename, language=_stt_language)
        )
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


def resolve_guidance(guidance_dict: dict, key: str, lang: str = "en") -> str:
    """Safely get guidance string from bilingual or flat dictionary."""
    if not key or not guidance_dict:
        return ""
    # Flat dictionary fallback
    if key in guidance_dict and isinstance(guidance_dict[key], str):
        return guidance_dict[key]
    lang_key = "ur" if lang == "ur" else "en"
    lang_map = guidance_dict.get(lang_key, {})
    if key in lang_map:
        return lang_map[key]
    # Fallback to alternate language
    alt_key = "en" if lang_key == "ur" else "ur"
    return guidance_dict.get(alt_key, {}).get(key, "")


def detect_language(text: str, default: str = "en") -> str:
    """Detect language (en or ur) from user text robustly."""
    if not text:
        return default
    # Check for Urdu / Arabic script
    if any("\u0600" <= ch <= "\u06FF" for ch in text):
        return "ur"
    # Check for Devanagari script
    if any("\u0900" <= ch <= "\u097F" for ch in text):
        return "ur"

    tokens = set(re.findall(r"\b[a-zA-Z]+\b", text.lower()))
    roman_urdu = {
        "mera", "meri", "mere", "apna", "apni", "karo", "karna", "karein", "kare",
        "bhejo", "bhejna", "paise", "paisa", "rupay", "kitna", "kitne", "hai",
        "hain", "tha", "thi", "kya", "kyun", "kaise", "ab", "aage", "agla",
        "batao", "dikhao", "sunao", "bijli", "zarurat", "karun", "chahiye", "zara"
    }
    if tokens & roman_urdu:
        return "ur"

    english_words = {
        "what", "do", "i", "next", "how", "send", "money", "check", "balance",
        "bill", "pay", "please", "can", "you", "help", "where", "should", "now",
        "proceed", "continue", "card", "cards", "transfer", "statement", "profile",
        "to", "the", "a", "an", "is", "are", "my", "account"
    }
    if tokens & english_words or len(tokens) >= 2:
        return "en"

    return default


def is_next_query(text: str) -> bool:
    """Check if utterance asks what to do next or how to proceed."""
    norm = _normalize_command(text)
    if norm in NEXT_WORDS:
        return True
    pattern = re.compile(
        r"\b(next|agla|aage|اگلا|آگے|phir|अगला|आगे|"
        r"what\s+(do\s+i|should\s+i|to|can\s+i)\s+do(\s+next|\s+now)?|"
        r"what\s+is\s+(the\s+)?next(\s+step)?|"
        r"what\s+next|"
        r"what\s+now|"
        r"where\s+(do\s+i|should\s+i|to)\s+(click|tap|press|go)|"
        r"how\s+(do\s+i|to)\s+(proceed|continue|send|pay)|"
        r"ab\s+kya|"
        r"aage\s+kya|"
        r"kya\s+karun|"
        r"help\s+me|"
        r"guide\s+me)\b",
        re.IGNORECASE
    )
    return bool(pattern.search(text))


def is_refusal_query(text: str) -> bool:
    """Check if user asks the agent to autonomously execute an action."""
    pattern = re.compile(
        r"\b(do\s+(this|it|that)\s+for\s+me|"
        r"do\s+(this|that)|"
        r"send\s+(it|money|this)?(\s+for\s+me)|"
        r"pay\s+(it|this|bill)?(\s+for\s+me)|"
        r"transfer\s+(it|this)?(\s+for\s+me)|"
        r"click\s+(it|this|the\s+button)\s+(for\s+me)?|"
        r"enter\s+(it|my|password)\s+(for\s+me)?|"
        r"can\s+you\s+(pay|send|transfer|click|do|submit)\s+(it|this)?(\s+for\s+me)?|"
        r"mere\s+liye\s+(kar|bhej|pay|transfer)|"
        r"khud\s+(kar\s+do|bhej\s+do|pay\s+kar\s+do|transfer\s+kar\s+do)|"
        r"apne\s+hath\s+se)\b",
        re.IGNORECASE
    )
    return bool(pattern.search(text))


def is_recipient_query(text: str) -> bool:
    """Check if user asks where or how to choose the recipient."""
    pattern = re.compile(
        r"\b(how\s+(should|can|do)\s+i\s+(choose|pick|find|select)\s+(my\s+)?recipient|"
        r"where\s+(can|do)\s+i\s+find\s+(my\s+)?recipient|"
        r"where\s+is\s+(the\s+|my\s+)?recipient|"
        r"who\s+am\s+i\s+sending(\s+to)?|"
        r"how\s+to\s+(choose|pick|find)\s+recipient|"
        r"recipient\s+(kahan|kaise)|"
        r"banda\s+(kahan|kaise|kisko))\b",
        re.IGNORECASE
    )
    return bool(pattern.search(text))


def is_biller_gas_query(text: str) -> bool:
    """Check if user specifically asked for gas bill / Sui Gas / SSGC."""
    pattern = re.compile(
        r"\b(sui\s*gas|ssgc|so\s+you\s+guys|sui\s+southern|gas\s+bill|guest\s+bill|gas|سوئی\s*گیس|گیس)\b",
        re.IGNORECASE
    )
    return bool(pattern.search(text))


def is_biller_electricity_query(text: str) -> bool:
    """Check if user specifically asked for electricity bill / K-Electric."""
    pattern = re.compile(
        r"\b(k-?electric|kelectric|electricity|electric\s+bill|bijli|بجلی|کے\s*الیکٹرک)\b",
        re.IGNORECASE
    )
    return bool(pattern.search(text))


def is_biller_internet_query(text: str) -> bool:
    """Check if user specifically asked for internet / PTCL."""
    pattern = re.compile(
        r"\b(ptcl|broadband|internet|wifi|پی\s*ٹی\s*سی\s*ایل|انٹرنیٹ)\b",
        re.IGNORECASE
    )
    return bool(pattern.search(text))


def is_amount_query(text: str) -> bool:
    """Check if user is asking where to enter the amount."""
    pattern = re.compile(
        r"\b(where\s+(do\s+i|can\s+i)\s+(enter|put|write|type)\s+(the\s+)?amount|"
        r"how\s+much\s+amount|how\s+to\s+enter\s+amount|"
        r"amount\s+(kahan|kaise)|paise\s+kahan\s+likh)\b",
        re.IGNORECASE
    )
    return bool(pattern.search(text))


async def _auto_advance_flow():
    """Timer callback — advance the guided flow automatically with neural voice guidance."""
    global _flow_timer
    _flow_timer = None
    if not last_intent or not current_screen:
        return
    if (last_intent, current_screen) not in GUIDED_STEPS:
        return
    target = decide_target(last_intent, current_screen)
    if not target:
        return
    lang = _stt_language or "en"
    guidance = resolve_guidance(FLOW_GUIDANCE, target[0], lang)
    audio_bytes = None
    if guidance:
        try:
            audio_bytes = await synthesize_speech(guidance, language=lang)
        except Exception as e:
            print(f"[tts] Auto-advance synthesis note: {e}")
    await send_highlight(target, flow_guidance=guidance, audio_bytes=audio_bytes)
    last_highlighted = target[0]
    schedule_flow_advance()


async def handle_utterance(text: str):
    global last_intent, _stt_language
    utterance = text.strip()
    if not utterance:
        return

    detected_lang = detect_language(utterance, default=_stt_language or "en")
    is_next = is_next_query(utterance)

    if is_refusal_query(utterance):
        reply_text = SPEECH_REPLIES.get(detected_lang, SPEECH_REPLIES["en"])["autonomous_action_refusal"]
        intent_result = {
            "intent": "autonomous_action_refusal",
            "confidence": "high (refusal)",
            "language": detected_lang,
            "reply": reply_text
        }
    elif is_biller_gas_query(utterance) and (current_screen in ("paybill-screen", "BillPayments") or "bill" in utterance.lower()):
        reply_text = SPEECH_REPLIES.get(detected_lang, SPEECH_REPLIES["en"])["biller_guidance_gas"]
        intent_result = {
            "intent": "biller_guidance_gas",
            "confidence": "high (biller_gas)",
            "language": detected_lang,
            "reply": reply_text
        }
        last_intent = "pay_bill"
    elif is_biller_electricity_query(utterance) and (current_screen in ("paybill-screen", "BillPayments") or "bill" in utterance.lower()):
        reply_text = SPEECH_REPLIES.get(detected_lang, SPEECH_REPLIES["en"])["biller_guidance_electricity"]
        intent_result = {
            "intent": "biller_guidance_electricity",
            "confidence": "high (biller_electricity)",
            "language": detected_lang,
            "reply": reply_text
        }
        last_intent = "pay_bill"
    elif is_biller_internet_query(utterance) and (current_screen in ("paybill-screen", "BillPayments") or "bill" in utterance.lower()):
        reply_text = SPEECH_REPLIES.get(detected_lang, SPEECH_REPLIES["en"])["biller_guidance_internet"]
        intent_result = {
            "intent": "biller_guidance_internet",
            "confidence": "high (biller_internet)",
            "language": detected_lang,
            "reply": reply_text
        }
        last_intent = "pay_bill"
    elif is_recipient_query(utterance):
        reply_text = SPEECH_REPLIES.get(detected_lang, SPEECH_REPLIES["en"])["recipient_guidance"]
        intent_result = {
            "intent": "recipient_guidance",
            "confidence": "high (recipient)",
            "language": detected_lang,
            "reply": reply_text
        }
        last_intent = "send_money"
    elif is_amount_query(utterance):
        reply_text = SPEECH_REPLIES.get(detected_lang, SPEECH_REPLIES["en"])["amount_guidance"]
        intent_result = {
            "intent": "amount_guidance",
            "confidence": "high (amount)",
            "language": detected_lang,
            "reply": reply_text
        }
    elif is_next:
        # User asking what to do next — recover flow context even if last_intent was lost
        active_intent = last_intent or SCREEN_TO_INTENT.get(current_screen) or "send_money"
        last_intent = active_intent
        intent_result = {
            "intent": active_intent,
            "confidence": "high (next)",
            "language": detected_lang,
            "reply": "Here is the next step." if detected_lang == "en" else "یہ اگلا قدم ہے۔"
        }
    else:
        intent_result = classify(utterance)
        # Use detected language if classifier defaulted to urdu or didn't set it
        if detected_lang == "en" and intent_result.get("language") != "en":
            intent_result["language"] = "en"
        detected_lang = intent_result.get("language", detected_lang)

        if intent_result["intent"] == "next_step":
            active_intent = last_intent or SCREEN_TO_INTENT.get(current_screen) or "send_money"
            last_intent = active_intent
            intent_result["intent"] = active_intent
        elif intent_result["intent"] != "unknown":
            last_intent = intent_result["intent"]

    intent = intent_result["intent"]
    print(f"[intent] {json.dumps(intent_result, ensure_ascii=False)}")

    if intent == "unknown":
        if detected_lang == "en":
            reply = intent_result.get("reply") or "I'm sorry, I didn't quite catch that. Would you like to check your balance, transfer funds, or pay a bill?"
        else:
            reply = intent_result.get("reply") or "معذرت، میں آپ کی بات سمجھ نہیں سکا۔ کیا آپ رقم بھیجنا یا بیلنس دیکھنا چاہتے ہیں؟"
        try:
            audio_bytes = await synthesize_speech(reply, language=detected_lang)
            await send_highlight([], flow_guidance=reply, audio_bytes=audio_bytes)
        except Exception:
            pass
        print(f"[agent] {reply}")
        return

    if not current_screen:
        print("[agent] no browser or mobile app connected yet")
        return

    target = decide_target(intent, current_screen)
    if target:
        guidance = resolve_guidance(FLOW_GUIDANCE, target[0], detected_lang)
        if not guidance and intent in NAV_GUIDANCE and (intent, current_screen) not in GUIDED_STEPS:
            guidance = resolve_guidance(NAV_GUIDANCE, intent, detected_lang)

        spoken_text = guidance or intent_result.get("reply", "")
        lang = detected_lang

        audio_bytes = None
        if spoken_text:
            try:
                audio_bytes = await synthesize_speech(spoken_text, language=lang)
            except Exception as tts_err:
                print(f"[tts] Synthesis note: {tts_err}")

        await send_highlight(target, flow_guidance=spoken_text, audio_bytes=audio_bytes)
        last_highlighted = target[0]

        if not guidance:
            if intent not in FLOW_INTENTS:
                last_intent = None
                cancel_flow_advance()
        else:
            schedule_flow_advance()
    else:
        print(f"[agent] nothing mapped for intent '{intent}' on '{current_screen}'")


async def handler(websocket):
    global current_screen, last_intent, _stt_language
    connected_clients.add(websocket)
    print(f"[+] Client connected. Total: {len(connected_clients)}")
    try:
        async for message in websocket:
            data = json.loads(message)
            if data.get("type") == "AGENT_AUDIO":
                await handle_browser_audio(data)
                continue
            if data.get("type") == "AGENT_UTTERANCE":
                text = data.get("text", "").strip()
                if text:
                    print(f"[client] utterance: '{text}'")
                    await handle_utterance(text)
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

                # End the guided flow when the user reaches a success screen
                if current_screen in FLOW_END_SCREENS:
                    if last_intent:
                        home_target = FLOW_END_HOME.get(current_screen)
                        end_guidance = resolve_guidance(FLOW_END_GUIDANCE, current_screen, _stt_language)
                        if home_target:
                            audio_bytes = None
                            if end_guidance:
                                try:
                                    audio_bytes = await synthesize_speech(end_guidance, language=_stt_language)
                                except Exception:
                                    pass
                            await send_highlight(home_target, flow_guidance=end_guidance, audio_bytes=audio_bytes)
                            last_highlighted = home_target[0]
                    last_intent = None

                # Auto-guide: if user reaches a form screen with pending intent
                if (last_intent
                        and current_screen in FORM_SCREENS
                        and (last_intent, current_screen) in GUIDED_STEPS):
                    target = decide_target(last_intent, current_screen)
                    if target:
                        guidance = resolve_guidance(FLOW_GUIDANCE, target[0], _stt_language)
                        audio_bytes = None
                        if guidance:
                            try:
                                audio_bytes = await synthesize_speech(guidance, language=_stt_language)
                            except Exception:
                                pass
                        await send_highlight(target, flow_guidance=guidance, audio_bytes=audio_bytes)
                        last_highlighted = target[0]
                        schedule_flow_advance()
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected_clients.discard(websocket)
        print(f"[-] Client disconnected. Total: {len(connected_clients)}")


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
    port = int(os.environ.get("PORT", 8765))
    host = os.environ.get("HOST", "0.0.0.0")
    async with websockets.serve(handler, host, port):
        print(f"Voice agent running on ws://{host}:{port}")
        print("Open the banking app in the browser or mobile app — connects automatically.")
        print("Use the language toggle in the UI to switch between English and Urdu.")
        if sys.stdin.isatty():
            await console()
        else:
            await asyncio.Event().wait()


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
