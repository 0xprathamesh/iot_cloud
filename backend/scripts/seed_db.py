"""
Populate the database with demo devices and telemetry (uses DATABASE_URL from .env).

Run from the backend directory:
  python scripts/seed_db.py

Re-running removes only rows marked with device_extra["_seed"] == true, then inserts a fresh batch.
"""

from __future__ import annotations

import argparse
import random
import sys
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path


_BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from app.db.session import Base, SessionLocal, engine
from app.models.device import Device
from app.models.telemetry import Telemetry

SEED_MARKER = "_seed"


def _sync_legacy_schema() -> None:
    """
    Existing DBs may predate newer columns; create_all does not ALTER tables.
    Add missing columns so seed + ORM work against old Postgres/SQLite DBs.
    """
    from sqlalchemy import inspect, text

    dialect = engine.dialect.name
    insp = inspect(engine)
    if "devices" not in insp.get_table_names():
        return

    device_cols = {c["name"] for c in insp.get_columns("devices")}

    if dialect == "postgresql":
        stmts = [
            "ALTER TABLE devices ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT 'Unnamed device'",
            "ALTER TABLE devices ADD COLUMN IF NOT EXISTS description TEXT",
            "ALTER TABLE devices ADD COLUMN IF NOT EXISTS device_extra JSONB",
            "ALTER TABLE devices ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'active'",
            "ALTER TABLE devices ADD COLUMN IF NOT EXISTS auth_kind VARCHAR(32) NOT NULL DEFAULT 'api_key'",
            (
                "ALTER TABLE devices ADD COLUMN IF NOT EXISTS created_at "
                "TIMESTAMPTZ NOT NULL DEFAULT NOW()"
            ),
            (
                "ALTER TABLE devices ADD COLUMN IF NOT EXISTS updated_at "
                "TIMESTAMPTZ NOT NULL DEFAULT NOW()"
            ),
        ]
        with engine.begin() as conn:
            for s in stmts:
                conn.execute(text(s))
        if "telemetry" in insp.get_table_names():
            conn_fks = insp.get_foreign_keys("telemetry")
            has_device_fk = any(
                fk.get("referred_table") == "devices" for fk in conn_fks
            )
            if not has_device_fk:
                with engine.begin() as conn:
                    conn.execute(
                        text(
                            "ALTER TABLE telemetry ADD CONSTRAINT fk_telemetry_device_id "
                            "FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE"
                        )
                    )
            with engine.begin() as conn:
                conn.execute(
                    text(
                        "CREATE INDEX IF NOT EXISTS ix_telemetry_device_id_timestamp "
                        "ON telemetry (device_id, timestamp)"
                    )
                )
        return

    if dialect == "sqlite":
        alters: list[str] = []
        if "name" not in device_cols:
            alters.append(
                "ALTER TABLE devices ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT 'Unnamed device'"
            )
        if "description" not in device_cols:
            alters.append("ALTER TABLE devices ADD COLUMN description TEXT")
        if "device_extra" not in device_cols:
            alters.append("ALTER TABLE devices ADD COLUMN device_extra JSON")
        if "status" not in device_cols:
            alters.append(
                "ALTER TABLE devices ADD COLUMN status VARCHAR(32) NOT NULL DEFAULT 'active'"
            )
        if "auth_kind" not in device_cols:
            alters.append(
                "ALTER TABLE devices ADD COLUMN auth_kind VARCHAR(32) NOT NULL DEFAULT 'api_key'"
            )
        if "created_at" not in device_cols:
            alters.append(
                "ALTER TABLE devices ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"
            )
        if "updated_at" not in device_cols:
            alters.append(
                "ALTER TABLE devices ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"
            )
        if alters:
            with engine.begin() as conn:
                for s in alters:
                    conn.execute(text(s))


def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Seed devices and telemetry for local demos.")
    p.add_argument("--devices", type=int, default=12, help="Number of devices (default: 12)")
    p.add_argument(
        "--points-min",
        type=int,
        default=15,
        help="Minimum telemetry points per device (default: 15)",
    )
    p.add_argument(
        "--points-max",
        type=int,
        default=20,
        help="Maximum telemetry points per device (default: 20)",
    )
    p.add_argument(
        "--days",
        type=int,
        default=7,
        help="Spread timestamps over the last N days (default: 7)",
    )
    p.add_argument(
        "--no-replace",
        action="store_true",
        help="Do not delete previous seeded devices; append a new batch (names get a suffix).",
    )
    return p.parse_args()


def _delete_previous_seed(session) -> None:
    devices = session.query(Device).all()
    to_delete = [
        d
        for d in devices
        if isinstance(d.device_extra, dict) and d.device_extra.get(SEED_MARKER) is True
    ]
    for d in to_delete:
        session.delete(d)
    if to_delete:
        session.commit()
        print(f"Removed {len(to_delete)} previous seeded device(s).")


def _random_telemetry_row(device_id: str, ts: datetime) -> Telemetry:
    return Telemetry(
        id=str(uuid.uuid4()),
        device_id=device_id,
        data={
            "temperature": round(random.uniform(18.0, 32.0), 1),
            "humidity": round(random.uniform(35.0, 85.0), 1),
        },
        timestamp=ts,
    )


def main() -> None:
    args = _parse_args()
    if args.points_min > args.points_max:
        print("error: --points-min must be <= --points-max", file=sys.stderr)
        sys.exit(1)
    if args.devices < 1:
        print("error: --devices must be >= 1", file=sys.stderr)
        sys.exit(1)

    Base.metadata.create_all(bind=engine)
    _sync_legacy_schema()

    session = SessionLocal()
    try:
        if not args.no_replace:
            _delete_previous_seed(session)

        suffix = f" ({uuid.uuid4().hex[:6]})" if args.no_replace else ""
        now = datetime.now(timezone.utc)
        start = now - timedelta(days=args.days)

        created = []
        for i in range(1, args.devices + 1):
            device_id = str(uuid.uuid4())
            api_key = str(uuid.uuid4())
            labels = ["Lab", "Warehouse", "Greenhouse", "Office", "Home", "Factory", "Garage"]
            name = f"Demo {random.choice(labels)} {i:02d}{suffix}"
            device = Device(
                id=device_id,
                name=name,
                description=f"Seeded device #{i} for dashboard charts.",
                device_extra={
                    SEED_MARKER: True,
                    "zone": random.choice(["A", "B", "C", "north", "south"]),
                    "kind": random.choice(["sensor", "gateway"]),
                },
                api_key=api_key,
                status="active",
                auth_kind="api_key",
            )
            session.add(device)
            session.flush()

            n_points = random.randint(args.points_min, args.points_max)
            for _ in range(n_points):
                delta = random.random() * (now - start).total_seconds()
                ts = start + timedelta(seconds=delta)
                session.add(_random_telemetry_row(device_id, ts))

            created.append((name, api_key, n_points))

        session.commit()

        print(f"Seeded {len(created)} devices on DATABASE_URL (see .env).")
        for name, key, n in created:
            print(f"  • {name}: {n} points, API key {key}")
        print("\nExample:")
        print(f'  curl -s -H "X-API-Key: <key>" http://127.0.0.1:8000/telemetry/?newest_first=true | head')
    finally:
        session.close()


if __name__ == "__main__":
    main()
