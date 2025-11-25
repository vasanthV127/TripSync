"""
Fix student bus assignments - update old Bus1-Bus5 to new AP bus numbers
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)
db = client.tripsync

# Mapping of old bus names to new bus numbers
BUS_MAPPING = {
    "Bus1": "AP29A1234",
    "Bus2": "AP29B5678",
    "Bus3": "AP29C9012",
    "Bus4": "AP29D3456",
    "Bus5": "AP29E7890"
}

async def fix_bus_assignments():
    """Update all students with old bus names to new bus numbers"""
    
    print("🔧 Fixing student bus assignments...")
    
    total_updated = 0
    
    for old_bus, new_bus in BUS_MAPPING.items():
        # Find students with old bus name
        students_cursor = db.users.find({"assignedBus": old_bus, "role": "student"})
        students = [doc async for doc in students_cursor]
        
        if students:
            print(f"\n📍 Found {len(students)} students assigned to {old_bus}")
            print(f"   Updating to {new_bus}...")
            
            # Update all students
            result = await db.users.update_many(
                {"assignedBus": old_bus, "role": "student"},
                {"$set": {"assignedBus": new_bus}}
            )
            
            total_updated += result.modified_count
            print(f"   ✅ Updated {result.modified_count} students")
    
    print("\n" + "="*60)
    print(f"🎉 Bus assignment fix complete!")
    print(f"   Total students updated: {total_updated}")
    print("="*60)
    
    # Verify the fix
    print("\n📊 Verification:")
    for old_bus in BUS_MAPPING.keys():
        count = await db.users.count_documents({"assignedBus": old_bus, "role": "student"})
        if count > 0:
            print(f"   ⚠️  Still {count} students with {old_bus}")
        else:
            print(f"   ✅ No students with {old_bus}")

if __name__ == "__main__":
    asyncio.run(fix_bus_assignments())
