"""Configuration loader for AI providers (Nebius Token Factory, NVIDIA Nemotron, Groq, AssemblyAI, ElevenLabs, local fallbacks)."""
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


def get_nebius_key() -> str:
    """Nebius Token Factory API key for Nebius x NVIDIA Hackathon."""
    return configured_key("NEBIUS_API_KEY")


def get_nebius_base_url() -> str:
    """Nebius Token Factory OpenAI-compatible API base URL."""
    return os.getenv("NEBIUS_BASE_URL", "https://api.tokenfactory.us-central1.nebius.com/v1/").strip() or "https://api.tokenfactory.us-central1.nebius.com/v1/"


def get_nebius_model() -> str:
    """NVIDIA open-source model running on Nebius Token Factory (default: Nemotron 3 Super 120B)."""
    return os.getenv("NEBIUS_MODEL", "nvidia/nemotron-3-super-120b-a12b").strip() or "nvidia/nemotron-3-super-120b-a12b"


def is_nebius_available() -> bool:
    """Check if Nebius Token Factory credentials are configured."""
    return bool(get_nebius_key())


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
