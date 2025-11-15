"""
One-time script to remove all seed/test data from database
Run this to clean up Student1, Student2, Driver1, etc.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def cleanup_seed_data():
    MONGO_URI = os.getenv("MONGO_URI")
    MONGO_DB = os.getenv("MONGO_DB", "tripsync")
    
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[MONGO_DB]
    
    print("🧹 Starting database cleanup...")
    
    # Remove seed students (Student1-Student25)
    result = await db.users.delete_many({
        "role": "student",
        "email": {"$regex": "^student[0-9]+@example\\.com$"}
    })
    print(f"✅ Removed {result.deleted_count} seed students")
    
    # Remove seed drivers (Driver1-Driver5)
    result = await db.users.delete_many({
        "role": "driver",
        "email": {"$regex": "^driver[0-9]+@example\\.com$"}
    })
    print(f"✅ Removed {result.deleted_count} seed drivers")
    
    # Remove seed parents
    result = await db.users.delete_many({
        "role": "parent",
        "email": {"$regex": "^parent[0-9]+@example\\.com$"}
    })
    print(f"✅ Removed {result.deleted_count} seed parents")
    
    # Remove seed buses (Bus1-Bus5)
    result = await db.buses.delete_many({
        "number": {"$regex": "^Bus[0-9]+$"}
    })
    print(f"✅ Removed {result.deleted_count} seed buses")
    
    # Optionally remove seed routes (uncomment if needed)
    # result = await db.routes.delete_many({})
    # print(f"✅ Removed {result.deleted_count} seed routes")
    
    print("🎉 Database cleanup complete!")
    print("ℹ️  You can now add your own data via the admin dashboard")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(cleanup_seed_data())
