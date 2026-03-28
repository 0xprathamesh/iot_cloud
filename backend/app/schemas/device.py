from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class DeviceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    device_extra: dict[str, Any] | None = None


class DeviceUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    device_extra: dict[str, Any] | None = None


class DeviceRegisteredOut(BaseModel):
    """Returned only once at registration; includes the raw API key."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    api_key: str
    status: str
    auth_kind: str
    created_at: datetime


class DeviceOut(BaseModel):
    """Safe device profile for dashboards (no full API key)."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str | None
    device_extra: dict[str, Any] | None
    status: str
    auth_kind: str
    api_key_hint: str
    created_at: datetime
    updated_at: datetime


class DeviceSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    status: str
    auth_kind: str
    created_at: datetime


def device_to_out(device) -> DeviceOut:
    from app.core.security import api_key_hint

    return DeviceOut(
        id=device.id,
        name=device.name,
        description=device.description,
        device_extra=device.device_extra,
        status=device.status,
        auth_kind=device.auth_kind,
        api_key_hint=api_key_hint(device.api_key),
        created_at=device.created_at,
        updated_at=device.updated_at,
    )
