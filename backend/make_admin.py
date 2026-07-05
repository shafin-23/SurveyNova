import asyncio
from database import get_db

async def make_admin():
    db = await get_db()
    
    # Check if admin already exists
    existing = await db.users.find_one({"email": "admin@survey.com"})
    if existing:
        print("Admin already exists!")
        return

    admin_user = {
        'firstName': 'System', 
        'lastName': 'Admin', 
        'email': 'admin@survey.com', 
        'password': '$2b$12$xOOLW8ShpM.COvPJ3K2vS.FvQhR6x8fExYsscEpv8LekbfJuUHNn.', 
        'role': 'admin', 
        'isEmailVerified': True
    }
    
    await db.users.insert_one(admin_user)
    print("Admin successfully created! Email: admin@survey.com, Password: admin123")

if __name__ == "__main__":
    asyncio.run(make_admin())
