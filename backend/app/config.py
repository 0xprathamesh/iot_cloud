import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


@lru_cache
def get_settings():
    """Central env-based settings. Extend with new keys as the platform grows (e.g. mTLS paths)."""
    cors_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,*")
    cors_origins = [o.strip() for o in cors_raw.split(",") if o.strip()]

    return {
        "cors_origins": cors_origins,
        "mqtt_broker": os.getenv("MQTT_BROKER", ""),
        "mqtt_port": int(os.getenv("MQTT_PORT", "8883")),
        "mqtt_username": os.getenv("MQTT_USERNAME", ""),
        "mqtt_password": os.getenv("MQTT_PASSWORD", ""),
        "mqtt_topic": os.getenv("MQTT_TOPIC", "iot/devices/data"),
        "mqtt_enabled": os.getenv("MQTT_ENABLED", "true").lower() in ("1", "true", "yes"),
    }
