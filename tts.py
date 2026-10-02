"""High-fidelity Neural Speech Synthesis (ElevenLabs with automatic Microsoft Neural edge-tts fallback).
Produces natural, human-sounding conversational audio in Urdu and English.
"""
import asyncio
import io
import os
import requests
import edge_tts
from ai_config import get_elevenlabs_key, get_elevenlabs_voice_id

# In-memory audio cache for instant replay of common guidance phrases
_AUDIO_CACHE = {}

# Microsoft Neural Voice options (completely free, ultra-realistic)
NEURAL_VOICES = {
    "ur": {
        "female": "ur-PK-UzmaNeural",
        "male": "ur-PK-AsadNeural",
    },
    "en": {
        "female": "en-US-AvaNeural",
        "male": "en-US-AndrewNeural",
    }
}

# ElevenLabs default voices
ELEVENLABS_VOICES = {
    "female": "EXAVITQu4vr4xnSDxMaL",  # Bella
    "male": "pNInz6obpgDQGcFmaJgB",    # Adam
}


async def synthesize_with_edgetts(text: str, voice: str) -> bytes:
    """Synthesize speech using Microsoft Neural edge-tts (free, no API key)."""
    communicate = edge_tts.Communicate(text, voice)
    audio_data = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]
    if not audio_data:
        raise ValueError("edge-tts returned empty audio data")
    return audio_data


def synthesize_with_elevenlabs(text: str, voice_gender: str = "female") -> bytes:
    """Synthesize speech using ElevenLabs API."""
    key = get_elevenlabs_key()
    if not key:
        raise ValueError("ELEVENLABS_API_KEY is not configured")

    voice_id = get_elevenlabs_voice_id() or ELEVENLABS_VOICES.get(voice_gender, "pNInz6obpgDQGcFmaJgB")

    headers = {
        "xi-api-key": key,
        "Content-Type": "application/json",
    }
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }
    response = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
        headers=headers,
        json=payload,
        timeout=15,
    )
    if response.status_code >= 400:
        raise RuntimeError(f"ElevenLabs error ({response.status_code}): {response.text[:120]}")
    return response.content


async def synthesize_speech(text: str, language: str = "ur", voice_gender: str = "female") -> bytes:
    """Universal speech synthesizer:
    1. Primary: ElevenLabs (ultra-expressive human voice)
    2. Fallback: Microsoft Neural edge-tts (free, warm authentic Urdu/English)
    """
    clean_text = text.strip()
    if not clean_text:
        return b""

    cache_key = (clean_text, language, voice_gender)
    if cache_key in _AUDIO_CACHE:
        return _AUDIO_CACHE[cache_key]

    audio_bytes = None

    # Tier 1: ElevenLabs (if configured)
    if get_elevenlabs_key():
        try:
            loop = asyncio.get_event_loop()
            audio_bytes = await loop.run_in_executor(
                None, lambda: synthesize_with_elevenlabs(clean_text, voice_gender=voice_gender)
            )
            print(f"[tts] ElevenLabs synthesized ({len(audio_bytes)} bytes)")
        except Exception as e:
            print(f"[tts] ElevenLabs notice: {e}. Falling back to Microsoft Neural...")

    # Tier 2: Microsoft Neural edge-tts
    if not audio_bytes:
        lang_key = "en" if language.lower().startswith("en") else "ur"
        voice = NEURAL_VOICES[lang_key].get(voice_gender, NEURAL_VOICES[lang_key]["female"])
        try:
            audio_bytes = await synthesize_with_edgetts(clean_text, voice)
            print(f"[tts] Microsoft Neural ({voice}) synthesized ({len(audio_bytes)} bytes)")
        except Exception as e:
            print(f"[tts] edge-tts error: {e}")
            raise

    if audio_bytes:
        _AUDIO_CACHE[cache_key] = audio_bytes
        # Keep cache bounded to 100 items
        if len(_AUDIO_CACHE) > 100:
            _AUDIO_CACHE.pop(next(iter(_AUDIO_CACHE)))

    return audio_bytes
