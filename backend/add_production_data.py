"""
Add production data: 25 students, 5 drivers, 5 buses, 25 parents across 5 routes
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.security import hash_password
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)
db = client.tripsync

# Student names (diverse Indian names)
STUDENT_NAMES = [
    "Aarav Kumar", "Vivaan Sharma", "Aditya Patel", "Vihaan Reddy", "Arjun Singh",
    "Sai Kiran", "Reyansh Gupta", "Ayaan Khan", "Krishna Rao", "Ishaan Verma",
    "Shaurya Nair", "Atharv Joshi", "Pranav Iyer", "Dhruv Mehta", "Kabir Malhotra",
    "Advait Desai", "Yash Agarwal", "Arnav Chopra", "Rohan Bansal", "Ved Tiwari",
    "Ananya Das", "Diya Pillai", "Isha Kulkarni", "Navya Srinivasan", "Priya Menon"
]

# Driver names
DRIVER_NAMES = [
    "Rajesh Kumar", "Suresh Babu", "Ramesh Rao", "Venkat Reddy", "Prakash Singh"
]

# Parent names (corresponding to students)
PARENT_NAMES = [
    "Ramesh Kumar", "Suresh Sharma", "Mahesh Patel", "Naresh Reddy", "Dinesh Singh",
    "Venkatesh Kiran", "Mukesh Gupta", "Rakesh Khan", "Ganesh Rao", "Umesh Verma",
    "Lokesh Nair", "Paresh Joshi", "Kamlesh Iyer", "Hitesh Mehta", "Nilesh Malhotra",
    "Yogesh Desai", "Manish Agarwal", "Ashish Chopra", "Pankaj Bansal", "Anil Tiwari",
    "Sunita Das", "Priya Pillai", "Kavita Kulkarni", "Lakshmi Srinivasan", "Anjali Menon"
]

# Routes
ROUTES = [
    "Vijayawada to VIT AP",
    "Amaravati to VIT AP",
    "Guntur to VIT AP",
    "Eluru to VIT AP",
    "Mandadam to VIT AP"
]

# Bus numbers (AP prefix)
BUS_NUMBERS = ["AP29A1234", "AP29B5678", "AP29C9012", "AP29D3456", "AP29E7890"]

# Boarding points for each route
ROUTE_BOARDING_POINTS = {
    "Vijayawada to VIT AP": ["Vijayawada", "Mangalagiri", "Undavalli", "Tadepalli"],
    "Amaravati to VIT AP": ["Amaravati", "Thullur"],
    "Guntur to VIT AP": ["Guntur", "Tenali", "Vemuru"],
    "Eluru to VIT AP": ["Eluru", "Hanuman Junction", "Nuzvid", "Vijayawada"],
    "Mandadam to VIT AP": ["Mandadam", "Thullur"]
}

# Initial bus locations (starting points)
BUS_LOCATIONS = [
    {"lat": 16.5062, "long": 80.6480},  # Vijayawada
    {"lat": 16.5130, "long": 80.5160},  # Amaravati
    {"lat": 16.3067, "long": 80.4365},  # Guntur
    {"lat": 16.7107, "long": 81.0952},  # Eluru
    {"lat": 16.5100, "long": 80.5700}   # Mandadam
]

async def add_production_data():
    """Add 25 students, 5 drivers, 5 buses, 25 parents"""
    
    print("🚀 Starting production data addition...")
    
    # 1. Create 5 drivers
    driver_ids = []
    for idx, driver_name in enumerate(DRIVER_NAMES):
        email = f"{driver_name.lower().replace(' ', '.')}@tripsync.com"
        
        # Check if driver exists
        existing = await db.users.find_one({"email": email})
        if existing:
            print(f"⚠️  Driver {driver_name} already exists")
            driver_ids.append(str(existing["_id"]))
            continue
        
        driver = {
            "name": driver_name,
            "email": email,
            "password": hash_password("driver123"),  # Default password
            "role": "driver",
            "phone": f"9{idx:09d}"  # Generate phone number
        }
        
        result = await db.users.insert_one(driver)
        driver_ids.append(str(result.inserted_id))
        print(f"✅ Created driver: {driver_name} ({email})")
    
    # 2. Create 5 buses and assign drivers
    for idx, bus_number in enumerate(BUS_NUMBERS):
        # Check if bus exists
        existing = await db.buses.find_one({"number": bus_number})
        if existing:
            print(f"⚠️  Bus {bus_number} already exists")
            continue
        
        bus = {
            "number": bus_number,
            "driverId": driver_ids[idx],
            "currentLocation": {
                "lat": BUS_LOCATIONS[idx]["lat"],
                "long": BUS_LOCATIONS[idx]["long"],
                "timestamp": datetime.now()
            },
            "route": ROUTES[idx],
            "currentStopIndex": 0
        }
        
        await db.buses.insert_one(bus)
        print(f"✅ Created bus: {bus_number} (Route: {ROUTES[idx]}, Driver: {DRIVER_NAMES[idx]})")
    
    # 3. Create 25 students (5 per route)
    students_created = 0
    for route_idx, route in enumerate(ROUTES):
        for student_idx in range(5):
            overall_idx = route_idx * 5 + student_idx
            student_name = STUDENT_NAMES[overall_idx]
            roll_no = f"22BCE7{overall_idx + 1:03d}"  # 22BCE7001 to 22BCE7025
            email = f"{student_name.lower().replace(' ', '.')}@vitap.ac.in"
            
            # Check if student exists
            existing = await db.users.find_one({"email": email})
            if existing:
                print(f"⚠️  Student {student_name} already exists")
                continue
            
            # Assign boarding point (rotate through available stops)
            boarding_points = ROUTE_BOARDING_POINTS[route]
            boarding = boarding_points[student_idx % len(boarding_points)]
            
            student = {
                "name": student_name,
                "roll_no": roll_no,
                "route": route,
                "boarding": boarding,
                "email": email,
                "password": hash_password("student123"),  # Default password
                "role": "student",
                "assignedBus": BUS_NUMBERS[route_idx]
            }
            
            await db.users.insert_one(student)
            students_created += 1
            print(f"✅ Created student: {student_name} ({roll_no}) - Route: {route}, Boarding: {boarding}")
    
    # 4. Create 25 parents (one per student)
    parents_created = 0
    for idx, (student_name, parent_name) in enumerate(zip(STUDENT_NAMES, PARENT_NAMES)):
        email = f"{parent_name.lower().replace(' ', '.')}@gmail.com"
        roll_no = f"22BCE7{idx + 1:03d}"
        
        # Check if parent exists
        existing = await db.users.find_one({"email": email})
        if existing:
            print(f"⚠️  Parent {parent_name} already exists")
            continue
        
        parent = {
            "name": parent_name,
            "email": email,
            "password": hash_password("parent123"),  # Default password
            "role": "parent",
            "child": roll_no,  # Link to student by roll number
            "phone": f"8{idx:09d}"  # Generate phone number
        }
        
        await db.users.insert_one(parent)
        parents_created += 1
        print(f"✅ Created parent: {parent_name} (Child: {student_name} - {roll_no})")
    
    print("\n" + "="*60)
    print("🎉 Production data addition complete!")
    print("="*60)
    print(f"📊 Summary:")
    print(f"   - Drivers: 5 created")
    print(f"   - Buses: 5 created (AP29A1234 to AP29E7890)")
    print(f"   - Students: {students_created} created (22BCE7001 to 22BCE7025)")
    print(f"   - Parents: {parents_created} created")
    print(f"\n🔑 Default Passwords:")
    print(f"   - Drivers: driver123")
    print(f"   - Students: student123")
    print(f"   - Parents: parent123")
    print(f"\n📍 Routes:")
    for idx, route in enumerate(ROUTES):
        print(f"   - {BUS_NUMBERS[idx]}: {route} (Driver: {DRIVER_NAMES[idx]})")

if __name__ == "__main__":
    asyncio.run(add_production_data())
