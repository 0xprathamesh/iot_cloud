<div align="center">
  <br />
  <p><strong>Ingestify</strong> · Minimal IoT Cloud Platform with Secure Device Access</p>
  <p align="center">FastAPI + Postgres + Next.js · REST ingest · optional MQTT subscriber</p>
  <br />

  <div>
    <img src="https://img.shields.io/badge/-Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /><br/>
    <img src="https://img.shields.io/badge/-Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /><br/>
    <img src="https://img.shields.io/badge/MQTT-optional-660066?style=for-the-badge" alt="MQTT" />
    <img src="https://img.shields.io/badge/-pytest-0A9EDC?style=for-the-badge&logo=pytest&logoColor=white" alt="pytest" />
  </div>

  <br />

  <p align="center"><img width="1470" height="840" alt="Screenshot 2026-03-28 at 9 39 54 PM" src="https://github.com/user-attachments/assets/9705ae8e-6e98-449b-abdc-910f251c6972" />
</p>
</div>

## Table of contents

1. [What this is](#what-this-is)
2. [Stack](#stack)
3. [What you can do](#what-you-can-do)
4. [Quick start](#quick-start)
5. [Try ingest (HTTP)](#try-ingest-http)
6. [Try MQTT](#try-mqtt)
7. [Tests](#tests)

## What this is

A minimal IoT-style backend with device registration (API keys), telemetry storage, a public device list for demos, and a Next.js dashboard.
## Stack

| Part | Description |
|------|--------|
| **Backend** | FastAPI, SQLAlchemy, Postgres (or SQLite if you point `DATABASE_URL` there) |
| **Frontend** | Next.js 16, React 19, Tailwind 4, SWR, Recharts |
| **MQTT** | Optional `paho-mqtt` client; disabled if `MQTT_BROKER` is empty or `MQTT_ENABLED=false` |

## What you can do

- Register a device → get a UUID API key once.
- Send temperature / humidity over **HTTP** (`POST /ingest/`) or **MQTT** (JSON with `api_key` + `data`).
- Browse **GET /devices/** (paginated `{ items, total }`) and open the UI at `/devices` to verify a key against a selected card.
- Open **Swagger** at `http://127.0.0.1:8000/docs`.

## Quick start

**Prereqs:** Python 3.11+ (3.14 works if your deps install), Node 20+, a running Postgres (or use SQLite URL), optional MQTT broker.

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` at least:

- `DATABASE_URL` — Postgres DSN or e.g. `sqlite:///./iot.db`
- `CORS_ORIGINS` — include `http://localhost:3000` for the Next app

Start API:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Optional demo data (creates ~12 devices with random readings; re-run replaces only rows tagged as seed):

```bash
python scripts/seed_db.py
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Set `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000` in `.env.local` if the API isn’t on that host.

```bash
npm run dev
```

UI: [http://localhost:3000](http://localhost:3000) · API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## Try ingest (HTTP)

Replace `YOUR_KEY` with a key from `POST /devices/` or the Register page.

```bash
curl -s -X POST http://127.0.0.1:8000/ingest/ \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"temperature":22.5,"humidity":48}'
```

Then `GET /telemetry/` with the same header, or use the dashboard after **Connect** saves the key in the browser.

## Try MQTT

Set in `backend/.env`:

```env
MQTT_ENABLED=true
MQTT_BROKER=your.broker.host
MQTT_PORT=8883
MQTT_USERNAME=...
MQTT_PASSWORD=...
MQTT_TOPIC=iot/devices/data
```

Restart the API. Publish JSON like:

```json
{
  "api_key": "YOUR_KEY",
  "data": { "temperature": 21.0, "humidity": 55 }
}
```

If the key is wrong or the device is disabled, the message is dropped (check server logs).

## Tests

Backend (uses in-memory SQLite via `tests/conftest.py`; no live DB needed):

```bash
cd backend
source venv/bin/activate
pytest
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

---

If something fails, check `DATABASE_URL`, CORS, and that only one process owns port `8000` / `3000`.
