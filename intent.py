import requests
import json

INTENT = [
    "check_balance", "send_money", "check_transactions", "pay_bill",
    "view_cards", "view_analytics", "find_branch", "view_notifications",
    "view_statements", "view_profile", "qr_pay",
    "request_certificate", "request_cheque_book", "stop_cheque", "manage_card",
    "unknown",
]

def classify_intent(transcript:str ,current_screen :str)->dict:

     system_prompt = f"""You are an intent classifier for a banking voice assistant.
Given a user's spoken request (Urdu, Hindi-script Urdu, or English) and the screen
they're on, output ONLY a JSON object.

Valid intents: {INTENT}
Current screen: {current_screen}

Examples:
User: "mera balance kitna hai" -> {{"intent": "check_balance", "confidence": "high"}}
User: "میرا بیلنس چیک کرنا ہے" -> {{"intent": "check_balance", "confidence": "high"}}
User: "I want to send money to Ahmed" -> {{"intent": "send_money", "confidence": "high"}}
User: "مجھے پیسے بھیجنے ہیں" -> {{"intent": "send_money", "confidence": "high"}}
User: "مجھے بجلی کا بل جمع کرنا ہے" -> {{"intent": "pay_bill", "confidence": "high"}}
User: "I need to pay my electricity bill" -> {{"intent": "pay_bill", "confidence": "high"}}
User: "مجھے بل بنانا ہے بجلی کا" -> {{"intent": "pay_bill", "confidence": "high"}}
User: "show me my cards" -> {{"intent": "view_cards", "confidence": "high"}}
User: "کارڈز دکھاؤ" -> {{"intent": "view_cards", "confidence": "high"}}
User: "where did my money go this month" -> {{"intent": "view_analytics", "confidence": "high"}}
User: "میرا خرچ کہاں گیا" -> {{"intent": "view_analytics", "confidence": "high"}}
User: "nearest ATM" -> {{"intent": "find_branch", "confidence": "high"}}
User: "قریبی اے ٹی ایم" -> {{"intent": "find_branch", "confidence": "high"}}
User: "any notifications" -> {{"intent": "view_notifications", "confidence": "high"}}
User: "show my statement" -> {{"intent": "view_statements", "confidence": "high"}}
User: "open profile" -> {{"intent": "view_profile", "confidence": "high"}}
User: "scan a QR code" -> {{"intent": "qr_pay", "confidence": "high"}}
User: "I need a balance certificate" -> {{"intent": "request_certificate", "confidence": "high"}}
User: "مجھے سرٹیفکیٹ چاہیے" -> {{"intent": "request_certificate", "confidence": "high"}}
User: "order a cheque book" -> {{"intent": "request_cheque_book", "confidence": "high"}}
User: "چیک بک منگوانی ہے" -> {{"intent": "request_cheque_book", "confidence": "high"}}
User: "stop a cheque" -> {{"intent": "stop_cheque", "confidence": "high"}}
User: "چیک روکنا ہے" -> {{"intent": "stop_cheque", "confidence": "high"}}
User: "freeze my card" -> {{"intent": "manage_card", "confidence": "high"}}
User: "کارڈ منجمد کرو" -> {{"intent": "manage_card", "confidence": "high"}}
User: "aaj mausam kaisa hai" -> {{"intent": "unknown", "confidence": "high"}}
User: "آج آپ کا کیا حالات ہیں" -> {{"intent": "unknown", "confidence": "high"}}

Output format (JSON only, no explanation):
{{"intent": "<one of the valid intents>", "confidence": "<high|medium|low>"}}
If unclear, use "unknown".
"""
     response = requests.post(
        "http://localhost:11434/api/chat",
        json={
            "model": "qwen2.5:3b-instruct",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": transcript}
            ],
            "stream": False,
            "format": "json"  # forces valid JSON output
        },
        timeout=120,  # first CPU inference can be slow while the model loads
    )
     result = json.loads(response.json()["message"]["content"])

    # Never trust the model's output blindly — validate against the real intent set
     if result.get("intent") not in INTENT:
         result = {"intent": "unknown", "confidence": "low"}

     return result
    


if __name__ == "__main__":
    # Test with your actual transcript from earlier
    transcript = "آج آپ کا کیا حالات ہیں؟"
    result = classify_intent(transcript, current_screen="home-screen")
    print(result)