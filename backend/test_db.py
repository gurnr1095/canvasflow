import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
import os
from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv()

async def test():
    try:
        engine = create_async_engine(os.getenv('DATABASE_URL'))
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT * FROM boards LIMIT 1;"))
            print("Query successful:", result.fetchall())
    except Exception as e:
        print(f"Failed: {e}")

asyncio.run(test())
