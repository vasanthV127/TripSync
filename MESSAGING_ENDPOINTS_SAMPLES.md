# 📨 Messaging Endpoints - Sample Inputs & Outputs

Complete samples for all messaging endpoints created in this chat.

---

## 🔐 Authentication Header (Required for all endpoints)

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 1️⃣ ADMIN MESSAGING ENDPOINTS

### 1.1 Broadcast to All Students

**Endpoint:** `POST /api/messages/admin/broadcast/all-students`  
**Role:** Admin only

**Sample Input:**
```json
{
  "content": "Important: Campus will be closed tomorrow due to maintenance work. All classes are suspended."
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

**Another Example:**
```json
// Input
{
  "content": "Annual day celebrations on December 15th. All students are invited!"
}

// Output
{
  "success": true,
  "message": "Broadcast sent to all students",
  "groupId": "all_students"
}
```

---

### 1.2 Broadcast to Specific Route

**Endpoint:** `POST /api/messages/admin/broadcast/route`  
**Role:** Admin only

**Sample Input 1 - Message to Students on Route:**
```json
{
  "routeName": "Vijayawada to VIT AP",
  "content": "Route delayed by 15 minutes due to heavy traffic on NH16. All buses affected.",
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

**Sample Input 2 - Message to All on Route:**
```json
{
  "routeName": "Guntur to VIT AP",
  "content": "New stop added at Guntur Bus Stand from tomorrow. Updated schedule sent via email.",
  "recipientType": "all"
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Message sent to all on route Guntur to VIT AP",
  "groupId": "route_Guntur_to_VIT_AP_all"
}
```

**Sample Input 3 - Message to Drivers on Route:**
```json
{
  "routeName": "Vijayawada to VIT AP",
  "content": "Route maintenance work near Gannavaram tomorrow 8-10 AM. Use alternate route.",
  "recipientType": "drivers"
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Message sent to drivers on route Vijayawada to VIT AP",
  "groupId": "route_Vijayawada_to_VIT_AP_drivers"
}
```

**Sample Input 4 - Message to Parents on Route:**
```json
{
  "routeName": "Vijayawada to VIT AP",
  "content": "Parent-teacher meeting scheduled for November 20th at 4 PM for this route students.",
  "recipientType": "parents"
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Message sent to parents on route Vijayawada to VIT AP",
  "groupId": "route_Vijayawada_to_VIT_AP_parents"
}
```

---

### 1.3 Broadcast to All Drivers

**Endpoint:** `POST /api/messages/admin/broadcast/all-drivers`  
**Role:** Admin only

**Sample Input:**
```json
{
  "content": "Mandatory safety training session tomorrow at 9 AM in main hall. All drivers must attend."
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

**Another Example:**
```json
// Input
{
  "content": "New parking policy effective from tomorrow. Check your email for details."
}

// Output
{
  "success": true,
  "message": "Broadcast sent to all drivers",
  "groupId": "all_drivers"
}
```

---

### 1.4 Broadcast to Route Drivers

**Endpoint:** `POST /api/messages/admin/broadcast/route-drivers`  
**Query Parameters:** `routeName` and `content`  
**Role:** Admin only

**Sample Request:**
```
POST /api/messages/admin/broadcast/route-drivers?routeName=Vijayawada%20to%20VIT%20AP&content=Speed%20limit%20strictly%2060%20kmph%20on%20NH16%20from%20today
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Message sent to drivers on route Vijayawada to VIT AP",
  "groupId": "route_Vijayawada_to_VIT_AP_drivers"
}
```

**Using cURL:**
```bash
curl -X POST "http://localhost:8000/api/messages/admin/broadcast/route-drivers?routeName=Vijayawada%20to%20VIT%20AP&content=Speed%20limit%20strictly%2060%20kmph" \
  -H "Authorization: Bearer <token>"
```

---

### 1.5 Get All Complaints (Admin)

**Endpoint:** `GET /api/admin/complaints`  
**Query Parameters:** `status` (optional), `category` (optional)  
**Role:** Admin only

**Sample Request 1 - All Complaints:**
```
GET /api/admin/complaints
```

**Sample Output:**
```json
{
  "count": 8,
  "complaints": [
    {
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
    },
    {
      "_id": "673xyz789abc012346",
      "studentId": "673stu456def789012",
      "studentName": "Priya Sharma",
      "rollNo": "21BCE0002",
      "category": "lost_found",
      "description": "Lost my blue chemistry textbook in the bus yesterday",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP",
      "status": "in_progress",
      "submittedAt": "2025-11-04T09:30:00",
      "adminResponse": "We are searching for your book. Will update soon."
    },
    {
      "_id": "673xyz789abc012347",
      "studentId": "673stu789xyz345678",
      "studentName": "Amit Singh",
      "rollNo": "21BCE0003",
      "category": "bus_issue",
      "description": "AC not working in the bus. Very uncomfortable in this heat.",
      "busNumber": "AP39TS5678",
      "route": "Guntur to VIT AP",
      "status": "resolved",
      "submittedAt": "2025-11-03T11:00:00",
      "adminResponse": "AC has been repaired. Thanks for reporting.",
      "updatedAt": "2025-11-04T15:00:00"
    }
  ]
}
```

**Sample Request 2 - Filter by Status:**
```
GET /api/admin/complaints?status=pending
```

**Sample Output:**
```json
{
  "count": 3,
  "complaints": [
    {
      "_id": "673xyz789abc012345",
      "studentName": "Ravi Kumar",
      "category": "rash_driving",
      "status": "pending",
      "submittedAt": "2025-11-05T10:15:00"
    }
    // ... more pending complaints
  ]
}
```

**Sample Request 3 - Filter by Category:**
```
GET /api/admin/complaints?category=lost_found
```

**Sample Output:**
```json
{
  "count": 2,
  "complaints": [
    {
      "_id": "673xyz789abc012346",
      "studentName": "Priya Sharma",
      "category": "lost_found",
      "description": "Lost my blue chemistry textbook",
      "status": "in_progress"
    }
    // ... more lost_found complaints
  ]
}
```

**Sample Request 4 - Multiple Filters:**
```
GET /api/admin/complaints?status=resolved&category=bus_issue
```

---

### 1.6 Update Complaint (Admin)

**Endpoint:** `PATCH /api/admin/complaints/{complaint_id}`  
**Role:** Admin only

**Sample Input 1 - Update to In Progress:**
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

**Sample Input 2 - Mark as Resolved:**
```json
{
  "status": "resolved",
  "adminResponse": "Your textbook has been found and is available at the admin office. Please collect it during office hours."
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Complaint updated successfully"
}
```

**Sample Input 3 - Status Only:**
```json
{
  "status": "in_progress"
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

## 2️⃣ DRIVER MESSAGING ENDPOINTS

### 2.1 Driver Send Message to Students

**Endpoint:** `POST /api/messages/driver/send-to-students`  
**Role:** Driver only

**Sample Input 1 - Delay Alert:**
```json
{
  "content": "Bus will be delayed by 30 minutes due to tire puncture. Currently at Gannavaram. Sorry for the inconvenience."
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Message sent to your assigned students",
  "groupId": "driver_673drv123abc456789_students",
  "busNumber": "AP39TS1234"
}
```

**Sample Input 2 - Early Arrival:**
```json
{
  "content": "Bus running 10 minutes early today. Please be ready at your stop."
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Message sent to your assigned students",
  "groupId": "driver_673drv123abc456789_students",
  "busNumber": "AP39TS1234"
}
```

**Sample Input 3 - Route Change:**
```json
{
  "content": "Taking alternate route today due to road work on NH16. Will pick up everyone as usual but may be 5-10 mins late."
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Message sent to your assigned students",
  "groupId": "driver_673drv123abc456789_students",
  "busNumber": "AP39TS1234"
}
```

**Sample Input 4 - Facility Issue:**
```json
{
  "content": "AC not working today due to technical issue. Apologies for the inconvenience. Repair scheduled for tomorrow."
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Message sent to your assigned students",
  "groupId": "driver_673drv123abc456789_students",
  "busNumber": "AP39TS1234"
}
```

---

### 2.2 Get Driver Groups

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
      "lastMessage": "Mandatory safety training session tomorrow at 9 AM in main hall",
      "lastMessageTime": "2025-11-05T14:30:00",
      "createdAt": "2025-09-01T06:00:00"
    },
    {
      "groupId": "driver_673drv123abc456789_students",
      "groupName": "Bus AP39TS1234 - Vijayawada to VIT AP",
      "type": "driver_students",
      "driverId": "673drv123abc456789",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP",
      "lastMessage": "Bus will be delayed by 30 minutes due to tire puncture",
      "lastMessageTime": "2025-11-05T08:15:00",
      "createdAt": "2025-09-01T06:00:00"
    },
    {
      "groupId": "route_Vijayawada_to_VIT_AP_drivers",
      "groupName": "Vijayawada to VIT AP - Drivers",
      "type": "route",
      "route": "Vijayawada to VIT AP",
      "recipientType": "drivers",
      "lastMessage": "Speed limit strictly 60 kmph on NH16 from today",
      "lastMessageTime": "2025-11-04T18:00:00",
      "createdAt": "2025-09-01T06:00:00"
    },
    {
      "groupId": "route_Vijayawada_to_VIT_AP_all",
      "groupName": "Vijayawada to VIT AP - All",
      "type": "route",
      "route": "Vijayawada to VIT AP",
      "recipientType": "all",
      "lastMessage": "New stop added at Gannavaram Bus Stand from tomorrow",
      "lastMessageTime": "2025-11-03T10:00:00",
      "createdAt": "2025-09-01T06:00:00"
    }
  ]
}
```

---

## 3️⃣ STUDENT MESSAGING ENDPOINTS

### 3.1 Get Student Groups

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
      "lastMessage": "Campus will be closed tomorrow due to maintenance work",
      "lastMessageTime": "2025-11-05T10:00:00",
      "createdAt": "2025-09-01T06:00:00"
    },
    {
      "groupId": "route_Vijayawada_to_VIT_AP_students",
      "groupName": "Vijayawada to VIT AP - Students",
      "type": "route",
      "route": "Vijayawada to VIT AP",
      "recipientType": "students",
      "lastMessage": "Route delayed by 15 minutes due to heavy traffic on NH16",
      "lastMessageTime": "2025-11-05T07:30:00",
      "createdAt": "2025-09-01T06:00:00"
    },
    {
      "groupId": "driver_673drv123abc456789_students",
      "groupName": "Bus AP39TS1234 - Vijayawada to VIT AP",
      "type": "driver_students",
      "driverId": "673drv123abc456789",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP",
      "lastMessage": "Bus will be delayed by 30 minutes due to tire puncture",
      "lastMessageTime": "2025-11-05T08:15:00",
      "createdAt": "2025-09-01T06:00:00"
    },
    {
      "groupId": "bus_AP39TS1234_students",
      "groupName": "Bus AP39TS1234 - Students",
      "type": "bus_students",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP",
      "lastMessage": "Anyone have notes from yesterday's lecture?",
      "lastMessageTime": "2025-11-05T09:45:00",
      "lastSender": "Ravi Kumar",
      "createdAt": "2025-11-05T09:00:00"
    }
  ]
}
```

---

### 3.2 Student Send Message to Bus Group

**Endpoint:** `POST /api/messages/student/send-message`  
**Role:** Student only

**Sample Input 1 - Ask Question:**
```json
{
  "content": "Hey everyone! Does anyone have notes from yesterday's physics lecture? I missed the class."
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Message sent to bus group",
  "groupId": "bus_AP39TS1234_students",
  "messageId": "673msg123abc456789"
}
```

**Sample Input 2 - Lost Item:**
```json
{
  "content": "Did anyone find a blue notebook in the bus? I think I left it yesterday."
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Message sent to bus group",
  "groupId": "bus_AP39TS1234_students",
  "messageId": "673msg456def789012"
}
```

**Sample Input 3 - Coordination:**
```json
{
  "content": "Is everyone ready? Bus leaves in 10 minutes from Gannavaram!"
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Message sent to bus group",
  "groupId": "bus_AP39TS1234_students",
  "messageId": "673msg789xyz345678"
}
```

**Sample Input 4 - Event Planning:**
```json
{
  "content": "Who's going to the tech fest tomorrow? Let's go together from the bus!"
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Message sent to bus group",
  "groupId": "bus_AP39TS1234_students",
  "messageId": "673msgabc012def345"
}
```

**Sample Input 5 - Study Group:**
```json
{
  "content": "Anyone interested in forming a study group for mid-term exams? We can meet during lunch."
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Message sent to bus group",
  "groupId": "bus_AP39TS1234_students",
  "messageId": "673msgdef678xyz901"
}
```

---

### 3.3 Get Bus Group Info

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
      "phone": "+91-9876543211",
      "role": "student",
      "route": "Vijayawada to VIT AP",
      "boarding": "Gannavaram Circle",
      "assignedBus": "AP39TS1234"
    },
    {
      "name": "Priya Sharma",
      "roll_no": "21BCE0002",
      "email": "priya@vitap.ac.in",
      "phone": "+91-9876543212",
      "role": "student",
      "route": "Vijayawada to VIT AP",
      "boarding": "Vijayawada Junction",
      "assignedBus": "AP39TS1234"
    },
    {
      "name": "Amit Singh",
      "roll_no": "21BCE0003",
      "email": "amit@vitap.ac.in",
      "phone": "+91-9876543213",
      "role": "student",
      "route": "Vijayawada to VIT AP",
      "boarding": "Gannavaram Circle",
      "assignedBus": "AP39TS1234"
    },
    {
      "name": "Sneha Reddy",
      "roll_no": "21BCE0004",
      "email": "sneha@vitap.ac.in",
      "phone": "+91-9876543214",
      "role": "student",
      "route": "Vijayawada to VIT AP",
      "boarding": "Vijayawada Junction",
      "assignedBus": "AP39TS1234"
    }
    // ... 41 more students
  ],
  "groupInfo": {
    "groupId": "bus_AP39TS1234_students",
    "groupName": "Bus AP39TS1234 - Students",
    "type": "bus_students",
    "busNumber": "AP39TS1234",
    "route": "Vijayawada to VIT AP",
    "lastMessage": "Anyone have notes from yesterday's lecture?",
    "lastMessageTime": "2025-11-05T09:45:00",
    "lastSender": "Ravi Kumar",
    "createdAt": "2025-11-05T09:00:00"
  },
  "lastMessage": "Anyone have notes from yesterday's lecture?",
  "lastMessageTime": "2025-11-05T09:45:00"
}
```

---

### 3.4 Student Submit Complaint

**Endpoint:** `POST /api/messages/student/complaint`  
**Role:** Student only

**Sample Input 1 - Rash Driving:**
```json
{
  "category": "rash_driving",
  "description": "Driver was driving very fast and overtaking dangerously on NH16 near Gannavaram. Many students felt unsafe.",
  "busNumber": "AP39TS1234"
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Complaint submitted successfully",
  "complaint": {
    "_id": "673cmp123abc456789",
    "studentId": "673stu123abc456789",
    "studentName": "Ravi Kumar",
    "rollNo": "21BCE0001",
    "category": "rash_driving",
    "description": "Driver was driving very fast and overtaking dangerously on NH16 near Gannavaram. Many students felt unsafe.",
    "busNumber": "AP39TS1234",
    "route": "Vijayawada to VIT AP",
    "status": "pending",
    "submittedAt": "2025-11-05T10:15:00",
    "adminResponse": null
  }
}
```

**Sample Input 2 - Lost and Found:**
```json
{
  "category": "lost_found",
  "description": "I lost my blue chemistry textbook in the bus yesterday around 5 PM. It has my name written inside the cover."
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Complaint submitted successfully",
  "complaint": {
    "_id": "673cmp456def789012",
    "studentId": "673stu456def789012",
    "studentName": "Priya Sharma",
    "rollNo": "21BCE0002",
    "category": "lost_found",
    "description": "I lost my blue chemistry textbook in the bus yesterday around 5 PM. It has my name written inside the cover.",
    "busNumber": "AP39TS1234",
    "route": "Vijayawada to VIT AP",
    "status": "pending",
    "submittedAt": "2025-11-05T10:20:00",
    "adminResponse": null
  }
}
```

**Sample Input 3 - Bus Issue:**
```json
{
  "category": "bus_issue",
  "description": "The AC in our bus has not been working for the past 3 days. It's very uncomfortable in this heat.",
  "busNumber": "AP39TS1234"
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Complaint submitted successfully",
  "complaint": {
    "_id": "673cmp789xyz345678",
    "studentId": "673stu789xyz345678",
    "studentName": "Amit Singh",
    "rollNo": "21BCE0003",
    "category": "bus_issue",
    "description": "The AC in our bus has not been working for the past 3 days. It's very uncomfortable in this heat.",
    "busNumber": "AP39TS1234",
    "route": "Vijayawada to VIT AP",
    "status": "pending",
    "submittedAt": "2025-11-05T10:25:00",
    "adminResponse": null
  }
}
```

**Sample Input 4 - Other Complaint:**
```json
{
  "category": "other",
  "description": "The bus seats need cleaning. They have not been cleaned for a long time and are very dusty."
}
```

**Sample Output:**
```json
{
  "success": true,
  "message": "Complaint submitted successfully",
  "complaint": {
    "_id": "673cmpabc012def345",
    "studentId": "673stuabc012def345",
    "studentName": "Sneha Reddy",
    "rollNo": "21BCE0004",
    "category": "other",
    "description": "The bus seats need cleaning. They have not been cleaned for a long time and are very dusty.",
    "busNumber": "AP39TS1234",
    "route": "Vijayawada to VIT AP",
    "status": "pending",
    "submittedAt": "2025-11-05T10:30:00",
    "adminResponse": null
  }
}
```

**Available Categories:**
- `rash_driving` - Dangerous driving behavior
- `lost_found` - Lost or found items
- `bus_issue` - Mechanical or maintenance issues
- `other` - Any other complaints

---

### 3.5 Get My Complaints

**Endpoint:** `GET /api/messages/student/my-complaints`  
**Role:** Student only

**Sample Output:**
```json
{
  "complaints": [
    {
      "_id": "673cmp123abc456789",
      "studentId": "673stu123abc456789",
      "studentName": "Ravi Kumar",
      "rollNo": "21BCE0001",
      "category": "rash_driving",
      "description": "Driver was driving very fast and overtaking dangerously",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP",
      "status": "in_progress",
      "submittedAt": "2025-11-05T10:15:00",
      "adminResponse": "We have investigated this complaint and issued a warning to the driver. We will monitor the situation closely.",
      "updatedAt": "2025-11-05T14:30:00",
      "updatedBy": "Admin"
    },
    {
      "_id": "673cmp456def789012",
      "studentId": "673stu123abc456789",
      "studentName": "Ravi Kumar",
      "rollNo": "21BCE0001",
      "category": "lost_found",
      "description": "Lost my notebook in bus",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP",
      "status": "resolved",
      "submittedAt": "2025-11-03T09:00:00",
      "adminResponse": "Your notebook was found and is available at the admin office. Please collect during office hours.",
      "updatedAt": "2025-11-04T11:00:00",
      "updatedBy": "Admin"
    },
    {
      "_id": "673cmp789xyz345678",
      "studentId": "673stu123abc456789",
      "studentName": "Ravi Kumar",
      "rollNo": "21BCE0001",
      "category": "bus_issue",
      "description": "AC not working properly",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP",
      "status": "pending",
      "submittedAt": "2025-11-05T08:00:00",
      "adminResponse": null
    }
  ]
}
```

---

## 4️⃣ GROUP MESSAGES ENDPOINT (ALL USERS)

### 4.1 Get Group Messages

**Endpoint:** `GET /api/messages/group/{group_id}`  
**Query Parameters:** `limit` (default: 50), `skip` (default: 0)  
**Role:** All users with access to the group

**Sample Request 1 - Bus Students Group:**
```
GET /api/messages/group/bus_AP39TS1234_students?limit=20&skip=0
```

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
      "content": "Hey everyone! Does anyone have notes from yesterday's physics lecture?",
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
      "content": "Yes! I can share them. Check your email in 5 minutes.",
      "timestamp": "2025-11-05T09:47:00",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP"
    },
    {
      "groupId": "bus_AP39TS1234_students",
      "groupName": "Bus AP39TS1234 - Students",
      "sender": {
        "id": "673stu789xyz345678",
        "name": "Amit Singh",
        "rollNo": "21BCE0003",
        "role": "student"
      },
      "content": "Thanks Priya! Also, is anyone attending the workshop tomorrow?",
      "timestamp": "2025-11-05T09:50:00",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP"
    },
    {
      "groupId": "bus_AP39TS1234_students",
      "groupName": "Bus AP39TS1234 - Students",
      "sender": {
        "id": "673stuabc012def345",
        "name": "Sneha Reddy",
        "rollNo": "21BCE0004",
        "role": "student"
      },
      "content": "I'm going! Let's go together from college gate at 2 PM.",
      "timestamp": "2025-11-05T09:52:00",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP"
    },
    {
      "groupId": "bus_AP39TS1234_students",
      "groupName": "Bus AP39TS1234 - Students",
      "sender": {
        "id": "673stu123abc456789",
        "name": "Ravi Kumar",
        "rollNo": "21BCE0001",
        "role": "student"
      },
      "content": "Count me in too! See you at 2 PM.",
      "timestamp": "2025-11-05T09:55:00",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP"
    }
  ]
}
```

**Sample Request 2 - All Students Group:**
```
GET /api/messages/group/all_students?limit=10
```

**Sample Output:**
```json
{
  "groupId": "all_students",
  "groupName": "All Students",
  "messages": [
    {
      "groupId": "all_students",
      "groupName": "All Students",
      "sender": {
        "id": "673admin123abc456",
        "name": "Dr. Admin",
        "role": "admin"
      },
      "content": "Campus will be closed tomorrow due to maintenance work. All classes are suspended.",
      "timestamp": "2025-11-05T10:00:00",
      "recipientType": "students"
    },
    {
      "groupId": "all_students",
      "groupName": "All Students",
      "sender": {
        "id": "673admin123abc456",
        "name": "Dr. Admin",
        "role": "admin"
      },
      "content": "Annual day celebrations on December 15th. All students are invited!",
      "timestamp": "2025-11-04T15:00:00",
      "recipientType": "students"
    }
  ]
}
```

**Sample Request 3 - Driver to Students Group:**
```
GET /api/messages/group/driver_673drv123abc456789_students?limit=15
```

**Sample Output:**
```json
{
  "groupId": "driver_673drv123abc456789_students",
  "groupName": "Bus AP39TS1234 - Vijayawada to VIT AP",
  "messages": [
    {
      "groupId": "driver_673drv123abc456789_students",
      "groupName": "Bus AP39TS1234 - Vijayawada to VIT AP",
      "sender": {
        "id": "673drv123abc456789",
        "name": "Rajesh Kumar",
        "role": "driver"
      },
      "content": "Bus will be delayed by 30 minutes due to tire puncture. Currently at Gannavaram.",
      "timestamp": "2025-11-05T08:15:00",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP",
      "recipientType": "students"
    },
    {
      "groupId": "driver_673drv123abc456789_students",
      "groupName": "Bus AP39TS1234 - Vijayawada to VIT AP",
      "sender": {
        "id": "673drv123abc456789",
        "name": "Rajesh Kumar",
        "role": "driver"
      },
      "content": "Bus running 10 minutes early today. Please be ready at your stops.",
      "timestamp": "2025-11-04T07:20:00",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP",
      "recipientType": "students"
    }
  ]
}
```

**Sample Request 4 - Route Students Group:**
```
GET /api/messages/group/route_Vijayawada_to_VIT_AP_students?limit=10
```

**Sample Output:**
```json
{
  "groupId": "route_Vijayawada_to_VIT_AP_students",
  "groupName": "Vijayawada to VIT AP - Students",
  "messages": [
    {
      "groupId": "route_Vijayawada_to_VIT_AP_students",
      "groupName": "Vijayawada to VIT AP - Students",
      "sender": {
        "id": "673admin123abc456",
        "name": "Dr. Admin",
        "role": "admin"
      },
      "content": "Route delayed by 15 minutes due to heavy traffic on NH16. All buses affected.",
      "timestamp": "2025-11-05T07:30:00",
      "route": "Vijayawada to VIT AP",
      "recipientType": "students"
    },
    {
      "groupId": "route_Vijayawada_to_VIT_AP_students",
      "groupName": "Vijayawada to VIT AP - Students",
      "sender": {
        "id": "673admin123abc456",
        "name": "Dr. Admin",
        "role": "admin"
      },
      "content": "New stop added at Gannavaram Bus Stand from tomorrow. Check updated schedule.",
      "timestamp": "2025-11-03T10:00:00",
      "route": "Vijayawada to VIT AP",
      "recipientType": "students"
    }
  ]
}
```

---

## 🚨 ERROR RESPONSES

### Error 1: Authentication Required (401)
```json
{
  "detail": "Not authenticated"
}
```

### Error 2: Access Denied (403)
```json
{
  "detail": "Admin access only"
}
```

### Error 3: Student Access Only (403)
```json
{
  "detail": "Student access only"
}
```

### Error 4: Driver Access Only (403)
```json
{
  "detail": "Driver access only"
}
```

### Error 5: No Bus Assigned (400)
```json
{
  "detail": "No bus assigned to student"
}
```

### Error 6: No Bus Assigned to Driver (404)
```json
{
  "detail": "No bus assigned to driver"
}
```

### Error 7: Route Not Found (404)
```json
{
  "detail": "Route not found"
}
```

### Error 8: Group Not Found (404)
```json
{
  "detail": "Group not found"
}
```

### Error 9: Access Denied to Group (403)
```json
{
  "detail": "Access denied to this group"
}
```

### Error 10: Complaint Not Found (404)
```json
{
  "detail": "Complaint not found"
}
```

---

## 🧪 TESTING GUIDE

### Step 1: Login
```bash
POST /api/auth/login
{
  "email": "student@vitap.ac.in",
  "password": "password123"
}

# Save the token from response
```

### Step 2: Test Student Features
```bash
# Get groups
curl -X GET http://localhost:8000/api/messages/student/my-groups \
  -H "Authorization: Bearer <token>"

# Send message
curl -X POST http://localhost:8000/api/messages/student/send-message \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello everyone!"}'

# Get bus group info
curl -X GET http://localhost:8000/api/messages/student/bus-group \
  -H "Authorization: Bearer <token>"

# Submit complaint
curl -X POST http://localhost:8000/api/messages/student/complaint \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"category": "bus_issue", "description": "AC not working"}'
```

### Step 3: Test Driver Features
```bash
# Login as driver first
# Then send alert
curl -X POST http://localhost:8000/api/messages/driver/send-to-students \
  -H "Authorization: Bearer <driver_token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Bus delayed 30 mins"}'
```

### Step 4: Test Admin Features
```bash
# Login as admin first
# Broadcast to all students
curl -X POST http://localhost:8000/api/messages/admin/broadcast/all-students \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Campus closed tomorrow"}'

# Get complaints
curl -X GET http://localhost:8000/api/admin/complaints \
  -H "Authorization: Bearer <admin_token>"
```

---

## 📊 SUMMARY

### Total Messaging Endpoints: 14

**Admin Endpoints (6):**
1. POST /api/messages/admin/broadcast/all-students
2. POST /api/messages/admin/broadcast/route
3. POST /api/messages/admin/broadcast/all-drivers
4. POST /api/messages/admin/broadcast/route-drivers
5. GET /api/admin/complaints
6. PATCH /api/admin/complaints/{id}

**Driver Endpoints (2):**
1. POST /api/messages/driver/send-to-students
2. GET /api/messages/driver/my-groups

**Student Endpoints (5):**
1. GET /api/messages/student/my-groups
2. POST /api/messages/student/send-message ⭐
3. GET /api/messages/student/bus-group ⭐
4. POST /api/messages/student/complaint
5. GET /api/messages/student/my-complaints

**Common Endpoint (1):**
1. GET /api/messages/group/{group_id} - All users with access

---

**All messaging endpoints documented with complete sample inputs and outputs! 🎉**
