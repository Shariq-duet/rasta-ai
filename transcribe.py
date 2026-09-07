# pyrefly: ignore [missing-import]
from faster_whisper import WhisperModel

model = WhisperModel("medium", device="cpu",compute_type='int8')
segments , info =model.transcribe("audio2.ogg",language=None)

# print(info)
# print(segments)

print(f"Detected language: {info.language} (confidence: {info.language_probability:.2f})")
for segment in segments:
    print(f"[{segment.start:.2f}s -> {segment.end:.2f}s] {segment.text}")