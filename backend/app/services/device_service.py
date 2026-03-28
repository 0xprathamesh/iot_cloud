import uuid
from sqlalchemy.orm import Session

from app.models.device import Device
from app.schemas.device import DeviceCreate, DeviceUpdate


class DeviceService:
    def __init__(self, db: Session):
        self.db = db

    def create_device(self, body: DeviceCreate) -> Device:
        api_key = str(uuid.uuid4())
        device = Device(
            name=body.name,
            description=body.description,
            device_extra=body.device_extra,
            api_key=api_key,
            status="active",
            auth_kind="api_key",
        )
        self.db.add(device)
        self.db.commit()
        self.db.refresh(device)
        return device

    def get_by_api_key(self, api_key: str) -> Device | None:
        return self.db.query(Device).filter(Device.api_key == api_key).first()

    def get_by_id(self, device_id: str) -> Device | None:
        return self.db.query(Device).filter(Device.id == device_id).first()

    def list_devices(self, skip: int = 0, limit: int = 100) -> list[Device]:
        return (
            self.db.query(Device)
            .order_by(Device.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_device(self, device: Device, body: DeviceUpdate) -> Device:
        if body.name is not None:
            device.name = body.name
        if body.description is not None:
            device.description = body.description
        if body.device_extra is not None:
            device.device_extra = body.device_extra
        self.db.commit()
        self.db.refresh(device)
        return device
