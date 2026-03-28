import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

_engine_kwargs = {
    "pool_pre_ping": True,
    "pool_recycle": 1800,
    "echo": os.getenv("DEBUG", "false").lower() == "true",
}
_connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    _connect_args["check_same_thread"] = False
    if ":memory:" in DATABASE_URL:
        _engine_kwargs["poolclass"] = StaticPool


_kw = dict(_engine_kwargs)
if _connect_args:
    _kw["connect_args"] = _connect_args
engine = create_engine(DATABASE_URL, **_kw)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()

