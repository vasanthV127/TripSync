# 📨 Student Messaging Endpoints - Complete Guide

## ✨ Updated Endpoints

**Changes Made:**
- ❌ Removed `/api/messages/student/my-groups` - No longer needed
- ❌ Removed `/api/messages/student/bus-group` - Merged into bus-chat
- ❌ Removed `/api/messages/group/{group_id}` - Too generic
- ✅ **NEW** `/api/messages/student/driver-messages` - Get driver alerts
- ✅ **NEW** `/api/messages/student/bus-chat` - Get student chat + members

---

## 🔐 Authentication

All endpoints require JWT token:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 1️⃣ Get Driver Messages

**Endpoint:** `GET /api/messages/student/driver-messages`  
**Role:** Student only  
**Description:** Get all messages sent by your bus driver

**Query Parameters:**
- `limit` (optional, default: 50) - Number of messages
- `skip` (optional, default: 0) - Skip for pagination

**Sample Request:**
```
GET /api/messages/student/driver-messages?limit=20
```

**Sample Output:**
```json
{
  "busNumber": "AP39TS1234",
  "driverName": "Rajesh Kumar",
  "groupId": "driver_673drv123abc456789_students",
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
      "route": "Vijayawada to VIT AP"
    },
    {
      "groupId": "driver_673drv123abc456789_students",
      "groupName": "Bus AP39TS1234 - Vijayawada to VIT AP",
      "sender": {
        "id": "673drv123abc456789",
        "name": "Rajesh Kumar",
        "role": "driver"
      },
      "content": "Bus running 10 minutes early today. Please be ready.",
      "timestamp": "2025-11-04T07:20:00",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP"
    },
    {
      "groupId": "driver_673drv123abc456789_students",
      "groupName": "Bus AP39TS1234 - Vijayawada to VIT AP",
      "sender": {
        "id": "673drv123abc456789",
        "name": "Rajesh Kumar",
        "role": "driver"
      },
      "content": "Taking alternate route today due to road work on NH16.",
      "timestamp": "2025-11-03T07:00:00",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP"
    }
  ],
  "count": 3
}
```

**When No Driver/No Messages:**
```json
{
  "busNumber": "AP39TS1234",
  "messages": [],
  "count": 0
}
```

---

## 2️⃣ Get Bus Chat (Student-to-Student)

**Endpoint:** `GET /api/messages/student/bus-chat`  
**Role:** Student only  
**Description:** Get chat messages from students on your bus + member list

**Query Parameters:**
- `limit` (optional, default: 50) - Number of messages
- `skip` (optional, default: 0) - Skip for pagination

**Sample Request:**
```
GET /api/messages/student/bus-chat?limit=30
```

**Sample Output:**
```json
{
  "groupId": "bus_AP39TS1234_students",
  "busNumber": "AP39TS1234",
  "route": "Vijayawada to VIT AP",
  "memberCount": 45,
  "members": [
    {
      "name": "Ravi Kumar",
      "roll_no": "21BCE0001",
      "email": "ravi@vitap.ac.in",
      "phone": "+91-9876543211",
      "boarding": "Gannavaram Circle",
      "assignedBus": "AP39TS1234"
    },
    {
      "name": "Priya Sharma",
      "roll_no": "21BCE0002",
      "email": "priya@vitap.ac.in",
      "phone": "+91-9876543212",
      "boarding": "Vijayawada Junction",
      "assignedBus": "AP39TS1234"
    }
    // ... 43 more students
  ],
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
      "content": "Thanks! Also, anyone going to the workshop tomorrow?",
      "timestamp": "2025-11-05T09:50:00",
      "busNumber": "AP39TS1234",
      "route": "Vijayawada to VIT AP"
    }
  ],
  "messageCount": 3,
  "lastMessage": "Thanks! Also, anyone going to the workshop tomorrow?",
  "lastMessageTime": "2025-11-05T09:50:00",
  "lastSender": "Amit Singh"
}
```

---

## 3️⃣ Send Message to Bus Chat

**Endpoint:** `POST /api/messages/student/send-message`  
**Role:** Student only  
**Description:** Send message to your bus student group

**Sample Input 1 - Ask for Help:**
```json
{
  "content": "Hey everyone! Does anyone have notes from yesterday's lecture?"
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
  "content": "Did anyone find a blue notebook in the bus?"
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
  "content": "Is everyone ready? Bus leaves in 10 minutes!"
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

---

## 4️⃣ Submit Complaint

**Endpoint:** `POST /api/messages/student/complaint`  
**Role:** Student only

**Sample Input:**
```json
{
  "category": "rash_driving",
  "description": "Driver was driving very fast and overtaking dangerously on NH16",
  "busNumber": "AP39TS1234"
}
```

**Categories:**
- `rash_driving` - Dangerous driving
- `lost_found` - Lost items in bus
- `bus_issue` - AC, seats, maintenance
- `other` - Other issues

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
    "description": "Driver was driving very fast and overtaking dangerously on NH16",
    "busNumber": "AP39TS1234",
    "route": "Vijayawada to VIT AP",
    "status": "pending",
    "submittedAt": "2025-11-05T10:15:00",
    "adminResponse": null
  }
}
```

---

## 5️⃣ Get My Complaints

**Endpoint:** `GET /api/messages/student/my-complaints`  
**Role:** Student only

**Sample Output:**
```json
{
  "complaints": [
    {
      "_id": "673cmp123abc456789",
      "studentName": "Ravi Kumar",
      "rollNo": "21BCE0001",
      "category": "rash_driving",
      "description": "Driver was driving very fast",
      "busNumber": "AP39TS1234",
      "status": "in_progress",
      "submittedAt": "2025-11-05T10:15:00",
      "adminResponse": "We are investigating this matter",
      "updatedAt": "2025-11-05T14:30:00"
    },
    {
      "_id": "673cmp456def789012",
      "studentName": "Ravi Kumar",
      "rollNo": "21BCE0001",
      "category": "lost_found",
      "description": "Lost notebook in bus",
      "busNumber": "AP39TS1234",
      "status": "resolved",
      "submittedAt": "2025-11-03T09:00:00",
      "adminResponse": "Your notebook is at admin office",
      "updatedAt": "2025-11-04T11:00:00"
    }
  ]
}
```

---

## 🎯 Complete Student Workflow

### Morning: Check Driver Updates
```bash
# 1. Login
POST /api/auth/login
{
  "email": "student@vitap.ac.in",
  "password": "password123"
}

# 2. Check if driver sent any alerts
GET /api/messages/student/driver-messages?limit=5

# Shows: "Bus delayed 30 mins", "Running early", etc.
```

### During Day: Chat with Bus Mates
```bash
# 3. Check bus chat
GET /api/messages/student/bus-chat?limit=20

# 4. Send message
POST /api/messages/student/send-message
{
  "content": "Anyone have notes from yesterday?"
}

# 5. Check responses
GET /api/messages/student/bus-chat?limit=20
```

### Report Issue
```bash
# 6. Submit complaint if needed
POST /api/messages/student/complaint
{
  "category": "bus_issue",
  "description": "AC not working"
}

# 7. Check complaint status
GET /api/messages/student/my-complaints
```

---

## 🔄 Pagination Examples

**First Page:**
```
GET /api/messages/student/bus-chat?limit=20&skip=0
```

**Second Page:**
```
GET /api/messages/student/bus-chat?limit=20&skip=20
```

**Third Page:**
```
GET /api/messages/student/bus-chat?limit=20&skip=40
```

---

## 🧪 Testing with cURL

### Get Driver Messages
```bash
curl -X GET "http://localhost:8000/api/messages/student/driver-messages" \
  -H "Authorization: Bearer <token>"
```

### Get Bus Chat
```bash
curl -X GET "http://localhost:8000/api/messages/student/bus-chat?limit=10" \
  -H "Authorization: Bearer <token>"
```

### Send Message
```bash
curl -X POST "http://localhost:8000/api/messages/student/send-message" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello everyone!"}'
```

### Submit Complaint
```bash
curl -X POST "http://localhost:8000/api/messages/student/complaint" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"category": "bus_issue", "description": "AC not working"}'
```

---

## 📊 Summary

### Student Messaging Endpoints (5 Total):

| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 1 | `/api/messages/student/driver-messages` | GET | Get driver alerts |
| 2 | `/api/messages/student/bus-chat` | GET | Get student chat + members |
| 3 | `/api/messages/student/send-message` | POST | Send to bus chat |
| 4 | `/api/messages/student/complaint` | POST | Submit complaint |
| 5 | `/api/messages/student/my-complaints` | GET | View complaints |

### Key Features:

✅ **Two Message Sources:**
- Driver → Students (one-way alerts)
- Students ↔ Students (two-way chat)

✅ **No Global Chat:**
- Only bus-specific communication
- Members list included in bus-chat response

✅ **Simplified:**
- Removed redundant endpoints
- Clear separation between driver messages and student chat
- Everything you need in two GET endpoints

---

## 🚨 Error Responses

**No Bus Assigned (400):**
```json
{
  "detail": "No bus assigned to student"
}
```

**Unauthorized (403):**
```json
{
  "detail": "Student access only"
}
```

**Not Authenticated (401):**
```json
{
  "detail": "Not authenticated"
}
```

---

## 📱 Mobile App Integration

```javascript
// React Native / Flutter Example

// 1. Get driver updates (show as notifications)
const driverMessages = await fetch(
  '/api/messages/student/driver-messages?limit=5',
  { headers: { 'Authorization': `Bearer ${token}` }}
);

// 2. Show bus chat screen
const busChat = await fetch(
  '/api/messages/student/bus-chat?limit=50',
  { headers: { 'Authorization': `Bearer ${token}` }}
);

// busChat.data includes:
// - messages[] - All chat messages
// - members[] - All 45 students on bus
// - memberCount - Total members
// - lastMessage, lastMessageTime

// 3. Send message
const send = await fetch('/api/messages/student/send-message', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: userInput
  })
});

// 4. Reload chat
// (repeat step 2)
```

---

**Simple, focused, and bus-specific messaging! 🚌💬**
