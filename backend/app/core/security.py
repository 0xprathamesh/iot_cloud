from fastapi import Header, HTTPException


def get_api_key(x_api_key: str | None = Header(None)):
    if not x_api_key:
        raise HTTPException(status_code=401, detail="Missing API Key")
    return x_api_key


def api_key_hint(api_key: str) -> str:
    if len(api_key) <= 8:
        return "****"
    return f"...{api_key[-8:]}"
