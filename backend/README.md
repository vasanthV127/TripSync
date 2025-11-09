# TripSync FastAPI Backend

Modern school bus tracking and management system built with FastAPI, MongoDB, and JWT authentication.

## 🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
# Create .env file with your MongoDB URI

# Run development server
uvicorn main:app --host 0.0.0.0 --port 3000 --reload
```

**Server URLs:**
- **Local API**: http://localhost:3000
- **Production API**: https://tripsync-uh0i.onrender.com
- **Swagger Docs**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health

---

## 📊 Seeded Test Data

The database is automatically seeded on startup with test data:

### Admin Account
```
Email: admin@example.com
Password: adminpass
Role: admin
Access: Web Admin Portal
```

### Drivers (5 accounts)
```
Emails: driver1@example.com to driver5@example.com
Password: default
Role: driver
Bus Assignment: Bus1 to Bus5
Access: Mobile App
```

### Students (25 accounts)
```
Emails: student1@example.com to student25@example.com
Password: default
Roll Numbers: 22BEC7001 to 22BEC7025
Distribution: 5 students per route (5 routes total)
Access: Mobile App
```

### Parents (5 accounts)
```
Emails: parent1@example.com to parent5@example.com
Password: default
Children: Linked to Student1-Student5
Access: Mobile App
```

### Routes (5 routes)
1. **Route 1**: Vijayawada to VIT AP
2. **Route 2**: Amaravati to VIT AP
3. **Route 3**: Guntur to VIT AP
4. **Route 4**: Eluru to VIT AP
5. **Route 5**: Mandadam to VIT AP

### Buses (5 buses)
- Bus1 to Bus5
- Each assigned to a route
- Initial GPS coordinates set
- Driver assigned

---

## 🔐 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login and get JWT token | ❌ |

**Login Example:**
```json
POST /auth/login
{
  "email": "admin@example.com",
  "password": "adminpass"
}

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "role": "admin"
}
```

---

### Buses
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/buses` | Get all buses with locations | ✅ |
| POST | `/buses` | Create new bus | ✅ (admin) |
| PUT | `/buses/{id}` | Update bus details | ✅ (admin) |
| DELETE | `/buses/{id}` | Delete bus | ✅ (admin) |
| POST | `/buses/location` | Update bus GPS location | ✅ (driver/admin) |

**Update Bus Location:**
```json
POST /buses/location
Authorization: Bearer <token>

{
  "busNumber": "Bus1",
  "lat": 16.5062,
  "long": 80.6480
}
```

---

### Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/routes` | Get all routes with stops | ✅ |
| POST | `/routes` | Create new route | ✅ (admin) |
| PUT | `/routes/{id}` | Update route | ✅ (admin) |
| DELETE | `/routes/{id}` | Delete route | ✅ (admin) |

---

### Students
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/students/profile` | Get student profile with route, bus, driver | ✅ (student) |
| GET | `/students` | List all students (with filters) | ✅ (admin/driver) |
| GET | `/students/{roll_no}` | Get student by roll number | ✅ |
| POST | `/students` | Create student | ✅ (admin) |
| PUT | `/students/{roll_no}` | Update student | ✅ (admin) |
| DELETE | `/students/{roll_no}` | Delete student | ✅ (admin) |

---

### Drivers
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/drivers` | List all drivers | ✅ (admin) |
| GET | `/drivers/{id}` | Get driver details | ✅ |
| POST | `/drivers` | Create driver | ✅ (admin) |
| PUT | `/drivers/{id}` | Update driver | ✅ (admin) |
| DELETE | `/drivers/{id}` | Delete driver | ✅ (admin) |

---

### Attendance
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/attendance/board` | Mark attendance (student boards bus) | ✅ (student) |
| GET | `/attendance` | Get attendance records (with filters) | ✅ |
| GET | `/students/{roll_no}/attendance-summary` | Get attendance summary with date range | ✅ |

**Mark Attendance:**
```json
POST /attendance/board
Authorization: Bearer <student_token>

Response:
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
      "timestamp": "2025-11-08T09:15:30"
    }
  }
}
```

---

### Messaging
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/messaging/send` | Send message to group | ✅ |
| GET | `/messaging/{group_id}` | Get group messages | ✅ |
| GET | `/messaging/groups` | Get user's groups | ✅ |

---

### Admin
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/dashboard` | Get admin dashboard stats | ✅ (admin) |
| GET | `/admin/users` | List all users | ✅ (admin) |
| PUT | `/admin/users/{id}` | Update user | ✅ (admin) |
| DELETE | `/admin/users/{id}` | Delete user | ✅ (admin) |

---

## 🔑 Authorization

All protected endpoints require JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

**Role-based Access:**
- **Admin**: Full system access (all endpoints)
- **Driver**: Update bus location, view attendance, send messages
- **Student**: Mark attendance, view own records, send messages
- **Parent**: View child's attendance and bus location

---

## 📝 Typical User Workflows

### Student Boarding Bus
1. **Login**: `POST /auth/login` with student credentials
2. **Board Bus**: `POST /attendance/board` (auto-captures GPS and time)
3. **View History**: `GET /attendance?roll_no=22BEC7001`

### Driver Updating Location
1. **Login**: `POST /auth/login` with driver credentials
2. **Update GPS**: `POST /buses/location` with current coordinates
3. **View Students**: `GET /students?busNumber=Bus1`
4. **Send Alert**: `POST /messaging/send`

### Admin Managing System
1. **Login**: `POST /auth/login` with admin credentials
2. **Dashboard**: `GET /admin/dashboard` (overview stats)
3. **Manage Buses**: CRUD operations on `/buses`
4. **Manage Routes**: CRUD operations on `/routes`
5. **View Attendance**: `GET /attendance?date=2025-11-08`

---

## 🛠️ Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | FastAPI | 0.115.5 |
| Database | MongoDB | 4.x+ |
| DB Driver | Motor | (async) |
| Authentication | JWT | PyJWT |
| Password Hash | bcrypt | |
| Validation | Pydantic | 2.x |
| Server | Uvicorn | |
| Deployment | Render | |

---

## 📦 Environment Variables

Required in `.env` file:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGO_DB=tripsync

# Security
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
SECRET_KEY=your_app_secret_key

# Server
APP_HOST=0.0.0.0
APP_PORT=3000

# Optional
GROQ_API_KEY=your_groq_api_key_for_ai_features
```

---

## 🧪 Testing with Swagger UI

1. Visit http://localhost:3000/docs
2. Click **"Authorize"** button (top right)
3. Login via `/auth/login` endpoint
4. Copy the `access_token` from response
5. Paste token in authorization dialog: `Bearer <token>`
6. Test any protected endpoint!

**Quick Test Credentials:**
```
Admin: admin@example.com / adminpass
Driver: driver1@example.com / default
Student: student1@example.com / default
```

---

## 📊 Database Schema

### Collections

**users**
```javascript
{
  _id: ObjectId,
  email: string,
  password: string (hashed),
  role: "admin" | "driver" | "student" | "parent",
  name: string,
  phone?: string,
  roll_no?: string,  // students only
  busNumber?: string, // students/drivers
  route_id?: ObjectId // students
}
```

**buses**
```javascript
{
  _id: ObjectId,
  busNumber: string,
  capacity: number,
  driver_id: ObjectId,
  route_id: ObjectId,
  location: {
    lat: number,
    long: number,
    timestamp: datetime
  }
}
```

**routes**
```javascript
{
  _id: ObjectId,
  name: string,
  stops: [string],
  coordinates: [{lat: number, long: number}]
}
```

**attendance**
```javascript
{
  _id: ObjectId,
  student_id: ObjectId,
  roll_no: string,
  busNumber: string,
  date: date,
  time: time,
  location: {
    lat: number,
    long: number,
    timestamp: datetime
  }
}
```

---

## 🚀 Deployment (Render)

**Live API:** https://tripsync-uh0i.onrender.com

### render.yaml Configuration
```yaml
services:
  - type: web
    name: tripsync-backend
    runtime: python
    buildCommand: pip install -r backend/requirements.txt
    startCommand: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: MONGO_URI
        sync: false
      - key: JWT_SECRET
        sync: false
```

**Environment Variables:**
Set in Render Dashboard → Environment section

---

## 📚 Additional Resources

- 📖 [Student API Guide](./STUDENT_API_GUIDE.md) - Detailed student endpoints
- 📖 [Main README](../README.md) - Full project overview
- 🌐 [API Docs (Swagger)](http://localhost:3000/docs)
- 🌐 [Production API](https://tripsync-uh0i.onrender.com)

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

## 👨‍💻 Developer

**Vasanth V**
- VIT-AP University
- GitHub: [@vasanthV127](https://github.com/vasanthV127)

**Last Updated:** November 8, 2025
