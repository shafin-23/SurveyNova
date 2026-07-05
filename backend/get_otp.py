import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def get_latest_otp():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
    db = client.surveyai
    
    user = await db.users.find_one(sort=[("_id", -1)])
    if user:
        email_otp = user.get("emailOtp")
        phone_otp = user.get("phoneOtp")
        print(f"Latest User: {user.get('firstName')} {user.get('lastName')}")
        if email_otp:
            print(f"Email OTP: {email_otp}")
        if phone_otp:
            print(f"Phone OTP: {phone_otp}")
    else:
        print("No users found.")

asyncio.run(get_latest_otp())
