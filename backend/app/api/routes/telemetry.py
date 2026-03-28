from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_device
from app.dependencies.db import get_db
from app.models.device import Device
from app.schemas.telemetry import TelemetryPointOut
from app.services.telemetry_service import TelemetryService

router = APIRouter()


@router.get("/", response_model=list[TelemetryPointOut])
def list_my_telemetry(
    device: Device = Depends(get_current_device),
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    start: datetime | None = Query(None, description="ISO8601 lower bound (inclusive)"),
    end: datetime | None = Query(None, description="ISO8601 upper bound (inclusive)"),
    newest_first: bool = Query(
        False,
        description="If true, sort descending (latest first). Default ascending for charts.",
    ),
):
    svc = TelemetryService(db)
    return svc.list_for_device(
        device.id,
        limit=limit,
        offset=offset,
        start=start,
        end=end,
        newest_first=newest_first,
    )
