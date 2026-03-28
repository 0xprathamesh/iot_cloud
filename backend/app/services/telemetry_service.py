from datetime import datetime

from sqlalchemy.orm import Session

from app.models.telemetry import Telemetry


class TelemetryService:
    def __init__(self, db: Session):
        self.db = db

    def list_for_device(
        self,
        device_id: str,
        *,
        limit: int = 100,
        offset: int = 0,
        start: datetime | None = None,
        end: datetime | None = None,
        newest_first: bool = False,
    ) -> list[Telemetry]:
        q = self.db.query(Telemetry).filter(Telemetry.device_id == device_id)
        if start is not None:
            q = q.filter(Telemetry.timestamp >= start)
        if end is not None:
            q = q.filter(Telemetry.timestamp <= end)
        order_col = Telemetry.timestamp.desc() if newest_first else Telemetry.timestamp.asc()
        return q.order_by(order_col).offset(offset).limit(limit).all()
