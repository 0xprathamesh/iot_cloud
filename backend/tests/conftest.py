import os

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["MQTT_ENABLED"] = "false"

import pytest
from fastapi.testclient import TestClient

from app.config import get_settings
from app.db.session import Base, engine
from app.main import app

get_settings.cache_clear()


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
