"""
Data seeding for TripSync - creates initial routes, buses, drivers, students, parents, admin
"""
from datetime import datetime
from app.core.security import hash_password
from app.db import get_db
import random

# Routes with stops
SEED_ROUTES = [
    {
        "name": "Vijayawada to VIT AP",
        "stops": [
            {"name": "Vijayawada", "lat": 16.5062, "long": 80.6480},
            {"name": "Mangalagiri", "lat": 16.4300, "long": 80.5600},
            {"name": "Undavalli", "lat": 16.4950, "long": 80.6150},
            {"name": "Tadepalli", "lat": 16.4800, "long": 80.6000},
            {"name": "Amaravati (VIT AP)", "lat": 16.5183, "long": 80.6183}
        ],
        "coverageAreas": ["Vijayawada", "Mangalagiri", "Undavalli", "Tadepalli", "Amaravati"]
    },
    {
        "name": "Amaravati to VIT AP",
        "stops": [
            {"name": "Amaravati", "lat": 16.5130, "long": 80.5160},
            {"name": "Thullur", "lat": 16.5270, "long": 80.5700},
            {"name": "Inavolu (VIT AP)", "lat": 16.5183, "long": 80.6183}
        ],
        "coverageAreas": ["Amaravati", "Thullur", "Inavolu"]
    },
    {
        "name": "Guntur to VIT AP",
        "stops": [
            {"name": "Guntur", "lat": 16.3067, "long": 80.4365},
            {"name": "Tenali", "lat": 16.2390, "long": 80.6400},
            {"name": "Vemuru", "lat": 16.1800, "long": 80.7300},
            {"name": "Amaravati (VIT AP)", "lat": 16.5183, "long": 80.6183}
        ],
        "coverageAreas": ["Guntur", "Tenali", "Vemuru", "Amaravati"]
    },
    {
        "name": "Eluru to VIT AP",
        "stops": [
            {"name": "Eluru", "lat": 16.7107, "long": 81.0952},
            {"name": "Hanuman Junction", "lat": 16.6300, "long": 80.9700},
            {"name": "Nuzvid", "lat": 16.7880, "long": 80.8460},
            {"name": "Vijayawada", "lat": 16.5062, "long": 80.6480},
            {"name": "Amaravati (VIT AP)", "lat": 16.5183, "long": 80.6183}
        ],
        "coverageAreas": ["Eluru", "Hanuman Junction", "Nuzvid", "Vijayawada", "Amaravati"]
    },
    {
        "name": "Mandadam to VIT AP",
        "stops": [
            {"name": "Mandadam", "lat": 16.5100, "long": 80.5700},
            {"name": "Thullur", "lat": 16.5270, "long": 80.5700},
            {"name": "Inavolu (VIT AP)", "lat": 16.5183, "long": 80.6183}
        ],
        "coverageAreas": ["Mandadam", "Thullur", "Inavolu"]
    }
]

# Buses (initially without driver IDs)
SEED_BUSES = [
    {
        'number': 'Bus1',
        'driverId': None,
        'currentLocation': {'lat': 16.5062, 'long': 80.6480, 'timestamp': datetime.now()},
        'route': 'Vijayawada to VIT AP',
        'currentStopIndex': 0
    },
    {
        'number': 'Bus2',
        'driverId': None,
        'currentLocation': {'lat': 16.5130, 'long': 80.5160, 'timestamp': datetime.now()},
        'route': 'Amaravati to VIT AP',
        'currentStopIndex': 0
    },
    {
        'number': 'Bus3',
        'driverId': None,
        'currentLocation': {'lat': 16.3067, 'long': 80.4365, 'timestamp': datetime.now()},
        'route': 'Guntur to VIT AP',
        'currentStopIndex': 0
    },
    {
        'number': 'Bus4',
        'driverId': None,
        'currentLocation': {'lat': 16.7107, 'long': 81.0952, 'timestamp': datetime.now()},
        'route': 'Eluru to VIT AP',
        'currentStopIndex': 0
    },
    {
        'number': 'Bus5',
        'driverId': None,
        'currentLocation': {'lat': 16.5100, 'long': 80.5700, 'timestamp': datetime.now()},
        'route': 'Mandadam to VIT AP',
        'currentStopIndex': 0
    }
]

# Admin
SEED_ADMIN = {
    "name": "Admin",
    "email": "admin@example.com",
    "password": "adminpass",
    "role": "admin"
}

# Drivers
SEED_DRIVERS = [
    {"name": "Driver1", "email": "driver1@example.com", "password": "default", "role": "driver", "phone": "1234567890"},
    {"name": "Driver2", "email": "driver2@example.com", "password": "default", "role": "driver", "phone": "1234567891"},
    {"name": "Driver3", "email": "driver3@example.com", "password": "default", "role": "driver", "phone": "1234567892"},
    {"name": "Driver4", "email": "driver4@example.com", "password": "default", "role": "driver", "phone": "1234567893"},
    {"name": "Driver5", "email": "driver5@example.com", "password": "default", "role": "driver", "phone": "1234567894"}
]

# Students (25 students across 5 routes)
def generate_students():
    students = []
    student_names = [f"Student{i}" for i in range(1, 26)]
    roll_nos = [f"22BEC7{i:03d}" for i in range(1, 26)]
    
    for route_idx, route in enumerate(SEED_ROUTES):
        for stud_idx in range(5):
            boarding_stop = random.choice(route["stops"][:-1])["name"]
            student = {
                "name": student_names[route_idx*5 + stud_idx],
                "roll_no": roll_nos[route_idx*5 + stud_idx],
                "route": route["name"],
                "boarding": boarding_stop,
                "email": f"student{route_idx*5 + stud_idx + 1}@example.com",
                "password": "default",
                "role": "student",
                "assignedBus": SEED_BUSES[route_idx]['number']
            }
            students.append(student)
    return students

# Parents
SEED_PARENTS = [
    {"name": "Parent1", "email": "parent1@example.com", "password": "default", "role": "parent", "child": "Student1"},
    {"name": "Parent2", "email": "parent2@example.com", "password": "default", "role": "parent", "child": "Student2"},
    {"name": "Parent3", "email": "parent3@example.com", "password": "default", "role": "parent", "child": "Student3"},
    {"name": "Parent4", "email": "parent4@example.com", "password": "default", "role": "parent", "child": "Student4"},
    {"name": "Parent5", "email": "parent5@example.com", "password": "default", "role": "parent", "child": "Student5"},
]


async def seed_database():
    """Seed the database with initial data (idempotent - won't duplicate)"""
    db = await get_db()
    
    # Seed routes
    if await db.routes.count_documents({}) == 0:
        await db.routes.insert_many(SEED_ROUTES)
        print("✅ Seeded routes")
    
    # Seed buses
    if await db.buses.count_documents({}) == 0:
        await db.buses.insert_many(SEED_BUSES)
        print("✅ Seeded buses")
    
    # Seed admin
    if not await db.users.find_one({"email": SEED_ADMIN["email"]}):
        admin = SEED_ADMIN.copy()
        admin["password"] = hash_password(admin["password"])
        await db.users.insert_one(admin)
        print("✅ Seeded admin (admin@example.com / adminpass)")
    
    # Seed drivers and assign to buses
    for idx, driver in enumerate(SEED_DRIVERS):
        if not await db.users.find_one({"email": driver["email"]}):
            driver_data = driver.copy()
            driver_data["password"] = hash_password(driver_data["password"])
            result = await db.users.insert_one(driver_data)
            driver_id = str(result.inserted_id)
            
            # Assign driver to bus
            await db.buses.update_one(
                {"number": SEED_BUSES[idx]["number"]},
                {"$set": {"driverId": driver_id}}
            )
            print(f"✅ Seeded driver {driver['email']} / default (assigned to {SEED_BUSES[idx]['number']})")
    
    # Seed students
    students = generate_students()
    for student in students:
        if not await db.users.find_one({"email": student["email"]}):
            student_data = student.copy()
            student_data["password"] = hash_password(student_data["password"])
            await db.users.insert_one(student_data)
    if await db.users.count_documents({"role": "student"}) > 0:
        print(f"✅ Seeded {len(students)} students (password: default)")
    
    # Seed parents
    for parent in SEED_PARENTS:
        if not await db.users.find_one({"email": parent["email"]}):
            parent_data = parent.copy()
            parent_data["password"] = hash_password(parent_data["password"])
            await db.users.insert_one(parent_data)
    if await db.users.count_documents({"role": "parent"}) > 0:
        print(f"✅ Seeded {len(SEED_PARENTS)} parents (password: default)")
    
    print("🎉 Database seeding complete!")
