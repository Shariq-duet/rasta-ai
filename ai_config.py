"""Configuration loader for AI providers (Groq, AssemblyAI, ElevenLabs, local fallbacks)."""
import os
from dotenv import load_dotenv

# Load variables from .env file if present
load_dotenv()


def configured_key(name: str) -> str:
    """Retrieve and validate an API key from environment."""
    value = os.getenv(name, "").strip()
    if not value or value.lower().startswith(("your_", "<your", "not-configured")):
        return ""
    return value


def get_groq_key() -> str:
    return configured_key("GROQ_API_KEY")


def get_groq_model() -> str:
    return os.getenv("GROQ_MODEL", "openai/gpt-oss-20b").strip() or "openai/gpt-oss-20b"


def get_assemblyai_key() -> str:
    return configured_key("ASSEMBLYAI_API_KEY")


def get_elevenlabs_key() -> str:
    return configured_key("ELEVENLABS_API_KEY")


def get_elevenlabs_voice_id() -> str:
    # Default to Adam (pNInz6obpgDQGcFmaJgB) or Bella (EXAVITQu4vr4xnSDxMaL)
    return os.getenv("ELEVENLABS_VOICE_ID", "pNInz6obpgDQGcFmaJgB").strip() or "pNInz6obpgDQGcFmaJgB"


def is_groq_available() -> bool:
    return bool(get_groq_key())
