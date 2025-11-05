# TripSync API - Messaging, Admin & Driver Endpoints

## Table of Contents
- [Messaging Endpoints](#messaging-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Driver Endpoints](#driver-endpoints)
- [Student Complaint Endpoints](#student-complaint-endpoints)

---

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

---

## Messaging Endpoints

Base Path: `/api/messages`

### 1. Admin Broadcasts Message to All Students
**POST** `/api/messages/admin/broadcast/all-students`

**Role Required:** Admin

**Request Body:**
```json
{
  "content": "Important announcement: Campus will be closed tomorrow"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Broadcast sent to all students",
  "groupId": "all_students"
}
```

---

### 2. Admin Broadcasts Message to Specific Route
**POST** `/api/messages/admin/broadcast/route`

**Role Required:** Admin

**Request Body:**
```json
{
  "routeName": "Vijayawada to VIT AP",
  "content": "Route will be diverted due to road work",
  "recipientType": "students"  // Options: "students", "drivers", "parents", "all"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent to students on route Vijayawada to VIT AP",
  "groupId": "route_Vijayawada_to_VIT_AP_students"
}
```

---

### 3. Admin Broadcasts to All Drivers
**POST** `/api/messages/admin/broadcast/all-drivers`

**Role Required:** Admin

**Request Body:**
```json
{
  "content": "Reminder: Monthly inspection due this Friday"
}
```

---

### 4. Admin Broadcasts to Route-Specific Drivers
**POST** `/api/messages/admin/broadcast/route-drivers`

**Role Required:** Admin

**Query Parameters:**
- `routeName`: Route name
- `content`: Message content

**Example:**
```
POST /api/messages/admin/broadcast/route-drivers?routeName=Vijayawada to VIT AP&content=Please arrive 15 minutes early today
```

---

### 5. Driver Sends Message to Assigned Students
**POST** `/api/messages/driver/send-to-students`

**Role Required:** Driver

**Request Body:**
```json
{
  "content": "Bus will be delayed by 30 minutes due to tire puncture"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent to your assigned students",
  "groupId": "driver_64f1a2b3c4d5e6f7g8h9i0j1_students",
  "busNumber": "AP09 AB 1234"
}
```

---

### 6. Get Driver's Message Groups
**GET** `/api/messages/driver/my-groups`

**Role Required:** Driver

**Response:**
```json
{
  "groups": [
    {
      "groupId": "all_drivers",
      "groupName": "All Drivers",
      "type": "broadcast",
      "lastMessage": "Monthly inspection reminder",
      "lastMessageTime": "2025-11-05T10:30:00"
    },
    {
      "groupId": "driver_64f1a2b3c4d5e6f7g8h9i0j1_students",
      "groupName": "Bus AP09 AB 1234 - Vijayawada to VIT AP",
      "type": "driver_students",
      "lastMessage": "Bus delayed by 30 minutes",
      "lastMessageTime": "2025-11-05T08:15:00"
    }
  ]
}
```

---

### 7. Get Student's Message Groups
**GET** `/api/messages/student/my-groups`

**Role Required:** Student

**Response:**
```json
{
  "groups": [
    {
      "groupId": "all_students",
      "groupName": "All Students",
      "type": "broadcast",
      "lastMessage": "Campus closed tomorrow",
      "lastMessageTime": "2025-11-05T11:00:00"
    },
    {
      "groupId": "route_Vijayawada_to_VIT_AP_students",
      "groupName": "Vijayawada to VIT AP - Students",
      "type": "route",
      "lastMessage": "Route diverted",
      "lastMessageTime": "2025-11-05T09:30:00"
    }
  ]
}
```

---

### 8. Get Messages from Specific Group
**GET** `/api/messages/group/{group_id}`

**Role Required:** Student, Driver, or Admin (with appropriate access)

**Query Parameters:**
- `limit`: Number of messages (default: 50)
- `skip`: Pagination offset (default: 0)

**Example:**
```
GET /api/messages/group/all_students?limit=20&skip=0
```

**Response:**
```json
{
  "groupId": "all_students",
  "groupName": "All Students",
  "messages": [
    {
      "groupId": "all_students",
      "sender": {
        "id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "name": "Admin",
        "role": "admin"
      },
      "content": "Important announcement",
      "timestamp": "2025-11-05T10:00:00",
      "recipientType": "students"
    }
  ]
}
```

---

## Student Complaint Endpoints

### 9. Submit Complaint
**POST** `/api/messages/student/complaint`

**Role Required:** Student

**Request Body:**
```json
{
  "category": "rash_driving",  // Options: "rash_driving", "lost_found", "bus_issue", "other"
  "description": "Driver was driving rashly and overspeeding on highway",
  "busNumber": "AP09 AB 1234"  // Optional, defaults to student's assigned bus
}
```

**Response:**
```json
{
  "success": true,
  "message": "Complaint submitted successfully",
  "complaint": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "studentId": "64f1a2b3c4d5e6f7g8h9i0j2",
    "studentName": "John Doe",
    "rollNo": "21BCE1234",
    "category": "rash_driving",
    "description": "Driver was driving rashly",
    "busNumber": "AP09 AB 1234",
    "status": "pending",
    "submittedAt": "2025-11-05T10:00:00"
  }
}
```

---

### 10. Get Student's Complaints
**GET** `/api/messages/student/my-complaints`

**Role Required:** Student

**Response:**
```json
{
  "complaints": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "category": "rash_driving",
      "description": "Driver overspeeding",
      "status": "resolved",
      "adminResponse": "Driver has been counseled",
      "submittedAt": "2025-11-05T10:00:00"
    }
  ]
}
```

---

### 11. Admin Views All Complaints
**GET** `/api/messages/admin/complaints`

**Role Required:** Admin

**Query Parameters:**
- `status`: Filter by status (pending, in_progress, resolved)
- `category`: Filter by category

**Example:**
```
GET /api/messages/admin/complaints?status=pending
```

---

### 12. Admin Updates Complaint
**PATCH** `/api/messages/admin/complaints/{complaint_id}`

**Role Required:** Admin

**Request Body:**
```json
{
  "status": "resolved",  // Options: "pending", "in_progress", "resolved"
  "adminResponse": "Issue has been investigated and driver has been counseled"
}
```

---

## Driver Endpoints

Base Path: `/api/drivers`

### 13. Get Driver Profile
**GET** `/api/drivers/me`

**Role Required:** Driver

**Response:**
```json
{
  "driver": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "Ramesh Kumar",
    "email": "ramesh@example.com",
    "phone": "+91 9876543210",
    "role": "driver",
    "assignedBus": "AP09 AB 1234",
    "busDetails": {
      "number": "AP09 AB 1234",
      "route": "Vijayawada to VIT AP",
      "currentLocation": {
        "lat": 16.5062,
        "long": 80.648
      }
    },
    "route": {
      "name": "Vijayawada to VIT AP",
      "stops": [...]
    },
    "studentCount": 45
  }
}
```

---

### 14. Get Assigned Students
**GET** `/api/drivers/me/students`

**Role Required:** Driver

**Response:**
```json
{
  "busNumber": "AP09 AB 1234",
  "route": "Vijayawada to VIT AP",
  "studentCount": 45,
  "students": [
    {
      "name": "John Doe",
      "roll_no": "21BCE1234",
      "email": "john@example.com",
      "boarding": "Vijayawada Central",
      "route": "Vijayawada to VIT AP"
    }
  ]
}
```

---

### 15. Get Bus Location
**GET** `/api/drivers/me/bus-location`

**Role Required:** Driver

**Response:**
```json
{
  "bus": {
    "number": "AP09 AB 1234",
    "route": "Vijayawada to VIT AP",
    "currentLocation": {
      "lat": 16.5062,
      "long": 80.648,
      "timestamp": "2025-11-05T10:30:00"
    },
    "currentStopIndex": 3,
    "coveragePoints": [...]
  }
}
```

---

### 16. Submit Leave Request
**POST** `/api/drivers/me/leave`

**Role Required:** Driver

**Request Body:**
```json
{
  "date": "2025-11-10",
  "reason": "Medical appointment"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "leaveRequest": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "driverId": "64f1a2b3c4d5e6f7g8h9i0j2",
    "date": "2025-11-10",
    "reason": "Medical appointment",
    "status": "pending",
    "submittedAt": "2025-11-05T10:00:00"
  }
}
```

---

### 17. Get Driver's Leave Requests
**GET** `/api/drivers/me/leaves`

**Role Required:** Driver

**Query Parameters:**
- `status`: Filter by status (pending, approved, rejected)

---

### 18. Cancel Leave Request
**DELETE** `/api/drivers/me/leave/{leave_id}`

**Role Required:** Driver

Note: Can only cancel pending requests

---

### 19. Get Driver Schedule
**GET** `/api/drivers/me/schedule`

**Role Required:** Driver

**Response:**
```json
{
  "bus": {...},
  "route": {...},
  "upcomingLeaves": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "date": "2025-11-15",
      "status": "approved",
      "substituteDriverId": "64f1a2b3c4d5e6f7g8h9i0j3"
    }
  ]
}
```

---

### 20. Admin Lists All Drivers
**GET** `/api/drivers/list`

**Role Required:** Admin

**Query Parameters:**
- `assigned`: Filter by assignment (true/false)

---

### 21. Admin Gets Driver Details
**GET** `/api/drivers/{driver_id}`

**Role Required:** Admin

---

### 22. Admin Updates Driver
**PATCH** `/api/drivers/{driver_id}`

**Role Required:** Admin

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "phone": "+91 9876543210"
}
```

---

## Admin Endpoints

Base Path: `/api/admin`

### 23. Get Admin Profile
**GET** `/api/admin/me`

**Role Required:** Admin

---

### 24. Get Admin Dashboard
**GET** `/api/admin/dashboard`

**Role Required:** Admin

**Response:**
```json
{
  "statistics": {
    "totalBuses": 50,
    "runningBuses": 45,
    "totalStudents": 2000,
    "totalDrivers": 50,
    "totalRoutes": 10,
    "pendingLeaves": 3,
    "pendingComplaints": 5
  },
  "routes": [
    {
      "name": "Vijayawada to VIT AP",
      "busCount": 8,
      "studentCount": 350,
      "stops": 12
    }
  ]
}
```

---

### 25. Get All Buses
**GET** `/api/admin/buses`

**Role Required:** Admin

**Query Parameters:**
- `route`: Filter by route
- `status`: Filter by status (running, idle)

---

### 26. Get Bus Details
**GET** `/api/admin/buses/{bus_number}`

**Role Required:** Admin

**Response:**
```json
{
  "bus": {
    "number": "AP09 AB 1234",
    "route": "Vijayawada to VIT AP",
    "currentLocation": {...}
  },
  "driver": {
    "id": "...",
    "name": "Ramesh Kumar",
    "email": "ramesh@example.com"
  },
  "route": {...},
  "students": [...],
  "studentCount": 45,
  "coveragePoints": [...]
}
```

---

### 27. Update Bus
**PATCH** `/api/admin/buses/{bus_number}`

**Role Required:** Admin

**Request Body:**
```json
{
  "driverId": "64f1a2b3c4d5e6f7g8h9i0j1",  // Assign/change driver
  "route": "New Route Name"  // Change route
}
```

---

### 28. Get Bus Current Location
**GET** `/api/admin/buses/{bus_number}/location`

**Role Required:** Admin

---

### 29. Get All Bus Locations
**GET** `/api/admin/buses/locations/all`

**Role Required:** Admin

**Response:**
```json
{
  "locations": [
    {
      "busNumber": "AP09 AB 1234",
      "route": "Vijayawada to VIT AP",
      "currentLocation": {
        "lat": 16.5062,
        "long": 80.648
      },
      "currentStopIndex": 3,
      "lastUpdated": "2025-11-05T10:30:00"
    }
  ]
}
```

---

### 30. Get All Students
**GET** `/api/admin/students`

**Role Required:** Admin

**Query Parameters:**
- `route`: Filter by route
- `bus`: Filter by bus number
- `boarding`: Filter by boarding point

---

### 31. Update Student
**PATCH** `/api/admin/students/{roll_no}`

**Role Required:** Admin

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "route": "New Route",
  "boarding": "New Boarding Point",
  "assignedBus": "AP09 XY 5678"
}
```

---

### 32. Get All Leave Requests
**GET** `/api/admin/leaves`

**Role Required:** Admin

**Query Parameters:**
- `status`: Filter by status (pending, approved, rejected)
- `date`: Filter by date (YYYY-MM-DD)

---

### 33. Process Leave Request
**PATCH** `/api/admin/leaves/{leave_id}`

**Role Required:** Admin

**Request Body:**
```json
{
  "approved": true,
  "substituteDriverId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "adminNotes": "Substitute driver assigned"
}
```

---

### 34. Get All Routes with Details
**GET** `/api/admin/routes`

**Role Required:** Admin

---

### 35. Get Route Details
**GET** `/api/admin/routes/{route_name}`

**Role Required:** Admin

---

### 36. Get System Statistics
**GET** `/api/admin/statistics`

**Role Required:** Admin

**Response:**
```json
{
  "buses": {
    "total": 50,
    "running": 45,
    "idle": 5
  },
  "users": {
    "students": 2000,
    "drivers": 50,
    "assignedDrivers": 45,
    "unassignedDrivers": 5
  },
  "routes": {
    "total": 10
  },
  "pending": {
    "leaves": 3,
    "complaints": 5
  },
  "attendance": {
    "today": 1850
  }
}
```

---

## Error Responses

All endpoints return standard error responses:

**403 Forbidden:**
```json
{
  "detail": "Admin access only"
}
```

**404 Not Found:**
```json
{
  "detail": "Resource not found"
}
```

**400 Bad Request:**
```json
{
  "detail": "Invalid request parameters"
}
```

---

## Notes

1. **Message Groups**: Automatically created when first message is sent
2. **Complaint Categories**: 
   - `rash_driving`
   - `lost_found`
   - `bus_issue`
   - `other`

3. **Leave Request Flow**:
   - Driver submits → Admin reviews → Approves/Rejects → Assigns substitute if approved

4. **Access Control**:
   - Students can only see their own data
   - Drivers can see their assigned bus/students
   - Admin has full access to everything

5. **Real-time Updates**: Consider implementing WebSocket connections for live messaging and location updates
