from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.core.security import get_api_key
from app.services.device_service import DeviceService


def get_current_device(
    api_key: str = Depends(get_api_key),
    db: Session = Depends(get_db),
):
    service = DeviceService(db)
    device = service.get_by_api_key(api_key)
    if not device:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    if device.status != "active":
        raise HTTPException(status_code=403, detail="Device is disabled")
    return device
