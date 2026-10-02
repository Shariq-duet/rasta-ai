"""FastAPI production server for Zenith Bank Voice Agent.

Designed for instant cloud deployment on Render, Railway, Fly.io, or Docker.
Supports:
- HTTP GET / and /health for platform health checks
- WebSocket / and /ws for React Native Mobile & Web App
- Automatic client sync and speech synthesis delivery
"""

import os
import sys
import json
import base64
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Import agent core logic
import agent
from transcription import transcribe_audio
from intent import classify_intent
from tts import synthesize_speech

app = FastAPI(title="Zenith Voice Agent Cloud API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "service": "Zenith Voice Agent",
        "active_clients": len(agent.connected_clients),
        "current_screen": agent.current_screen or "Dashboard",
    }


@app.websocket("/")
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    agent.connected_clients.add(websocket)
    print(f"[+] Client connected. Total active: {len(agent.connected_clients)}")

    try:
        while True:
            raw_text = await websocket.receive_text()
            try:
                data = json.loads(raw_text)
            except Exception:
                continue

            msg_type = data.get("type")

            if msg_type == "AGENT_SCREEN_CHANGE":
                new_screen = data.get("screen")
                agent.current_screen = new_screen
                agent.flow_position.clear()
                agent.cancel_flow_advance()
                agent.last_highlighted = None
                print(f"[screen] -> {new_screen}")

                # Check if reached completion screen
                if new_screen in agent.FLOW_END_SCREENS and agent.last_intent:
                    home_target = agent.FLOW_END_HOME.get(new_screen)
                    end_guidance = agent.FLOW_END_GUIDANCE.get(new_screen)
                    if home_target:
                        audio_bytes = None
                        if end_guidance:
                            try:
                                audio_bytes = await synthesize_speech(end_guidance, language=agent._stt_language)
                            except Exception:
                                pass
                        await agent.send_highlight([home_target], flow_guidance=end_guidance, audio_bytes=audio_bytes)
                continue

            if msg_type == "AGENT_UTTERANCE":
                text = data.get("text", "").strip()
                if text:
                    print(f"[utterance] -> '{text}'")
                    await agent.handle_utterance(text)
                continue

            if msg_type == "AGENT_AUDIO":
                await agent.handle_browser_audio(data)
                continue

            if msg_type == "AGENT_LANGUAGE":
                agent._stt_language = data.get("language", "ur")
                print(f"[lang] language set to {agent._stt_language}")
                continue

    except WebSocketDisconnect:
        agent.connected_clients.discard(websocket)
        print(f"[-] Client disconnected. Total active: {len(agent.connected_clients)}")
    except Exception as err:
        agent.connected_clients.discard(websocket)
        print(f"[-] Client error: {err}. Remaining: {len(agent.connected_clients)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8765))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Starting Zenith Voice Agent on http://{host}:{port}")
    uvicorn.run("server:app", host=host, port=port, reload=False)
