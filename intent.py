import json
import requests
from ai_config import get_groq_key, get_groq_model

INTENT = [
    "check_balance", "send_money", "check_transactions", "pay_bill",
    "view_cards", "view_analytics", "find_branch", "view_notifications",
    "view_statements", "view_profile", "qr_pay",
    "request_certificate", "request_cheque_book", "stop_cheque", "manage_card",
    "next_step",
    "recipient_guidance",
    "amount_guidance",
    "biller_guidance_gas",
    "biller_guidance_electricity",
    "biller_guidance_internet",
    "autonomous_action_refusal",
    "cancel_or_back",
    "repeat_guidance",
    "greeting_and_about",
    "emergency_card_freeze",
    "human_support_helpline",
    "polite_closing",
    "security_inquiry",
    "out_of_domain",
    "add_beneficiary_guidance",
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
        "next_step": "اگلا قدم اٹھانے کے لیے، میں نے اگلا آپشن اسکرین پر ہائی لائٹ کر دیا ہے۔",
        "recipient_guidance": "یہاں سے آپ اپنا وصول کنندہ چن سکتے ہیں۔ اس باکس پر ٹیپ کریں اور اپنی لسٹ میں سے بندہ سلیکٹ کر لیں۔",
        "amount_guidance": "یہاں رقم والے خانے میں جتنی رقم ادا کرنی ہے وہ لکھیں اور پھر نیکسٹ دبائیں۔",
        "biller_guidance_gas": "گیس کے بل کے لیے، سوئی سدرن گیس کمپنی لسٹ میں دوسرے نمبر پر موجود ہے، نہ کہ پہلے یا تیسرے پر۔ اس پر ٹیپ کریں۔",
        "biller_guidance_electricity": "بجلی کے بل کے لیے، کے الیکٹرک لسٹ میں پہلے نمبر پر ہے۔ اس پر ٹیپ کریں۔",
        "biller_guidance_internet": "انٹرنیٹ کے بل کے لیے، پی ٹی سی ایل براڈ بینڈ لسٹ میں تیسرے نمبر پر ہے۔ اس پر کلک کریں۔",
        "autonomous_action_refusal": "آپ کے اکاؤنٹ کی سیکیورٹی کے لیے، مجھے خود ٹرانزیکشن کرنے یا آپ کی جگہ کلک کرنے کی اجازت نہیں ہے۔ میں آپ کی رہنمائی کر سکتا ہوں، برائے مہربانی اسکرین پر ہائی لائٹ کیے گئے بٹن کو خود دبائیں۔",
        "cancel_or_back": "ٹھیک ہے، عمل منسوخ کر دیا گیا ہے۔ میں آپ کو واپس ہوم ڈیش بورڈ پر لے جا رہا ہوں۔",
        "repeat_guidance": "میں دوبارہ بتا دیتا ہوں: اسکرین پر ہائی لائٹ کیے گئے آپشن پر ٹیپ کریں۔",
        "greeting_and_about": "السلام علیکم! میں راستہ اے آئی ہوں، آپ کا وائس بینکنگ اسسٹنٹ۔ میں پیسے بھیجنے، بل جمع کروانے، کارڈ سنبھالنے اور بیلنس چیک کرنے میں آپ کی مدد کر سکتا ہوں۔ فرمائیے کیا کروں؟",
        "emergency_card_freeze": "پریشان نہ ہوں، میں نے کارڈ بلاک اور فریز کا آپشن اسکرین پر ہائی لائٹ کر دیا ہے۔ فوری طور پر کارڈ فریز کرنے کے لیے بٹن دبائیں۔",
        "human_support_helpline": "بینک ہیلپ لائن 111-000-123 چوبیس گھنٹے دستیاب ہے۔ میں نے سپورٹ اور پروفائل پیج اسکرین پر کھول دیا ہے۔",
        "polite_closing": "بہت شکریہ! اگر آپ کو کسی اور چیز میں مدد درکار ہو تو ضرور بتائیے گا۔",
        "security_inquiry": "آپ کے تحفظ کے لیے، راستہ اے آئی یا بینک کبھی آپ کا پن یا پاس ورڈ نہیں مانگتا۔ ہر ٹرانزیکشن کے لیے آپ کی بائیو میٹرک یا او ٹی پی تصدیق لازمی ہے۔",
        "out_of_domain": "میں آپ کا راستہ بینکنگ اسسٹنٹ ہوں۔ میں پیسے بھیجنے، بل جمع کروانے، کارڈ سنبھالنے اور بیلنس چیک کرنے میں آپ کی مدد کر سکتا ہوں۔ بتائیں کیا کروں؟",
        "add_beneficiary_guidance": "نیا وصول کنندہ شامل کرنے کے لیے، ہائی لائٹ کیے گئے بٹن پر ٹیپ کریں اور اکاؤنٹ کی تفصیلات درج کریں۔",
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
        "next_step": "Here is the next step. Please follow the highlighted area on your screen.",
        "recipient_guidance": "Here is where you choose your recipient. Tap on this field to select a saved contact or tap 'Add new'.",
        "amount_guidance": "Enter the amount you wish to transfer right here in the amount field, then tap Next.",
        "biller_guidance_gas": "For your gas bill, Sui Southern Gas Company is the second option in the list, not the first or third. Tap it to proceed.",
        "biller_guidance_electricity": "For electricity, K-Electric is the first option on the list. Tap it to pay your electricity bill.",
        "biller_guidance_internet": "For your internet bill, PTCL Broadband is the third option in the list. Tap it to pay.",
        "autonomous_action_refusal": "For your security and privacy, I cannot execute transactions or enter information on your behalf. I am your guide — please tap the highlighted button to confirm it yourself.",
        "cancel_or_back": "Understood, cancelling the action and taking you back to your home dashboard.",
        "repeat_guidance": "Let me repeat that: please follow the highlighted option shown on your screen.",
        "greeting_and_about": "Hello! I am Rasta AI, your voice banking assistant. I can guide you through sending money, paying bills, checking your balance, and managing your cards. How can I help you today?",
        "emergency_card_freeze": "Don't worry, I have highlighted the card freeze toggle right here. Tap it immediately to freeze your card and protect your funds.",
        "human_support_helpline": "Zenith 24/7 Helpline is 111-000-123. I have opened the support and profile page on your screen.",
        "polite_closing": "You're very welcome! Let me know if you need assistance with anything else.",
        "security_inquiry": "For your security, Zenith Bank and Rasta AI never have access to your PIN or password. All transfers require your personal biometric or OTP confirmation.",
        "out_of_domain": "I am your Zenith banking assistant. While I cannot check the weather or browse the web, I can help you send money, pay bills, check your balance, or manage cards.",
        "add_beneficiary_guidance": "To add a new beneficiary, tap the highlighted option, enter their bank details, and save them for instant transfers.",
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
  "reply": "<friendly, everyday casual 1-2 sentence spoken reply guiding the user. If the user spoke English, you MUST reply in fluent, natural English with 'language': 'en'. If the user spoke Urdu or Roman Urdu, reply in simple casual everyday Urdu with 'language': 'ur'.>"
}}

Rules:
- NEXT / CONTINUATION: If user asks what to do next ('what do I do next?', 'what should I do now?', 'where do I click?', 'ab kya karna hai?'), classify as 'next_step'.
- RECIPIENT HELP: If user asks where or how to choose/find recipient ('how should I choose recipient?', 'where can I find recipient?', 'banda kahan hai?'), classify as 'recipient_guidance'.
- AMOUNT HELP: If user asks where to enter amount ('where do I enter amount?', 'amount kahan likhoon?'), classify as 'amount_guidance'.
- SPECIFIC BILLERS:
  * Gas bill / Sui Gas / SSGC: classify as 'biller_guidance_gas'.
  * Electricity / K-Electric / Bijli: classify as 'biller_guidance_electricity'.
  * Internet / PTCL / Broadband: classify as 'biller_guidance_internet'.
- AUTONOMOUS ACTION REFUSAL: If user asks the AI to execute an action for them ('send it for me', 'do this for me', 'pay this for me', 'click the button for me', 'mere liye transfer kar do', 'khud kar do'), classify as 'autonomous_action_refusal'.
- CANCEL / GO BACK: If user asks to cancel, go back, stop, or go home ('cancel this', 'go back', 'wapas jao', 'roko'), classify as 'cancel_or_back'.
- REPEAT: If user asks to repeat ('repeat that', 'what did you say?', 'dobara bolo', 'samajh nahi aayi'), classify as 'repeat_guidance'.
- GREETING / ABOUT: If user greets or asks who you are ('hello', 'hi', 'who are you', 'what can you do', 'suno', 'assalam-o-alaikum'), classify as 'greeting_and_about'.
- LOST / EMERGENCY CARD: If user says they lost their card or card was stolen ('lost my card', 'card chori ho gaya', 'block my card immediately'), classify as 'emergency_card_freeze'.
- HUMAN SUPPORT: If user asks for helpline or human agent ('talk to human', 'helpline', 'representative', 'numainda'), classify as 'human_support_helpline'.
- POLITE CLOSING: If user says thank you or bye ('thank you', 'thanks', 'shukriya', 'bye', 'allah hafiz'), classify as 'polite_closing'.
- SECURITY / PIN: If user asks for password/PIN or security ('what is my pin', 'mera password kya hai', 'is it safe'), classify as 'security_inquiry'.
- OUT OF DOMAIN: If user asks unrelated queries ('weather', 'pizza', 'who is prime minister', 'joke'), classify as 'out_of_domain'.
- ADD BENEFICIARY: If user asks to add new contact/payee ('add beneficiary', 'naya banda add karna', 'new payee'), classify as 'add_beneficiary_guidance'.
- Language Mirroring: If the input is in English, reply in friendly English and set "language": "en". If the input is Urdu or Roman Urdu, reply in Urdu and set "language": "ur".
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