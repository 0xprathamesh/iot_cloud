from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_device
from app.dependencies.db import get_db
from app.schemas.device import (
    DeviceCreate,
    DeviceListOut,
    DeviceOut,
    DeviceRegisteredOut,
    DeviceSummaryOut,
    DeviceUpdate,
    device_to_out,
)
from app.services.device_service import DeviceService

router = APIRouter()


@router.post("/", response_model=DeviceRegisteredOut)
def register_device(body: DeviceCreate, db: Session = Depends(get_db)):
    service = DeviceService(db)
    device = service.create_device(body)
    return device


@router.get("/me", response_model=DeviceOut)
def get_my_device(device=Depends(get_current_device)):
    return device_to_out(device)


@router.patch("/me", response_model=DeviceOut)
def update_my_device(
    body: DeviceUpdate,
    device=Depends(get_current_device),
    db: Session = Depends(get_db),
):
    service = DeviceService(db)
    updated = service.update_device(device, body)
    return device_to_out(updated)


@router.get("/", response_model=DeviceListOut)
def list_devices(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    service = DeviceService(db)
    total = service.count_devices()
    rows = service.list_devices(skip=skip, limit=limit)
    return DeviceListOut(items=rows, total=total)
