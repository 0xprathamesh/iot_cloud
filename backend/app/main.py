import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db.session import Base, engine
from app.services.mqtt_service import start_mqtt

from app.models import device, telemetry  # noqa: F401 — register models
from app.api.routes import device as device_routes
from app.api.routes import ingestion
from app.api.routes import telemetry as telemetry_routes

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    try:
        start_mqtt()
    except Exception:
        logger.exception("MQTT startup failed (non-fatal)")
    yield


settings = get_settings()
app = FastAPI(title="IoT Cloud Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings["cors_origins"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(device_routes.router, prefix="/devices", tags=["devices"])
app.include_router(ingestion.router, prefix="/ingest", tags=["ingest"])
app.include_router(telemetry_routes.router, prefix="/telemetry", tags=["telemetry"])


@app.get("/")
def root():
    return {"message": "Backend is running", "docs": "/docs"}
