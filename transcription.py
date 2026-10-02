"""Audio transcription engine supporting fast Cloud STT (Groq Whisper / AssemblyAI)
with graceful local fallback to faster-whisper.
"""
import io
import os
import requests
from ai_config import get_groq_key, get_assemblyai_key

_whisper_model = None


def transcribe_with_groq(audio_bytes: bytes, filename: str = "audio.wav", language: str = None) -> str:
    """Ultra-fast speech-to-text using Groq's whisper-large-v3-turbo (~300ms latency)."""
    groq_key = get_groq_key()
    if not groq_key:
        raise ValueError("GROQ_API_KEY is not configured.")

    headers = {"Authorization": f"Bearer {groq_key}"}
    files = {"file": (filename, audio_bytes, "audio/octet-stream")}
    data = {"model": "whisper-large-v3-turbo"}

    # Map language codes if provided (e.g. 'ur' for Urdu, 'en' for English)
    if language and language != "auto":
        data["language"] = language

    response = requests.post(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        headers=headers,
        files=files,
        data=data,
        timeout=15,
    )
    response.raise_for_status()
    result = response.json()
    return result.get("text", "").strip()


def transcribe_with_assemblyai(audio_bytes: bytes) -> str:
    """Transcription using AssemblyAI REST API."""
    aai_key = get_assemblyai_key()
    if not aai_key:
        raise ValueError("ASSEMBLYAI_API_KEY is not configured.")

    # 1. Upload audio to AssemblyAI
    upload_headers = {"authorization": aai_key}
    upload_res = requests.post(
        "https://api.assemblyai.com/v2/upload",
        headers=upload_headers,
        data=audio_bytes,
        timeout=20,
    )
    upload_res.raise_for_status()
    upload_url = upload_res.json()["upload_url"]

    # 2. Request transcription
    transcript_res = requests.post(
        "https://api.assemblyai.com/v2/transcript",
        headers={"authorization": aai_key, "content-type": "application/json"},
        json={"audio_url": upload_url, "language_detection": True},
        timeout=20,
    )
    transcript_res.raise_for_status()
    transcript_id = transcript_res.json()["id"]

    # 3. Poll for result (capped at 10s for responsiveness)
    import time
    for _ in range(10):
        time.sleep(1)
        poll_res = requests.get(
            f"https://api.assemblyai.com/v2/transcript/{transcript_id}",
            headers=upload_headers,
            timeout=10,
        )
        data = poll_res.json()
        if data.get("status") == "completed":
            return data.get("text", "").strip()
        if data.get("status") == "error":
            raise RuntimeError(f"AssemblyAI error: {data.get('error')}")

    raise TimeoutError("AssemblyAI polling timed out.")


def transcribe_with_local_whisper(audio_input, language: str = None) -> str:
    """Offline fallback using faster-whisper CPU model."""
    global _whisper_model
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        raise RuntimeError("faster-whisper is not installed for local offline fallback.")

    if _whisper_model is None:
        print("[stt] Loading local faster-whisper model (first run may download weights)...")
        _whisper_model = WhisperModel("medium", device="cpu", compute_type="int8")

    segments, _ = _whisper_model.transcribe(audio_input, language=language)
    return " ".join(seg.text.strip() for seg in segments if seg.text.strip()).strip()


def transcribe_audio(audio_input, filename: str = "audio.wav", language: str = None) -> str:
    """Universal transcription function:
    1. Primary: Groq Whisper (blazing fast, high accuracy on Urdu/English)
    2. Secondary: AssemblyAI (if configured)
    3. Fallback: Local faster-whisper
    """
    # Prepare raw bytes
    if isinstance(audio_input, bytes):
        raw_bytes = audio_input
    elif hasattr(audio_input, "read"):
        raw_bytes = audio_input.read()
    elif isinstance(audio_input, str) and os.path.isfile(audio_input):
        filename = os.path.basename(audio_input)
        with open(audio_input, "rb") as f:
            raw_bytes = f.read()
    else:
        raise ValueError(f"Unsupported audio input type: {type(audio_input)}")

    # Tier 1: Groq Whisper
    if get_groq_key():
        try:
            text = transcribe_with_groq(raw_bytes, filename=filename, language=language)
            if text:
                return text
        except Exception as e:
            print(f"[stt] Groq transcription notice: {e}. Trying fallback...")

    # Tier 2: AssemblyAI
    if get_assemblyai_key():
        try:
            text = transcribe_with_assemblyai(raw_bytes)
            if text:
                return text
        except Exception as e:
            print(f"[stt] AssemblyAI notice: {e}. Trying local fallback...")

    # Tier 3: Local faster-whisper
    return transcribe_with_local_whisper(audio_input, language=language)
