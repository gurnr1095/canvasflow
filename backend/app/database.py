from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv
from urllib.parse import urlparse, urlunparse
import os

load_dotenv()

_db_url = os.getenv("DATABASE_URL", "")
# Normalize scheme — asyncpg requires postgresql+asyncpg://
if _db_url.startswith("postgres://"):
    _db_url = "postgresql+asyncpg://" + _db_url[len("postgres://"):]
elif _db_url.startswith("postgresql://") and "+asyncpg" not in _db_url:
    _db_url = "postgresql+asyncpg://" + _db_url[len("postgresql://"):]

# Strip ALL query params (sslmode, channel_binding, etc.) before passing to asyncpg.
# asyncpg does not parse URL query params — SSL is passed via connect_args instead.
_parsed = urlparse(_db_url)
_needs_ssl = "sslmode=require" in (_parsed.query or "") or "neon.tech" in (_parsed.hostname or "")
_db_url = urlunparse(_parsed._replace(query=""))

_connect_args: dict = {"server_settings": {"search_path": "public"}}
if _needs_ssl:
    _connect_args["ssl"] = "require"

engine = create_async_engine(_db_url, echo=False, connect_args=_connect_args)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session