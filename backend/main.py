import time
import asyncio
import logging
from typing import Dict, Any, Optional, Set
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("SkillBridgeBackend")

app = FastAPI(
    title="Skill Bridge Real-Time Industrial Telemetry API",
    version="1.0.0"
)

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas for validation
class MachineSubPayload(BaseModel):
    state: str = Field(default="RUNNING", description="IDLE, STARTING, RUNNING, STOPPING, ABNORMAL")
    score: int = Field(default=100, ge=0, le=100)
    status: str = Field(default="NORMAL", description="NORMAL, DEVIATE, ALERT, OFFLINE")

class Mpu6050Payload(BaseModel):
    rms: float = Field(default=0.0)
    peak: float = Field(default=0.0)
    events: int = Field(default=0)

class Ds18b20Payload(BaseModel):
    temperature: float = Field(default=25.0)

class DigitalVibrationPayload(BaseModel):
    state: str = Field(default="QUIET", description="QUIET, ACTIVE")

class TelemetryPayload(BaseModel):
    machine_id: str = Field(default="M01")
    device_id: str = Field(default="ESP32-M01")
    timestamp: Optional[float] = None
    machine: MachineSubPayload
    mpu6050: Mpu6050Payload
    ds18b20: Ds18b20Payload
    digital_vibration: DigitalVibrationPayload

# In-memory store for M01 state and WebSocket clients
latest_telemetry: Dict[str, Any] = {
    "machine_id": "M01",
    "device_id": "ESP32-M01",
    "timestamp": time.time(),
    "last_seen": time.time(),
    "is_online": True,
    "machine": {
        "state": "RUNNING",
        "score": 98,
        "status": "NORMAL"
    },
    "mpu6050": {
        "rms": 0.042,
        "peak": 0.185,
        "events": 2
    },
    "ds18b20": {
        "temperature": 32.4
    },
    "digital_vibration": {
        "state": "QUIET"
    }
}

active_connections: Set[WebSocket] = set()

async def broadcast_telemetry(payload: dict):
    """Broadcast JSON payload to all connected WebSocket clients."""
    if not active_connections:
        return
    disconnected = set()
    for ws in list(active_connections):
        try:
            await ws.send_json(payload)
        except Exception:
            disconnected.add(ws)
    for ws in disconnected:
        active_connections.discard(ws)

async def check_offline_timeout():
    """Background task to detect ESP32 timeouts (OFFLINE state)."""
    while True:
        await asyncio.sleep(2.0)
        now = time.time()
        last_seen = latest_telemetry.get("last_seen", now)
        timeout_seconds = 6.0

        if now - last_seen > timeout_seconds and latest_telemetry.get("is_online", True):
            latest_telemetry["is_online"] = False
            latest_telemetry["machine"]["status"] = "OFFLINE"
            logger.warning("[M01] ESP32 timeout — Machine marked OFFLINE")
            await broadcast_telemetry(latest_telemetry)

@app.on_event("startup")
async def startup_event():
    logger.info("Skill Bridge FastAPI Backend starting...")
    asyncio.create_task(check_offline_timeout())

@app.get("/")
async def root():
    return {
        "system": "SKILL BRIDGE Real-Time Backend",
        "status": "ONLINE",
        "machine_m01_online": latest_telemetry.get("is_online", False),
        "last_seen_seconds_ago": round(time.time() - latest_telemetry.get("last_seen", time.time()), 1)
    }

@app.post("/api/machines/{machine_id}/data")
async def receive_machine_data(machine_id: str, payload: TelemetryPayload):
    """
    HTTP POST endpoint for ESP32 hardware to submit real-time JSON telemetry.
    """
    if machine_id.upper() != "M01":
        raise HTTPException(status_code=400, detail="Currently only real hardware Machine M01 is configured.")

    now = time.time()
    was_offline = not latest_telemetry.get("is_online", True)

    payload_dict = payload.dict()
    payload_dict["timestamp"] = payload.timestamp or now
    payload_dict["last_seen"] = now
    payload_dict["is_online"] = True
    payload_dict["machine_id"] = "M01"

    # Update in-memory state
    latest_telemetry.clear()
    latest_telemetry.update(payload_dict)

    if was_offline:
        logger.info("[M01] Machine back online — ESP32 reconnected!")
    else:
        logger.info(f"[M01] Telemetry received from {payload.device_id} | State: {payload.machine.state} | Temp: {payload.ds18b20.temperature}°C | RMS: {payload.mpu6050.rms}")

    # Broadcast to WebSocket clients
    await broadcast_telemetry(latest_telemetry)

    return {"status": "ok", "machine_id": "M01", "timestamp": now}

@app.get("/api/machines/{machine_id}/data")
async def get_machine_data(machine_id: str):
    """
    HTTP GET endpoint to fetch current latest state for M01.
    """
    if machine_id.upper() != "M01":
        raise HTTPException(status_code=404, detail="Machine not found")
    return latest_telemetry

@app.websocket("/ws/machines/{machine_id}")
async def websocket_endpoint(websocket: WebSocket, machine_id: str):
    """
    WebSocket endpoint for frontend clients to stream live updates.
    """
    await websocket.accept()
    active_connections.add(websocket)
    logger.info(f"[M01] Frontend WebSocket client connected. Active clients: {len(active_connections)}")

    # Immediately send current state on connect
    try:
        await websocket.send_json(latest_telemetry)
        while True:
            # Keep connection alive
            msg = await websocket.receive_text()
            if msg == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        active_connections.discard(websocket)
        logger.info(f"[M01] Frontend WebSocket client disconnected. Remaining: {len(active_connections)}")
    except Exception as e:
        active_connections.discard(websocket)
        logger.error(f"[M01] WebSocket error: {e}")
