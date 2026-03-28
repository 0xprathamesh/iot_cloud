from app.models.telemetry import Telemetry
from app.schemas.telemetry import TelemetryIn


class IngestionService:
    def __init__(self, db):
        self.db = db

    def ingest(self, device, data):
        payload_dict = TelemetryIn.model_validate(data).model_dump()
        telemetry = Telemetry(
            device_id=device.id,
            data=payload_dict
        )
        self.db.add(telemetry)
        self.db.commit()
        self.db.refresh(telemetry)
        return telemetry