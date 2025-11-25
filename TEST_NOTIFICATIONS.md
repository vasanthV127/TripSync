# Testing Notifications - Quick Guide

## What Was Fixed

### Issues:
1. ❌ Old file wasn't replaced properly
2. ❌ `getMyComplaints` returned wrong format
3. ❌ No console logs for debugging
4. ❌ Sorting crash on datetime strings

### Fixes Applied:
1. ✅ Replaced notification screen file correctly
2. ✅ Fixed `getMyComplaints` to return `{complaints: [...]}`
3. ✅ Added console logs to track data flow
4. ✅ Removed broken datetime sort (already sorted by backend)

## How to Test

### Step 1: Restart App
```bash
# In terminal, press Ctrl+C to stop
# Then restart:
npx expo start --clear
```

### Step 2: Check Logs
Open the app and watch the terminal. You should see:
```
Fetching notifications...
Driver messages response: {messages: [...], count: 1}
Complaints response: {complaints: [...]}
Total notifications: 2
```

### Step 3: Pull to Refresh
- Swipe down on the notifications screen
- You should see a spinning refresh indicator
- After 1-2 seconds, notifications reload

### Step 4: Check What Shows
You should see **2 notifications**:

1. **Driver Message** (Blue 📣 icon)
   - Sender: "Driver" or "Rajesh Kumar"
   - Message: "Hello students! This is a test message..."
   - Time: "Just now" or "X mins ago"

2. **Admin Response** (Orange 💬 icon)
   - Sender: "Admin Response"
   - Message: "Thank you for reporting this issue..."
   - Status Badge: 🟢 "RESOLVED"
   - Time: "Just now" or "X mins ago"

## If No Messages Show

### Debug Steps:

1. **Check Console Logs**
   ```
   Fetching notifications...
   Driver messages response: {messages: [], count: 0}  ← EMPTY!
   Complaints response: {complaints: []}  ← EMPTY!
   ```

2. **If Empty - Send Test Data**
   I already sent test messages via API. They should be in database.
   
3. **Check Token**
   ```
   # Look for this in logs:
   Error fetching notifications: Error: No token found
   ```
   If you see this, logout and login again.

4. **Check API Response**
   Look for network errors in console like:
   ```
   Error fetching notifications: [Error: Network request failed]
   ```

## Expected Current State

Based on my API tests, the database currently has:

### Driver Messages (1):
- From: Driver (Rajesh Kumar)
- To: All students on bus AP29A1234 (12 students)
- Content: "Hello students! This is a test message from your driver. Please acknowledge."
- Timestamp: 2025-11-25 10:10:30

### Complaint Responses (1):
- Student: Student1 (22BEC7001)
- Complaint: "Test complaint from API"
- Admin Response: "Thank you for reporting this issue. Our maintenance team will inspect the bus and fix the problem within 24 hours."
- Status: resolved

So you should see **exactly 2 notifications** when logged in as student1@example.com.

## Still Not Working?

Share the console output with me. Look for:
1. The "Fetching notifications..." log
2. The response objects logged
3. Any error messages

This will tell us exactly what's happening! 🔍
