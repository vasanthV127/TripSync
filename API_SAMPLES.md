# 📚 TripSync API - Sample Inputs & Outputs

Complete guide with examples for all messaging, admin, driver, and student endpoints.

---

## 🔐 Authentication

All endpoints require authentication. Include JWT token in header:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 📨 MESSAGING ENDPOINTS

### 1. Admin: Broadcast to All Students

**Endpoint:** `POST /api/messages/admin/broadcast/all-students`  
**Role:** Admin only

**Sample Input:**
```json
{
  "content": "Important: Campus will be closed tomorrow due to maintenance work."
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Broadcast sent to all students",
  "groupId": "all_students"
}
```

---

### 2. Admin: Broadcast to Specific Route

**Endpoint:** `POST /api/messages/admin/broadcast/route`  
**Role:** Admin only

**Sample Input:**
```json
{
  "routeName": "Vijayawada to VIT AP",
  "content": "Route delayed by 15 minutes due to heavy traffic on NH16",
  "recipientType": "students"
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Message sent to students on route Vijayawada to VIT AP",
  "groupId": "route_Vijayawada_to_VIT_AP_students"
}
```

**Other recipientType values:**
- `"students"` - Only students on this route
- `"drivers"` - Only drivers on this route
- `"parents"` - Only parents on this route
- `"all"` - Everyone on this route

---

### 3. Admin: Broadcast to All Drivers

**Endpoint:** `POST /api/messages/admin/broadcast/all-drivers`  
**Role:** Admin only

**Sample Input:**
```json
{
  "content": "Mandatory safety training session tomorrow at 9 AM in main hall."
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Broadcast sent to all drivers",
  "groupId": "all_drivers"
}
```

---

### 4. Admin: Broadcast to Route Drivers

**Endpoint:** `POST /api/messages/admin/broadcast/route-drivers?routeName=Vijayawada to VIT AP&content=Your route maintenance scheduled for tomorrow`  
**Role:** Admin only

**Sample Output:**
```json
{
  "success": true,
  "message": "Message sent to drivers on route Vijayawada to VIT AP",
  "groupId": "route_Vijayawada_to_VIT_AP_drivers"
}
```

---

### 5. Driver: Send Message to Students

**Endpoint:** `POST /api/messages/driver/send-to-students`  
**Role:** Driver only

**Sample Input:**
```json
{
  "content": "Bus will be delayed by 30 minutes due to tire puncture. Currently at Gannavaram."
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Message sent to your assigned students",
  "groupId": "driver_673abc123def456789_students",
  "busNumber": "AP39TS1234"
}
```

---

### 6. Driver: Get My Groups

**Endpoint:** `GET /api/messages/driver/my-groups`  
**Role:** Driver only

**Sample Output:**
```json
{
  "groups": [
    {
      "groupId": "all_drivers",
      "groupName": "All Drivers",
      "type": "broadcast",
      "lastMessage": "Mandatory safety training session tomorrow at 9 AM",
      "lastMessageTime": "2025-11-05T14:30:00"
    },
    {
      "groupId": "driver_673abc123def456789_students",
      "groupName": "Bus AP39TS1234 - Vijayawada to VIT AP",
      "type": "driver_students",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP",
      "lastMessage": "Bus will be delayed by 30 minutes",
      "lastMessageTime": "2025-11-05T08:15:00"
    },
    {
      "groupId": "route_Vijayawada_to_VIT_AP_drivers",
      "groupName": "Vijayawada to VIT AP - Drivers",
      "type": "route",
      "route": "Vijayawada to VIT AP",
      "lastMessage": "Route maintenance scheduled",
      "lastMessageTime": "2025-11-04T18:00:00"
    }
  ]
}
```

---

### 7. Student: Get My Groups

**Endpoint:** `GET /api/messages/student/my-groups`  
**Role:** Student only

**Sample Output:**
```json
{
  "groups": [
    {
      "groupId": "all_students",
      "groupName": "All Students",
      "type": "broadcast",
      "lastMessage": "Campus closed tomorrow due to maintenance",
      "lastMessageTime": "2025-11-05T10:00:00"
    },
    {
      "groupId": "route_Vijayawada_to_VIT_AP_students",
      "groupName": "Vijayawada to VIT AP - Students",
      "type": "route",
      "route": "Vijayawada to VIT AP",
      "lastMessage": "Route delayed by 15 minutes",
      "lastMessageTime": "2025-11-05T07:30:00"
    },
    {
      "groupId": "driver_673abc123def456789_students",
      "groupName": "Bus AP39TS1234 - Vijayawada to VIT AP",
      "type": "driver_students",
      "busNumber": "AP39TS1234",
      "lastMessage": "Bus delayed due to tire puncture",
      "lastMessageTime": "2025-11-05T08:15:00"
    },
    {
      "groupId": "bus_AP39TS1234_students",
      "groupName": "Bus AP39TS1234 - Students",
      "type": "bus_students",
      "busNumber": "AP39TS1234",
      "lastMessage": "Anyone know today's assignment deadline?",
      "lastMessageTime": "2025-11-05T09:45:00",
      "lastSender": "Ravi Kumar"
    }
  ]
}
```

---

### 8. Student: Send Message to Bus Group

**Endpoint:** `POST /api/messages/student/send-message`  
**Role:** Student only

**Sample Input:**
```json
{
  "content": "Hey everyone! Does anyone know if we have classes after 3 PM today?"
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Message sent to bus group",
  "groupId": "bus_AP39TS1234_students",
  "messageId": "673def456abc789012"
}
```

---

### 9. Student: Get Bus Group Info

**Endpoint:** `GET /api/messages/student/bus-group`  
**Role:** Student only

**Sample Output:**
```json
{
  "groupId": "bus_AP39TS1234_students",
  "groupName": "Bus AP39TS1234 - Students",
  "busNumber": "AP39TS1234",
  "route": "Vijayawada to VIT AP",
  "memberCount": 45,
  "members": [
    {
      "name": "Ravi Kumar",
      "roll_no": "21BCE0001",
      "email": "ravi@vitap.ac.in",
      "boarding": "Gannavaram Circle",
      "assignedBus": "AP39TS1234"
    },
    {
      "name": "Priya Sharma",
      "roll_no": "21BCE0002",
      "email": "priya@vitap.ac.in",
      "boarding": "Vijayawada Junction",
      "assignedBus": "AP39TS1234"
    }
    // ... more students
  ],
  "groupInfo": {
    "groupId": "bus_AP39TS1234_students",
    "groupName": "Bus AP39TS1234 - Students",
    "type": "bus_students",
    "busNumber": "AP39TS1234",
    "route": "Vijayawada to VIT AP",
    "createdAt": "2025-09-01T06:00:00"
  },
  "lastMessage": "Does anyone know if we have classes after 3 PM?",
  "lastMessageTime": "2025-11-05T09:45:00"
}
```

---

### 10. Student: Submit Complaint

**Endpoint:** `POST /api/messages/student/complaint`  
**Role:** Student only

**Sample Input:**
```json
{
  "category": "rash_driving",
  "description": "Driver was driving very fast and overtaking dangerously on NH16 near Gannavaram",
  "busNumber": "AP39TS1234"
}
```

**Categories:**
- `rash_driving` - Dangerous driving behavior
- `lost_found` - Lost items in bus
- `bus_issue` - Mechanical or maintenance issues
- `other` - Any other complaint

**Sample Output:**
```json
{
  "success": true,
  "message": "Complaint submitted successfully",
  "complaint": {
    "_id": "673xyz789abc012345",
    "studentId": "673stu123abc456789",
    "studentName": "Ravi Kumar",
    "rollNo": "21BCE0001",
    "category": "rash_driving",
    "description": "Driver was driving very fast and overtaking dangerously on NH16 near Gannavaram",
    "busNumber": "AP39TS1234",
    "route": "Vijayawada to VIT AP",
    "status": "pending",
    "submittedAt": "2025-11-05T10:15:00",
    "adminResponse": null
  }
}
```

---

### 11. Student: Get My Complaints

**Endpoint:** `GET /api/messages/student/my-complaints`  
**Role:** Student only

**Sample Output:**
```json
{
  "complaints": [
    {
      "_id": "673xyz789abc012345",
      "studentId": "673stu123abc456789",
      "studentName": "Ravi Kumar",
      "rollNo": "21BCE0001",
      "category": "rash_driving",
      "description": "Driver was driving very fast",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP",
      "status": "in_progress",
      "submittedAt": "2025-11-05T10:15:00",
      "adminResponse": "We are investigating this matter. Driver has been warned.",
      "updatedAt": "2025-11-05T14:30:00"
    },
    {
      "_id": "673xyz789abc012346",
      "studentId": "673stu123abc456789",
      "studentName": "Ravi Kumar",
      "rollNo": "21BCE0001",
      "category": "lost_found",
      "description": "Lost my textbook in bus",
      "busNumber": "AP39TS1234",
      "status": "resolved",
      "submittedAt": "2025-11-03T09:00:00",
      "adminResponse": "Your book was found and is available at admin office",
      "updatedAt": "2025-11-04T11:00:00"
    }
  ]
}
```

---

### 12. Get Group Messages

**Endpoint:** `GET /api/messages/group/{group_id}?limit=50&skip=0`  
**Role:** All users (with access control)

**Example:** `GET /api/messages/group/bus_AP39TS1234_students?limit=20`

**Sample Output:**
```json
{
  "groupId": "bus_AP39TS1234_students",
  "groupName": "Bus AP39TS1234 - Students",
  "messages": [
    {
      "groupId": "bus_AP39TS1234_students",
      "groupName": "Bus AP39TS1234 - Students",
      "sender": {
        "id": "673stu123abc456789",
        "name": "Ravi Kumar",
        "rollNo": "21BCE0001",
        "role": "student"
      },
      "content": "Does anyone know if we have classes after 3 PM?",
      "timestamp": "2025-11-05T09:45:00",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP"
    },
    {
      "groupId": "bus_AP39TS1234_students",
      "groupName": "Bus AP39TS1234 - Students",
      "sender": {
        "id": "673stu456def789012",
        "name": "Priya Sharma",
        "rollNo": "21BCE0002",
        "role": "student"
      },
      "content": "No classes after 2 PM today. Early dismissal!",
      "timestamp": "2025-11-05T09:47:00",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP"
    }
  ]
}
```

---

### 13. Admin: Get All Complaints

**Endpoint:** `GET /api/admin/complaints?status=pending&category=rash_driving`  
**Role:** Admin only

**Query Parameters:**
- `status` (optional): `pending`, `in_progress`, `resolved`
- `category` (optional): `rash_driving`, `lost_found`, `bus_issue`, `other`

**Sample Output:**
```json
{
  "count": 3,
  "complaints": [
    {
      "_id": "673xyz789abc012345",
      "studentId": "673stu123abc456789",
      "studentName": "Ravi Kumar",
      "rollNo": "21BCE0001",
      "category": "rash_driving",
      "description": "Driver was driving very fast and overtaking dangerously",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP",
      "status": "pending",
      "submittedAt": "2025-11-05T10:15:00",
      "adminResponse": null
    }
  ]
}
```

---

### 14. Admin: Update Complaint

**Endpoint:** `PATCH /api/admin/complaints/{complaint_id}`  
**Role:** Admin only

**Sample Input:**
```json
{
  "status": "in_progress",
  "adminResponse": "We have investigated this complaint and issued a warning to the driver. We will monitor the situation closely."
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Complaint updated successfully"
}
```

---

## 👨‍✈️ DRIVER ENDPOINTS

### 15. Driver: Get Profile

**Endpoint:** `GET /api/drivers/me`  
**Role:** Driver only

**Sample Output:**
```json
{
  "driver": {
    "id": "673drv123abc456789",
    "name": "Rajesh Kumar",
    "email": "rajesh.driver@vitap.ac.in",
    "phone": "+91-9876543210",
    "role": "driver",
    "assignedBus": "AP39TS1234",
    "busDetails": {
      "number": "AP39TS1234",
      "route": "Vijayawada to VIT AP",
      "capacity": 50,
      "driverId": "673drv123abc456789",
      "currentLocation": {
        "latitude": 16.5062,
        "longitude": 80.6480,
        "timestamp": "2025-11-05T08:30:00"
      },
      "currentStopIndex": 3
    },
    "route": {
      "name": "Vijayawada to VIT AP",
      "stops": [
        {
          "name": "Vijayawada Junction",
          "time": "07:00",
          "latitude": 16.5193,
          "longitude": 80.6305
        },
        {
          "name": "Gannavaram Circle",
          "time": "07:30",
          "latitude": 16.5370,
          "longitude": 80.8037
        }
        // ... more stops
      ]
    },
    "studentCount": 45
  }
}
```

---

### 16. Driver: Get Assigned Students

**Endpoint:** `GET /api/drivers/me/students`  
**Role:** Driver only

**Sample Output:**
```json
{
  "busNumber": "AP39TS1234",
  "route": "Vijayawada to VIT AP",
  "studentCount": 45,
  "students": [
    {
      "name": "Ravi Kumar",
      "roll_no": "21BCE0001",
      "email": "ravi@vitap.ac.in",
      "phone": "+91-9876543211",
      "boarding": "Gannavaram Circle",
      "route": "Vijayawada to VIT AP",
      "assignedBus": "AP39TS1234"
    },
    {
      "name": "Priya Sharma",
      "roll_no": "21BCE0002",
      "email": "priya@vitap.ac.in",
      "phone": "+91-9876543212",
      "boarding": "Vijayawada Junction",
      "route": "Vijayawada to VIT AP",
      "assignedBus": "AP39TS1234"
    }
    // ... more students
  ]
}
```

---

### 17. Driver: Request Leave

**Endpoint:** `POST /api/drivers/me/leave`  
**Role:** Driver only

**Sample Input:**
```json
{
  "date": "2025-11-15",
  "reason": "Medical appointment at hospital"
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "leaveRequest": {
    "_id": "673leave123abc456",
    "driverId": "673drv123abc456789",
    "driverName": "Rajesh Kumar",
    "busNumber": "AP39TS1234",
    "route": "Vijayawada to VIT AP",
    "date": "2025-11-15",
    "reason": "Medical appointment at hospital",
    "status": "pending",
    "submittedAt": "2025-11-05T10:30:00",
    "approved": null,
    "substituteDriverId": null,
    "adminNotes": null
  }
}
```

---

### 18. Driver: Get My Leaves

**Endpoint:** `GET /api/drivers/me/leaves?status=pending`  
**Role:** Driver only

**Sample Output:**
```json
{
  "count": 3,
  "leaves": [
    {
      "_id": "673leave123abc456",
      "driverId": "673drv123abc456789",
      "driverName": "Rajesh Kumar",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP",
      "date": "2025-11-15",
      "reason": "Medical appointment",
      "status": "pending",
      "submittedAt": "2025-11-05T10:30:00"
    },
    {
      "_id": "673leave456def789",
      "driverId": "673drv123abc456789",
      "driverName": "Rajesh Kumar",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP",
      "date": "2025-10-28",
      "reason": "Personal work",
      "status": "approved",
      "submittedAt": "2025-10-25T09:00:00",
      "approved": true,
      "adminNotes": "Approved. Substitute driver assigned.",
      "substituteDriverId": "673drv789xyz012345"
    }
  ]
}
```

---

### 19. Driver: Cancel Leave

**Endpoint:** `DELETE /api/drivers/me/leave/{leave_id}`  
**Role:** Driver only

**Sample Output:**
```json
{
  "success": true,
  "message": "Leave request cancelled successfully"
}
```

---

### 20. Driver: Get Schedule

**Endpoint:** `GET /api/drivers/me/schedule`  
**Role:** Driver only

**Sample Output:**
```json
{
  "bus": {
    "number": "AP39TS1234",
    "route": "Vijayawada to VIT AP",
    "capacity": 50
  },
  "route": {
    "name": "Vijayawada to VIT AP",
    "stops": [
      {
        "name": "Vijayawada Junction",
        "time": "07:00"
      },
      {
        "name": "Gannavaram Circle",
        "time": "07:30"
      }
      // ... more stops
    ]
  },
  "upcomingLeaves": [
    {
      "_id": "673leave123abc456",
      "date": "2025-11-15",
      "reason": "Medical appointment",
      "status": "approved",
      "substituteDriverId": "673drv789xyz012345"
    }
  ]
}
```

---

## 👨‍💼 ADMIN ENDPOINTS

### 21. Admin: Get Dashboard

**Endpoint:** `GET /api/admin/dashboard`  
**Role:** Admin only

**Sample Output:**
```json
{
  "statistics": {
    "totalBuses": 25,
    "runningBuses": 23,
    "totalStudents": 1250,
    "totalDrivers": 30,
    "totalRoutes": 12,
    "pendingLeaves": 5,
    "pendingComplaints": 8
  },
  "routes": [
    {
      "name": "Vijayawada to VIT AP",
      "busCount": 5,
      "studentCount": 220,
      "stops": 8
    },
    {
      "name": "Guntur to VIT AP",
      "busCount": 4,
      "studentCount": 180,
      "stops": 6
    }
    // ... more routes
  ]
}
```

---

### 22. Admin: Get All Buses

**Endpoint:** `GET /api/admin/buses?route=Vijayawada to VIT AP&status=running`  
**Role:** Admin only

**Query Parameters:**
- `route` (optional): Filter by route name
- `status` (optional): `running` or `idle`

**Sample Output:**
```json
{
  "count": 5,
  "buses": [
    {
      "number": "AP39TS1234",
      "route": "Vijayawada to VIT AP",
      "capacity": 50,
      "driverId": "673drv123abc456789",
      "driver": {
        "name": "Rajesh Kumar",
        "email": "rajesh.driver@vitap.ac.in",
        "phone": "+91-9876543210"
      },
      "studentCount": 45,
      "currentLocation": {
        "latitude": 16.5062,
        "longitude": 80.6480,
        "timestamp": "2025-11-05T08:30:00"
      },
      "currentStopIndex": 3,
      "coveragePoints": [
        {
          "stopName": "Vijayawada Junction",
          "arrivalTime": "07:00",
          "covered": true,
          "timestamp": "2025-11-05T07:02:00"
        },
        {
          "stopName": "Gannavaram Circle",
          "arrivalTime": "07:30",
          "covered": true,
          "timestamp": "2025-11-05T07:32:00"
        }
      ]
    }
    // ... more buses
  ]
}
```

---

### 23. Admin: Get Bus Details

**Endpoint:** `GET /api/admin/buses/AP39TS1234`  
**Role:** Admin only

**Sample Output:**
```json
{
  "bus": {
    "number": "AP39TS1234",
    "route": "Vijayawada to VIT AP",
    "capacity": 50,
    "driverId": "673drv123abc456789",
    "currentLocation": {
      "latitude": 16.5062,
      "longitude": 80.6480,
      "timestamp": "2025-11-05T08:30:00"
    },
    "currentStopIndex": 3
  },
  "driver": {
    "id": "673drv123abc456789",
    "name": "Rajesh Kumar",
    "email": "rajesh.driver@vitap.ac.in",
    "phone": "+91-9876543210"
  },
  "route": {
    "name": "Vijayawada to VIT AP",
    "stops": [...]
  },
  "students": [
    {
      "name": "Ravi Kumar",
      "roll_no": "21BCE0001",
      "email": "ravi@vitap.ac.in",
      "boarding": "Gannavaram Circle"
    }
    // ... all students
  ],
  "studentCount": 45,
  "coveragePoints": [...]
}
```

---

### 24. Admin: Update Bus

**Endpoint:** `PATCH /api/admin/buses/AP39TS1234`  
**Role:** Admin only

**Sample Input:**
```json
{
  "driverId": "673drv789xyz012345",
  "route": "Guntur to VIT AP"
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Bus updated successfully",
  "busNumber": "AP39TS1234",
  "updated": {
    "driverId": "673drv789xyz012345",
    "route": "Guntur to VIT AP",
    "updatedAt": "2025-11-05T11:00:00"
  }
}
```

---

### 25. Admin: Get Bus Location

**Endpoint:** `GET /api/admin/buses/AP39TS1234/location`  
**Role:** Admin only

**Sample Output:**
```json
{
  "busNumber": "AP39TS1234",
  "currentLocation": {
    "latitude": 16.5062,
    "longitude": 80.6480,
    "timestamp": "2025-11-05T08:30:00"
  },
  "currentStopIndex": 3,
  "route": "Vijayawada to VIT AP",
  "coveragePoints": [
    {
      "stopName": "Vijayawada Junction",
      "covered": true,
      "timestamp": "2025-11-05T07:02:00"
    }
  ],
  "lastUpdated": "2025-11-05T08:30:00"
}
```

---

### 26. Admin: Get All Bus Locations

**Endpoint:** `GET /api/admin/buses/locations/all`  
**Role:** Admin only

**Sample Output:**
```json
{
  "locations": [
    {
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP",
      "currentLocation": {
        "latitude": 16.5062,
        "longitude": 80.6480,
        "timestamp": "2025-11-05T08:30:00"
      },
      "currentStopIndex": 3,
      "lastUpdated": "2025-11-05T08:30:00"
    }
    // ... all buses
  ]
}
```

---

### 27. Admin: Get All Students

**Endpoint:** `GET /api/admin/students?route=Vijayawada to VIT AP&bus=AP39TS1234`  
**Role:** Admin only

**Query Parameters:**
- `route` (optional): Filter by route
- `bus` (optional): Filter by bus number
- `boarding` (optional): Filter by boarding point

**Sample Output:**
```json
{
  "count": 45,
  "students": [
    {
      "name": "Ravi Kumar",
      "roll_no": "21BCE0001",
      "email": "ravi@vitap.ac.in",
      "phone": "+91-9876543211",
      "role": "student",
      "route": "Vijayawada to VIT AP",
      "boarding": "Gannavaram Circle",
      "assignedBus": "AP39TS1234"
    }
    // ... more students
  ]
}
```

---

### 28. Admin: Update Student

**Endpoint:** `PATCH /api/admin/students/21BCE0001`  
**Role:** Admin only

**Sample Input:**
```json
{
  "name": "Ravi Kumar Reddy",
  "email": "ravi.new@vitap.ac.in",
  "route": "Guntur to VIT AP",
  "boarding": "Guntur Bus Stand",
  "assignedBus": "AP39TS5678"
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Student updated successfully",
  "rollNo": "21BCE0001",
  "updated": {
    "name": "Ravi Kumar Reddy",
    "email": "ravi.new@vitap.ac.in",
    "route": "Guntur to VIT AP",
    "boarding": "Guntur Bus Stand",
    "assignedBus": "AP39TS5678",
    "updatedAt": "2025-11-05T11:30:00"
  }
}
```

---

### 29. Admin: Get All Leave Requests

**Endpoint:** `GET /api/admin/leaves?status=pending&date=2025-11-15`  
**Role:** Admin only

**Sample Output:**
```json
{
  "count": 5,
  "leaves": [
    {
      "_id": "673leave123abc456",
      "driverId": "673drv123abc456789",
      "driverName": "Rajesh Kumar",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP",
      "date": "2025-11-15",
      "reason": "Medical appointment",
      "status": "pending",
      "submittedAt": "2025-11-05T10:30:00"
    }
    // ... more leaves
  ]
}
```

---

### 30. Admin: Approve/Reject Leave

**Endpoint:** `PATCH /api/admin/leaves/673leave123abc456`  
**Role:** Admin only

**Sample Input (Approve with substitute):**
```json
{
  "approved": true,
  "substituteDriverId": "673drv789xyz012345",
  "adminNotes": "Approved. John will cover this route."
}
```

**Sample Input (Reject):**
```json
{
  "approved": false,
  "adminNotes": "Cannot approve - no substitute drivers available."
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Leave request approved",
  "leaveId": "673leave123abc456"
}
```

---

### 31. Admin: Get All Routes

**Endpoint:** `GET /api/admin/routes`  
**Role:** Admin only

**Sample Output:**
```json
{
  "count": 12,
  "routes": [
    {
      "name": "Vijayawada to VIT AP",
      "stops": [...],
      "busCount": 5,
      "studentCount": 220,
      "driverCount": 5,
      "stopCount": 8
    }
    // ... more routes
  ]
}
```

---

### 32. Admin: Get Route Details

**Endpoint:** `GET /api/admin/routes/Vijayawada to VIT AP`  
**Role:** Admin only

**Sample Output:**
```json
{
  "route": {
    "name": "Vijayawada to VIT AP",
    "stops": [
      {
        "name": "Vijayawada Junction",
        "time": "07:00",
        "latitude": 16.5193,
        "longitude": 80.6305
      }
      // ... more stops
    ]
  },
  "buses": [
    {
      "number": "AP39TS1234",
      "capacity": 50,
      "driverId": "673drv123abc456789"
    }
    // ... more buses
  ],
  "busCount": 5,
  "students": [...],
  "studentCount": 220,
  "stopCount": 8
}
```

---

### 33. Admin: Get System Statistics

**Endpoint:** `GET /api/admin/statistics`  
**Role:** Admin only

**Sample Output:**
```json
{
  "buses": {
    "total": 25,
    "running": 23,
    "idle": 2
  },
  "users": {
    "students": 1250,
    "drivers": 30,
    "assignedDrivers": 23,
    "unassignedDrivers": 7
  },
  "routes": {
    "total": 12
  },
  "pending": {
    "leaves": 5,
    "complaints": 8
  },
  "attendance": {
    "today": 1180
  }
}
```

---

### 34. Admin: List All Drivers

**Endpoint:** `GET /api/drivers/list?assigned=true`  
**Role:** Admin only

**Query Parameters:**
- `assigned` (optional): `true` or `false`

**Sample Output:**
```json
{
  "count": 23,
  "drivers": [
    {
      "_id": "673drv123abc456789",
      "name": "Rajesh Kumar",
      "email": "rajesh.driver@vitap.ac.in",
      "phone": "+91-9876543210",
      "role": "driver",
      "assignedBus": "AP39TS1234",
      "route": "Vijayawada to VIT AP"
    }
    // ... more drivers
  ]
}
```

---

## 📝 Error Responses

All endpoints return consistent error responses:

**Authentication Error (401):**
```json
{
  "detail": "Not authenticated"
}
```

**Authorization Error (403):**
```json
{
  "detail": "Admin access only"
}
```

**Not Found Error (404):**
```json
{
  "detail": "Bus not found"
}
```

**Validation Error (400):**
```json
{
  "detail": "Email already in use"
}
```

**Server Error (500):**
```json
{
  "detail": "Internal server error"
}
```

---

## 🔑 Key Features Summary

### Student-to-Student Chat (NEW)
✅ Students can chat with other students on the same bus  
✅ Bus-specific group created automatically  
✅ See all members in the group  
✅ View message history  

### Message Groups Auto-Created
- **`all_students`** - Global announcements
- **`all_drivers`** - Driver announcements  
- **`route_{name}_students`** - Route-specific student messages
- **`route_{name}_drivers`** - Route-specific driver messages
- **`driver_{id}_students`** - Driver alerts to students
- **`bus_{number}_students`** - Student-to-student chat (NEW)

### Access Control
- Admins can see everything
- Drivers can see their groups only
- Students can see their groups only
- Automatic verification of group membership

---

## 🚀 Quick Testing Guide

1. **Login first to get JWT token**
2. **Test student chat:**
   - Login as student
   - GET `/api/messages/student/my-groups` - see your groups
   - POST `/api/messages/student/send-message` - send message
   - GET `/api/messages/student/bus-group` - see group members
   - GET `/api/messages/group/bus_AP39TS1234_students` - view chat

3. **Test driver features:**
   - Login as driver
   - GET `/api/drivers/me` - see profile
   - POST `/api/messages/driver/send-to-students` - alert students
   - POST `/api/drivers/me/leave` - request leave

4. **Test admin features:**
   - Login as admin
   - GET `/api/admin/dashboard` - overview
   - POST `/api/messages/admin/broadcast/all-students` - announce
   - GET `/api/admin/complaints` - review complaints
   - PATCH `/api/admin/leaves/{id}` - approve leave

---

**Need help? All endpoints include proper error messages and validation!** 🎉
