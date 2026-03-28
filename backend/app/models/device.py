import uuid

from sqlalchemy import Column, DateTime, JSON, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.session import Base


class Device(Base):
    """
    Registered device. `auth_kind` reserves future auth modes (e.g. certificate) without schema churn.
    """

    __tablename__ = "devices"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, default="Unnamed device")
    description = Column(Text, nullable=True)
    device_extra = Column(JSON, nullable=True)

    api_key = Column(String(64), unique=True, index=True, nullable=False)
    status = Column(String(32), nullable=False, default="active", index=True)
    auth_kind = Column(String(32), nullable=False, default="api_key")

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    telemetry_rows = relationship(
        "Telemetry",
        back_populates="device",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
