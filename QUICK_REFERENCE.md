# 🚌 Student Messaging - Quick Reference Card

## 📨 Two Simple Endpoints for Messages

### 1. Driver Alerts (One-Way)
```bash
GET /api/messages/student/driver-messages
```
**Returns:** Messages from your bus driver
- Delays, route changes, issues
- Read-only alerts

### 2. Bus Chat (Two-Way) 
```bash
GET /api/messages/student/bus-chat
```
**Returns:** Student chat + all 45 members
- Messages from bus mates
- Full member list included

---

## 📤 Send Message

```bash
POST /api/messages/student/send-message
{
  "content": "Your message here"
}
```

---

## 🚨 Submit Complaint

```bash
POST /api/messages/student/complaint
{
  "category": "rash_driving",  // or lost_found, bus_issue, other
  "description": "Details here",
  "busNumber": "AP39TS1234"
}
```

---

## 📋 View Complaints

```bash
GET /api/messages/student/my-complaints
```

---

## 💡 Quick Examples

### Check if driver sent any updates:
```bash
GET /api/messages/student/driver-messages?limit=5
```

### View bus chat:
```bash
GET /api/messages/student/bus-chat?limit=20
```

### Send message to bus mates:
```bash
POST /api/messages/student/send-message
{"content": "Anyone going to library?"}
```

### Report issue:
```bash
POST /api/messages/student/complaint
{
  "category": "bus_issue",
  "description": "AC not working"
}
```

---

## 🎯 That's It!

**5 endpoints, everything you need:**
1. Driver messages ← alerts
2. Bus chat ← student messages + members
3. Send message → to bus mates
4. Submit complaint → to admin
5. View complaints ← status tracking

**No complicated group IDs. No global chat. Just bus communication.** 🚀

---

## 📱 Mobile App Screens

### Screen 1: Driver Alerts
```
📢 Driver Updates
├─ "Bus delayed 30 mins - tire puncture"
├─ "Bus running early today"
└─ "Taking alternate route"
```

### Screen 2: Bus Chat
```
💬 Bus AP39TS1234 (45 members)
├─ Ravi: "Anyone have notes?"
├─ Priya: "Yes! I'll share"
└─ Amit: "Thanks!"

👥 Members: Ravi, Priya, Amit, Sneha...
```

### Screen 3: Complaints
```
📋 My Complaints
├─ ✅ Lost notebook - Resolved
├─ ⏳ AC issue - In Progress
└─ + Submit New Complaint
```

---

**Simple. Focused. Bus-specific. Perfect! 🎉**
