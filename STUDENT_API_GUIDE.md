# Student Profile & History API Guide

## 📚 New Student Endpoints

### 1. Get Complete Student Profile
**Endpoint:** `GET /api/students/profile`

Get comprehensive student information including:
- Student details (name, roll, email, boarding point)
- Assigned route with all stops
- Assigned bus with current location
- Driver details (name, email, phone)
- Complete attendance history with statistics

**Access:**
- **Student**: Can view own profile only
- **Parent**: Can view their child's profile
- **Admin/Driver**: Can view any student (requires `roll_no` parameter)

**Examples:**

```bash
# Student viewing own profile
GET /api/students/profile
Authorization: Bearer <student_token>

# Admin viewing specific student
GET /api/students/profile?roll_no=22BEC7001
Authorization: Bearer <admin_token>

# Parent viewing child
GET /api/students/profile
Authorization: Bearer <parent_token>
```

**Response:**
```json
{
  "student": {
    "name": "Student1",
    "roll_no": "22BEC7001",
    "email": "student1@example.com",
    "role": "student",
    "boarding": "Vijayawada",
    "assignedBus": "Bus1",
    "route": "Vijayawada to VIT AP"
  },
  "route": {
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
  "bus": {
    "number": "Bus1",
    "driverId": "507f1f77bcf86cd799439011",
    "currentLocation": {
      "lat": 16.5062,
      "long": 80.6480,
      "timestamp": "2025-11-04T09:30:00"
    },
    "route": "Vijayawada to VIT AP",
    "currentStopIndex": 0
  },
  "driver": {
    "name": "Driver1",
    "email": "driver1@example.com",
    "phone": "1234567890"
  },
  "attendance": {
    "total_days": 15,
    "present_days": 14,
    "attendance_percentage": 93.33,
    "history": [
      {
        "name": "Student1",
        "roll_no": "22BEC7001",
        "route": "Vijayawada to VIT AP",
        "boarding": "Vijayawada",
        "busNumber": "Bus1",
        "date": "2025-11-04",
        "time": "08:15:30",
        "status": "Boarded",
        "location": {
          "lat": 16.5062,
          "long": 80.6480,
          "timestamp": "2025-11-04T08:15:30"
        },
        "timestamp": "2025-11-04T08:15:30"
      }
      // ... more records
    ]
  }
}
```

---

### 2. List All Students (Admin/Driver)
**Endpoint:** `GET /api/students/list`

Get list of all students with optional filters.

**Access:** Admin or Driver only

**Query Parameters:**
- `route` (optional): Filter by route name
- `busNumber` (optional): Filter by bus number

**Examples:**

```bash
# Get all students
GET /api/students/list
Authorization: Bearer <admin_token>

# Get students on specific route
GET /api/students/list?route=Vijayawada to VIT AP
Authorization: Bearer <admin_token>

# Get students on specific bus
GET /api/students/list?busNumber=Bus1
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "count": 25,
  "students": [
    {
      "name": "Student1",
      "roll_no": "22BEC7001",
      "email": "student1@example.com",
      "role": "student",
      "route": "Vijayawada to VIT AP",
      "boarding": "Vijayawada",
      "assignedBus": "Bus1"
    }
    // ... more students
  ]
}
```

---

### 3. Get Attendance Summary with Date Range
**Endpoint:** `GET /api/students/{roll_no}/attendance-summary`

Get detailed attendance summary for a specific student with optional date range filtering.

**Access:**
- **Student**: Own attendance only
- **Parent**: Child's attendance only
- **Admin/Driver**: Any student

**Query Parameters:**
- `from_date` (optional): Start date in YYYY-MM-DD format
- `to_date` (optional): End date in YYYY-MM-DD format

**Examples:**

```bash
# Get all-time attendance summary
GET /api/students/22BEC7001/attendance-summary
Authorization: Bearer <token>

# Get attendance for specific date range
GET /api/students/22BEC7001/attendance-summary?from_date=2025-11-01&to_date=2025-11-04
Authorization: Bearer <token>

# Get attendance from specific date onwards
GET /api/students/22BEC7001/attendance-summary?from_date=2025-11-01
Authorization: Bearer <token>
```

**Response:**
```json
{
  "roll_no": "22BEC7001",
  "period": {
    "from": "2025-11-01",
    "to": "2025-11-04"
  },
  "summary": {
    "total_entries": 4,
    "present_count": 4,
    "attendance_percentage": 100.0,
    "dates_present": [
      "2025-11-04",
      "2025-11-03",
      "2025-11-02",
      "2025-11-01"
    ]
  },
  "records": [
    {
      "name": "Student1",
      "roll_no": "22BEC7001",
      "route": "Vijayawada to VIT AP",
      "boarding": "Vijayawada",
      "busNumber": "Bus1",
      "date": "2025-11-04",
      "time": "08:15:30",
      "status": "Boarded",
      "location": {
        "lat": 16.5062,
        "long": 80.6480,
        "timestamp": "2025-11-04T08:15:30"
      },
      "timestamp": "2025-11-04T08:15:30"
    }
    // ... more records
  ]
}
```

---

## 🎯 Complete Workflow Examples

### Student Daily Flow

1. **Login**
```bash
POST /api/login
{
  "email": "student1@example.com",
  "password": "default"
}
```

2. **View Profile (route, bus, driver info)**
```bash
GET /api/students/profile
Authorization: Bearer <token>
```

3. **Board Bus (mark attendance)**
```bash
POST /api/attendance/board
Authorization: Bearer <token>
```

4. **Check Attendance History**
```bash
GET /api/students/profile
# or
GET /api/students/22BEC7001/attendance-summary
Authorization: Bearer <token>
```

---

### Parent Checking Child

1. **Login as Parent**
```bash
POST /api/login
{
  "email": "parent1@example.com",
  "password": "default"
}
```

2. **View Child's Complete Profile**
```bash
GET /api/students/profile
Authorization: Bearer <parent_token>
```
Returns child's info, current bus location, driver details, attendance

3. **View Child's Monthly Attendance**
```bash
GET /api/students/22BEC7001/attendance-summary?from_date=2025-11-01&to_date=2025-11-30
Authorization: Bearer <parent_token>
```

---

### Driver Checking Students on Bus

1. **Login as Driver**
```bash
POST /api/login
{
  "email": "driver1@example.com",
  "password": "default"
}
```

2. **View All Students on My Bus**
```bash
GET /api/students/list?busNumber=Bus1
Authorization: Bearer <driver_token>
```

3. **Check Specific Student**
```bash
GET /api/students/profile?roll_no=22BEC7001
Authorization: Bearer <driver_token>
```

4. **View Today's Attendance for My Bus**
```bash
GET /api/attendance?busNumber=Bus1&date=2025-11-04
Authorization: Bearer <driver_token>
```

---

### Admin Managing System

1. **View All Students**
```bash
GET /api/students/list
Authorization: Bearer <admin_token>
```

2. **View Students on Specific Route**
```bash
GET /api/students/list?route=Vijayawada to VIT AP
Authorization: Bearer <admin_token>
```

3. **Check Any Student's Profile**
```bash
GET /api/students/profile?roll_no=22BEC7001
Authorization: Bearer <admin_token>
```

4. **View Attendance Summary for Any Student**
```bash
GET /api/students/22BEC7001/attendance-summary?from_date=2025-11-01
Authorization: Bearer <admin_token>
```

---

## 📊 Sample Student Data Structure

Each seeded student includes:

```json
{
  "name": "Student1",
  "roll_no": "22BEC7001",
  "email": "student1@example.com",
  "password": "default",
  "role": "student",
  "route": "Vijayawada to VIT AP",
  "boarding": "Vijayawada",          // Boarding stop
  "assignedBus": "Bus1"
}
```

**25 Students Total:**
- Students 1-5: Vijayawada to VIT AP route (Bus1)
- Students 6-10: Amaravati to VIT AP route (Bus2)
- Students 11-15: Guntur to VIT AP route (Bus3)
- Students 16-20: Eluru to VIT AP route (Bus4)
- Students 21-25: Mandadam to VIT AP route (Bus5)

Each student assigned to a random boarding stop on their route.

---

## 🧪 Testing in Swagger UI

1. Go to http://localhost:8000/docs
2. Login as student: `student1@example.com` / `default`
3. Authorize with token
4. Try these endpoints:
   - `GET /api/students/profile` - See your complete profile
   - `POST /api/attendance/board` - Mark attendance
   - `GET /api/students/22BEC7001/attendance-summary` - View summary

---

## 🔑 Test Credentials Quick Reference

| Role | Email | Password | Roll No (if student) |
|------|-------|----------|---------------------|
| Student 1 | student1@example.com | default | 22BEC7001 |
| Student 2 | student2@example.com | default | 22BEC7002 |
| Parent 1 | parent1@example.com | default | (child: Student1) |
| Driver 1 | driver1@example.com | default | (drives Bus1) |
| Admin | admin@example.com | adminpass | - |

---

## ✨ Key Features

✅ **Complete student profile** - All info in one API call
✅ **Boarding point tracking** - Know where each student boards
✅ **Real-time bus location** - Current GPS coordinates
✅ **Driver information** - Contact details readily available
✅ **Attendance history** - Full historical records
✅ **Attendance statistics** - Automatic percentage calculation
✅ **Date range filtering** - Flexible date queries
✅ **Role-based access** - Proper permissions for each user type
✅ **Parent access** - Parents can monitor their children
✅ **Driver view** - Drivers can see their bus passengers
