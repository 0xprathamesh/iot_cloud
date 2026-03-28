from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_device
from app.dependencies.db import get_db
from app.models.device import Device
from app.schemas.telemetry import TelemetryIn, TelemetryPointOut
from app.services.ingestion_service import IngestionService

router = APIRouter()


@router.post("/", response_model=TelemetryPointOut)
def ingest(
    payload: TelemetryIn,
    device: Device = Depends(get_current_device),
    db: Session = Depends(get_db),
):
    ingestion_service = IngestionService(db)
    return ingestion_service.ingest(device, payload)
