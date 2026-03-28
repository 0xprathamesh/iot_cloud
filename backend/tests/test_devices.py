def test_register_device(client):
    r = client.post(
        "/devices/",
        json={"name": "Living room", "description": "Sensor A", "device_extra": {"zone": "home"}},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["name"] == "Living room"
    assert "api_key" in body and len(body["api_key"]) > 10
    assert body["status"] == "active"
    assert body["auth_kind"] == "api_key"


def test_device_me_and_list(client):
    reg = client.post("/devices/", json={"name": "Office"}).json()
    key = reg["api_key"]

    me = client.get("/devices/me", headers={"X-API-Key": key})
    assert me.status_code == 200
    assert me.json()["name"] == "Office"
    assert me.json()["api_key_hint"].startswith("...")

    listed = client.get("/devices/")
    assert listed.status_code == 200
    body = listed.json()
    assert body["total"] >= 1
    assert len(body["items"]) >= 1
    assert body["items"][0]["name"] == "Office"


def test_patch_device(client):
    reg = client.post("/devices/", json={"name": "Temp"}).json()
    key = reg["api_key"]

    r = client.patch(
        "/devices/me",
        headers={"X-API-Key": key},
        json={"name": "Temp sensor", "device_extra": {"fw": "1.0.0"}},
    )
    assert r.status_code == 200
    assert r.json()["name"] == "Temp sensor"
    assert r.json()["device_extra"]["fw"] == "1.0.0"


def test_missing_api_key(client):
    r = client.get("/devices/me")
    assert r.status_code == 401
