def test_ingest_and_telemetry(client):
    reg = client.post("/devices/", json={"name": "T1"}).json()
    key = reg["api_key"]

    ing = client.post(
        "/ingest/",
        headers={"X-API-Key": key},
        json={"temperature": 22.5, "humidity": 40.0},
    )
    assert ing.status_code == 200
    row = ing.json()
    assert row["data"]["temperature"] == 22.5
    assert "id" in row

    tel = client.get("/telemetry/", headers={"X-API-Key": key})
    assert tel.status_code == 200
    points = tel.json()
    assert len(points) == 1
    assert points[0]["data"]["humidity"] == 40.0


def test_ingest_invalid_key(client):
    r = client.post(
        "/ingest/",
        headers={"X-API-Key": "00000000-0000-0000-0000-000000000000"},
        json={"temperature": 1, "humidity": 1},
    )
    assert r.status_code == 401
