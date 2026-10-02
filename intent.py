import json
import requests
from ai_config import get_groq_key, get_groq_model

INTENT = [
    "check_balance", "send_money", "check_transactions", "pay_bill",
    "view_cards", "view_analytics", "find_branch", "view_notifications",
    "view_statements", "view_profile", "qr_pay",
    "request_certificate", "request_cheque_book", "stop_cheque", "manage_card",
    "unknown",
]

# Casual, friendly, everyday conversational Pakistani banking responses (No Allama Iqbal Urdu!)
POLITE_REPLIES = {
    "ur": {
        "check_balance": "جی بالکل، آپ کا بیلنس یہ سامنے اسکرین پر دکھا دیا ہے۔",
        "send_money": "پیسے بھیجنے کے لیے، سامنے 'Send Money' بٹن پر ٹیپ کریں اور بندہ سلیکٹ کر لیں۔",
        "pay_bill": "بل جمع کروانے کے لیے، 'Pay Bill' والے آپشن پر کلک کریں اور اپنا بل چن لیں۔",
        "check_transactions": "یہ لیں، آپ کی حالیہ تمام ٹرانزیکشنز کی لسٹ سامنے آگئی ہے۔",
        "view_cards": "آپ کے تمام کارڈز اسکرین پر کھل گئے ہیں، یہاں سے آپ انہیں دیکھ سکتے ہیں۔",
        "view_analytics": "اس مہینے آپ کے خرچے کہاں کہاں ہوئے، یہ رہا اس کا پورا چارٹ۔",
        "find_branch": "قریبی اے ٹی ایم اور برانچز میں نے نقشے پر دکھا دی ہیں۔",
        "view_notifications": "آپ کی تمام نئی نوٹیفکیشنز اور الرٹس یہاں موجود ہیں۔",
        "view_statements": "آپ کی اکاؤنٹ اسٹیٹمنٹ اسکرین پر تیار ہے، آپ اسے دیکھ سکتے ہیں۔",
        "view_profile": "آپ کی پروفائل اور سیٹنگز کا پیج کھل گیا ہے۔",
        "qr_pay": "کیو آر اسکین کرنے کے لیے کیمرہ کھل گیا ہے، کوڈ اسکین کر لیں۔",
        "request_certificate": "بیلنس سرٹیفکیٹ منگوانے کے لیے یہاں سے آپشن سلیکٹ کر لیں۔",
        "request_cheque_book": "نئی چیک بک آرڈر کرنے کے لیے اکاؤنٹ اور پتوں کی تعداد چن لیں۔",
        "stop_cheque": "چیک کی پیمنٹ روکنے کے لیے اپنا چیک نمبر یہاں لکھ دیں۔",
        "manage_card": "کارڈ فریز کرنے، پن دیکھنے یا بلاک کرنے کی سیٹنگز سامنے ہیں۔",
        "unknown": "معاف کیجیے گا، میں سمجھ نہیں پایا۔ کیا آپ پیسے بھیجنا چاہتے ہیں یا بیلنس چیک کرنا چاہتے ہیں؟",
    },
    "en": {
        "check_balance": "Certainly! I've highlighted your account balance right on the home dashboard.",
        "send_money": "Sure! Tap on the highlighted 'Send Money' button to start your transfer.",
        "pay_bill": "To pay your bill, click on the highlighted 'Pay Bill' option and select your biller.",
        "check_transactions": "Here is the list of your recent transactions.",
        "view_cards": "Here are your active debit and credit cards on the screen.",
        "view_analytics": "Here is an overview of your spending and budget insights.",
        "find_branch": "Showing the nearest ATMs and branches around you on the map.",
        "view_notifications": "Here are your latest account alerts and notifications.",
        "view_statements": "Your account statements are ready for you to review.",
        "view_profile": "Opening your account profile and settings.",
        "qr_pay": "Ready to scan! Use the camera scanner or pick a merchant to pay.",
        "request_certificate": "Here you can apply for your balance or maintenance certificate.",
        "request_cheque_book": "Select your account and leaf count to order a new cheque book.",
        "stop_cheque": "Please enter your cheque number to issue a stop payment request.",
        "manage_card": "Here are your card controls to freeze your card, view PIN, or set limits.",
        "unknown": "I'm sorry, I didn't quite catch that. Would you like to check your balance, pay a bill, or transfer funds?",
    }
}

SYSTEM_PROMPT = f"""You are a warm, casual, and friendly voice banking assistant for Zenith Bank (in Pakistan).
Given the user's spoken request (Urdu script, Roman Urdu, Hindi, or English) and the screen
they are currently on, output ONLY a JSON object.

Valid intents:
{json.dumps(INTENT)}

Output format (strictly valid JSON only, no markdown, no explanation):
{{
  "intent": "<one of the valid intents>",
  "confidence": "<high|medium|low>",
  "language": "ur|en",
  "reply": "<friendly, everyday casual 1-2 sentence spoken reply guiding the user. Speak like a real Pakistani assistant on Easypaisa or Nayapay: use simple, everyday Urdu words like 'بٹن دبائیں', 'ٹیپ کریں', 'بیلنس دیکھ لیں', 'سلیکٹ کریں'. NEVER use poetic, literary, or archaic 'Allama Iqbal' Urdu words like 'ملاحظہ فرمائیں', 'نمایاں', 'باضابطہ', 'حاضر ہے۔'. If user spoke English, reply in friendly casual English.>"
}}

Rules:
- Be robust to casual phrasing, slang, and code-switching (e.g. 'mera balance kitna hai', 'send 5000 to Ali').
- Always provide a conversational 'reply' that explains what action was taken or guides the user where to tap.
- Keep sentences short, natural, and friendly.
- If unclear or unrelated to banking features, set intent to 'unknown'.
"""


def classify_with_groq(transcript: str, current_screen: str) -> dict:
    """Ultra-fast cloud LLM classification via Groq with casual conversational response generation."""
    groq_key = get_groq_key()
    if not groq_key:
        raise ValueError("GROQ_API_KEY not configured")

    model = get_groq_model()
    prompt = f"{SYSTEM_PROMPT}\nCurrent screen: {current_screen}"

    headers = {
        "Authorization": f"Bearer {groq_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": transcript},
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.3,
        "max_tokens": 500,
    }

    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=10,
    )
    if response.status_code >= 400:
        raise RuntimeError(f"Groq API error ({response.status_code}): {response.text}")
    data = response.json()
    content = data["choices"][0]["message"]["content"]
    result = json.loads(content)
    return result


def classify_with_ollama(transcript: str, current_screen: str) -> dict:
    """Local SLM fallback via Ollama (qwen2.5:3b-instruct)."""
    prompt = f"{SYSTEM_PROMPT}\nCurrent screen: {current_screen}"
    response = requests.post(
        "http://localhost:11434/api/chat",
        json={
            "model": "qwen2.5:3b-instruct",
            "messages": [
                {"role": "system", "content": prompt},
                {"role": "user", "content": transcript},
            ],
            "stream": False,
            "format": "json",
        },
        timeout=30,
    )
    response.raise_for_status()
    return json.loads(response.json()["message"]["content"])


def classify_intent(transcript: str, current_screen: str) -> dict:
    """Classify user intent using Groq cloud LLM first, falling back to local Ollama.
    
    Returns a dict with 'intent', 'confidence', 'language', and 'reply'.
    """
    result = None

    # Tier 1: Groq Cloud LLM (fast, conversational, high precision)
    if get_groq_key():
        try:
            result = classify_with_groq(transcript, current_screen)
        except Exception as groq_err:
            print(f"[intent] Groq inference notice: {groq_err}. Trying Ollama fallback...")

    # Tier 2: Ollama Local SLM
    if not result:
        try:
            result = classify_with_ollama(transcript, current_screen)
        except Exception as ollama_err:
            raise RuntimeError(f"All LLM classifiers unavailable (Ollama: {ollama_err})")

    # Validate intent
    intent = result.get("intent") if isinstance(result, dict) else "unknown"
    if intent not in INTENT:
        intent = "unknown"
        result["intent"] = intent
        result["confidence"] = "low"

    # Detect language if not provided
    lang = result.get("language", "ur") if isinstance(result, dict) else "ur"
    if lang not in ("ur", "en"):
        lang = "ur"
    result["language"] = lang

    # Ensure there is always a natural, conversational reply
    reply = result.get("reply", "").strip() if isinstance(result, dict) else ""
    if not reply or len(reply.split()) <= 2:
        lang_dict = POLITE_REPLIES.get(lang, POLITE_REPLIES["ur"])
        result["reply"] = lang_dict.get(intent, lang_dict["unknown"])

    return result


if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    test_cases = [
        ("mera balance kitna hai, Zara batana", "home-screen"),
        ("I need to transfer 5000 to Ali", "home-screen"),
        ("bijli ka bill pay karna hai", "home-screen"),
    ]
    for text, screen in test_cases:
        res = classify_intent(text, screen)
        print(f"'{text}'\n-> Intent: {res['intent']} | Lang: {res.get('language')}\n-> Reply: {res['reply']}\n")