import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

async def get_db():
    # Instantiate client per-request so it binds to the correct Flask async event loop
    client = AsyncIOMotorClient(MONGODB_URI)
    return client.surveyai
