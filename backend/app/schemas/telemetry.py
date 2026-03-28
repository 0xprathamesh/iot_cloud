from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class TelemetryIn(BaseModel):
    temperature: float
    humidity: float


class TelemetryPointOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    device_id: str
    data: dict[str, Any]
    timestamp: datetime
