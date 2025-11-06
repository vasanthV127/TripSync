# TripSync FastAPI Backend

Modern bus tracking and attendance system built with FastAPI.

## 🚀 Quick Start

```powershell
# Navigate to project
cd "d:\VASANTH\Final year\Capstone\TripSync_Backend\fastapi_backend"

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Copy .env.example to .env and set your MongoDB URI

# Run server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Server URLs:**
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

---

## 📊 Seeded Test Data

The database is automatically seeded on startup with:

**Admin:**
- Email: `admin@example.com`
- Password: `adminpass`

**Drivers (5):**
- Email: `driver1@example.com` to `driver5@example.com`
- Password: `default`
- Each assigned to Bus1-Bus5

**Students (25):**
- Email: `student1@example.com` to `student25@example.com`
- Password: `default`
- Roll numbers: `22BEC7001` to `22BEC7025`
- Distributed across 5 routes (5 students per route)

**Parents (5):**
- Email: `parent1@example.com` to `parent5@example.com`
- Password: `default`
- Linked to Student1-Student5

**Routes (5):**
1. Vijayawada to VIT AP
2. Amaravati to VIT AP
3. Guntur to VIT AP
4. Eluru to VIT AP
5. Mandadam to VIT AP

**Buses (5):**
- Bus1 to Bus5 (each on a route with initial GPS coordinates)

---

## 🔐 API Endpoints

📖 **[View Complete Student API Guide](./STUDENT_API_GUIDE.md)** - Detailed guide for student profile, history, and attendance endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/register` | Create new user | No |
| POST | `/api/login` | Get JWT token | No |

**Example Login:**
```json
POST /api/login
{
  "email": "student1@example.com",
  "password": "default"
}
```

**Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "role": "student"
}
```

---

### Buses
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/buses` | Get all buses with locations | Yes |
| POST | `/api/buses/location` | Update bus GPS location | Yes (admin/driver) |

**Update Bus Location:**
```json
POST /api/buses/location
Authorization: Bearer <token>
{
  "busNumber": "Bus1",
  "lat": 16.5062,
  "long": 80.6480
}
```

---

### Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/routes` | Get all routes with stops | Yes |

---

### Attendance
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/attendance/board` | Mark attendance when boarding | Yes (student) |
| GET | `/api/attendance` | Get attendance records | Yes (all roles) |

---

### Students
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/students/profile` | Get complete student profile with route, bus, driver, attendance | Yes |
| GET | `/api/students/list` | List all students (with filters) | Yes (admin/driver) |
| GET | `/api/students/{roll_no}/attendance-summary` | Get attendance summary with date range | Yes |

**Board Bus (Student):**
```json
POST /api/attendance/board
Authorization: Bearer <student_token>
```

**Response:**
```json
{
  "message": "Attendance marked! Boarded at 09:15:30",
  "record": {
    "name": "Student1",
    "roll_no": "22BEC7001",
    "busNumber": "Bus1",
    "time": "09:15:30",
    "location": {
      "lat": 16.5062,
      "long": 80.6480,
      "timestamp": "2025-11-04T09:15:30"
    }
  }
}
```

**Get Attendance:**
```
GET /api/attendance?date=2025-11-04&roll_no=22BEC7001
Authorization: Bearer <token>
```

---

## 🔑 Authorization

Include JWT token in requests:
```
Authorization: Bearer <your_jwt_token>
```

**Role-based access:**
- **Admin**: All operations
- **Driver**: Update bus location, view attendance
- **Student**: Mark own attendance, view own records
- **Parent**: View child's attendance

---

## 📝 Typical User Flow

### Student Boarding Bus
1. Login: `POST /api/login` with student credentials
2. Board bus: `POST /api/attendance/board` (marks attendance with GPS)
3. Check history: `GET /api/attendance`

### Driver Updating Location
1. Login: `POST /api/login` with driver credentials
2. Update location: `POST /api/buses/location`
3. View attendance: `GET /api/attendance?busNumber=Bus1`

### Admin Managing System
1. Login with admin credentials
2. View all buses: `GET /api/buses`
3. View all routes: `GET /api/routes`
4. Check attendance: `GET /api/attendance?date=2025-11-04`

---

## 🛠️ Tech Stack

- **Framework:** FastAPI 0.115.5
- **Database:** MongoDB (Motor async driver)
- **Auth:** JWT + bcrypt password hashing
- **Validation:** Pydantic
- **Server:** Uvicorn with auto-reload

---

## 📦 Environment Variables

Required in `.env`:
```env
MONGO_URI=mongodb+srv://...
MONGO_DB=tripsync
JWT_SECRET=your_secret_key
SECRET_KEY=your_app_secret
APP_HOST=0.0.0.0
APP_PORT=8000
```

---

## 🧪 Testing with Swagger

Visit http://localhost:8000/docs for interactive API testing:
1. Click "Authorize" button
2. Login via `/api/login` endpoint
3. Copy the token from response
4. Enter `Bearer <token>` in authorization dialog
5. Test protected endpoints

---

## 📊 Database Collections

- `users` - Admin, drivers, students, parents
- `buses` - Bus info with real-time locations
- `routes` - Routes with stops and GPS coordinates
- `attendance` - Student boarding records with timestamps
- `complaints` - (future)
- `messages` - (future)
