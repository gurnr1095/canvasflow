from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv
import os

load_dotenv()

_db_url = os.getenv("DATABASE_URL", "")
# Render provides postgres:// but asyncpg requires postgresql+asyncpg://
if _db_url.startswith("postgres://"):
    _db_url = "postgresql+asyncpg://" + _db_url[len("postgres://"):]
elif _db_url.startswith("postgresql://") and "+asyncpg" not in _db_url:
    _db_url = "postgresql+asyncpg://" + _db_url[len("postgresql://"):]
# Neon (and other managed Postgres) require SSL; asyncpg uses connect_args for this
_connect_args = {"ssl": "require"} if "neon.tech" in _db_url or "sslmode=require" in _db_url else {}
# Strip sslmode from URL — asyncpg doesn't parse it, uses connect_args instead
_db_url = _db_url.replace("?sslmode=require", "").replace("&sslmode=require", "")
engine = create_async_engine(_db_url, echo=False, connect_args=_connect_args)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session