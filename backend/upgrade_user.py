import asyncio
from database import get_db

async def upgrade():
    db = await get_db()
    res = await db.users.update_one({'email': 'shafinshadman2@gmail.com'}, {'$set': {'role': 'admin'}})
    if res.matched_count:
        print("Success! User upgraded to admin.")
    else:
        print("Error: User not found in database.")

if __name__ == "__main__":
    asyncio.run(upgrade())
