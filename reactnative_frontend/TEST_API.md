# API Testing Guide

## Test the APIs directly in your app console

Open the app, then in the console run:

```javascript
// 1. Test if token exists
AsyncStorage.getItem("token").then(token => console.log("Token:", token));

// 2. Test login
fetch("https://tripsync-uh0i.onrender.com/api/login", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({email: "student1@example.com", password: "default"})
})
.then(r => r.json())
.then(d => console.log("Login:", d));

// 3. After login, test bus API (replace TOKEN with actual token)
fetch("https://tripsync-uh0i.onrender.com/api/students/me/bus", {
  headers: {"Authorization": "Bearer YOUR_TOKEN_HERE"}
})
.then(r => r.json())
.then(d => console.log("Bus:", d));

// 4. Test driver API
fetch("https://tripsync-uh0i.onrender.com/api/students/me/driver", {
  headers: {"Authorization": "Bearer YOUR_TOKEN_HERE"}
})
.then(r => r.json())
.then(d => console.log("Driver:", d));
```

## Expected Results

### Login Response:
```json
{
  "token": "eyJhbGc...",
  "role": "student"
}
```

### Bus Response:
```json
{
  "bus": {
    "number": "AP29A1234",
    "route": "Vijayawada to VIT AP",
    "currentLocation": {
      "lat": 16.494391,
      "long": 80.500548
    },
    "coveragePoints": [...]
  }
}
```

### Driver Response:
```json
{
  "driver": {
    "name": "Rajesh Kumar",
    "email": "rajesh.kumar@tripsync.com",
    "phone": "9000000000"
  }
}
```

## Common Issues

1. **No token found** - User not logged in yet
2. **401 Unauthorized** - Token expired or invalid
3. **404 Not Found** - Bus/Driver not assigned
4. **Network error** - Backend server down

## Login Credentials for Testing

- **Email:** student1@example.com
- **Password:** default

## Check Console Logs

Look for these messages:
- ✅ "Fetching bus data..."
- ✅ "Bus data received: {object}"
- ✅ "Fetching driver data..."
- ✅ "Driver data received: {object}"
- ✅ "Store updated with bus and driver info"

OR errors:
- ❌ "No token found, skipping bus fetch"
- ❌ "Bus/Driver fetch error: ..."
- ❌ "API Error: GET /api/students/me/bus - 404 ..."
