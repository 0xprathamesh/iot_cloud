import json
import logging
import ssl

import paho.mqtt.client as mqtt

from app.config import get_settings
from app.db.session import SessionLocal
from app.services.device_service import DeviceService
from app.services.ingestion_service import IngestionService

logger = logging.getLogger(__name__)


def on_connect(client, userdata, flags, rc):
    topic = userdata["topic"]
    logger.info("Connected to MQTT broker, rc=%s", rc)
    client.subscribe(topic)


def on_message(client, userdata, msg):
    db = SessionLocal()
    try:
        payload = json.loads(msg.payload.decode())
        api_key = payload.get("api_key")
        data = payload.get("data")

        device_service = DeviceService(db)
        device = device_service.get_by_api_key(api_key)

        if not device:
            logger.warning("MQTT: unknown API key")
            return
        if device.status != "active":
            logger.warning("MQTT: device disabled id=%s", device.id)
            return

        ingestion_service = IngestionService(db)
        ingestion_service.ingest(device, data)
        logger.debug("MQTT: stored telemetry for device id=%s", device.id)
    except Exception as e:
        logger.exception("MQTT error: %s", e)
    finally:
        db.close()


def start_mqtt():
    settings = get_settings()
    if not settings["mqtt_enabled"] or not settings["mqtt_broker"]:
        logger.info("MQTT disabled or MQTT_BROKER not set; skipping MQTT client")
        return

    client = mqtt.Client(userdata={"topic": settings["mqtt_topic"]})
    client.username_pw_set(settings["mqtt_username"], settings["mqtt_password"])
    client.tls_set(cert_reqs=ssl.CERT_REQUIRED)

    client.on_connect = on_connect
    client.on_message = on_message

    client.connect(settings["mqtt_broker"], settings["mqtt_port"])
    client.loop_start()
