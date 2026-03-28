import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Index, JSON, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.session import Base


class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    device_id = Column(
        String,
        ForeignKey("devices.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    data = Column(JSON, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    device = relationship("Device", back_populates="telemetry_rows")

    __table_args__ = (
        Index("ix_telemetry_device_id_timestamp", "device_id", "timestamp"),
    )
