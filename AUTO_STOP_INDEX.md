# 🎯 Automatic currentStopIndex Update

## What Changed

Both Flask and FastAPI backends now **automatically update `currentStopIndex`** when you manually update bus location or when hardware (MQTT) sends GPS updates.

## How It Works

### Distance-Based Logic

When a bus location is updated:
1. Calculate distance from new GPS position to all stops in the route
2. Find the closest stop
3. If distance < 500 meters → bus is AT that stop (currentStopIndex = that stop's index)
4. If distance > 500 meters → bus is BETWEEN stops (currentStopIndex = previous stop's index)

### Example Calculation

**Route: Vijayawada to VIT AP**
- Stop 0: Vijayawada (16.5062, 80.6480)
- Stop 1: Mangalagiri (16.4300, 80.5600)
- Stop 2: Undavalli (16.4950, 80.6150)
- Stop 3: Tadepalli (16.4800, 80.6000)
- Stop 4: Amaravati (16.5183, 80.6183)

**Scenario 1: Bus is near Undavalli**
```
Manual update: lat=16.4960, long=80.6140
Distance to Undavalli: 120 meters (< 500m threshold)
→ currentStopIndex = 2
→ Coverage status: [passed, passed, CURRENT, upcoming, upcoming]
```

**Scenario 2: Bus is between Undavalli and Tadepalli**
```
Manual update: lat=16.4875, long=80.6075
Distance to Undavalli: 850 meters
Distance to Tadepalli: 650 meters (closest)
→ Bus is between stops, so currentStopIndex = 2 (previous stop)
→ Coverage status: [passed, passed, CURRENT, upcoming, upcoming]
```

**Scenario 3: Bus reaches Tadepalli**
```
Manual update: lat=16.4805, long=80.6005
Distance to Tadepalli: 80 meters (< 500m threshold)
→ currentStopIndex = 3
→ Coverage status: [passed, passed, passed, CURRENT, upcoming]
```

## Updated Endpoints

### Flask (Port 3000)

#### POST /api/update_bus_location
**Request:**
```json
{
  "busNumber": "Bus1",
  "lat": 16.4960,
  "long": 80.6140
}
```

**Response:**
```json
{
  "message": "Updated",
  "currentStopIndex": 2,  // ← Automatically calculated!
  "coveragePoints": [
    {"name": "Vijayawada", "lat": 16.5062, "long": 80.648, "order": 0, "status": "passed"},
    {"name": "Mangalagiri", "lat": 16.43, "long": 80.56, "order": 1, "status": "passed"},
    {"name": "Undavalli", "lat": 16.495, "long": 80.615, "order": 2, "status": "current"},
    {"name": "Tadepalli", "lat": 16.48, "long": 80.6, "order": 3, "status": "upcoming"},
    {"name": "Amaravati (VIT AP)", "lat": 16.5183, "long": 80.6183, "order": 4, "status": "upcoming"}
  ]
}
```

### FastAPI (Port 8000)

#### POST /api/buses/location
Same request/response format as Flask above.

### MQTT Hardware Updates

**MQTT Topic:** `bus/gps`

**Payload:**
```json
{
  "busNumber": "Bus1",
  "location": {
    "lat": 16.4960,
    "long": 80.6140
  }
}
```

**What Happens:**
1. Backend receives MQTT message
2. Calculates new `currentStopIndex` based on proximity
3. Updates database: `currentLocation` + `currentStopIndex`
4. Emits socket event `bus_update` with updated `coveragePoints` (including status)

**Socket Emit:**
```json
{
  "busNumber": "Bus1",
  "lat": 16.4960,
  "long": 80.6140,
  "coveragePoints": [ /* with updated status */ ]
}
```

## Testing It

### Test 1: Move bus to Undavalli
```bash
# Flask
curl -X POST http://localhost:3000/api/update_bus_location \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"busNumber":"Bus1","lat":16.495,"long":80.615}'

# FastAPI
curl -X POST http://localhost:8000/api/buses/location \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"busNumber":"Bus1","lat":16.495,"long":80.615}'
```

**Expected:** `currentStopIndex` = 2, Undavalli shows `"status": "current"`

### Test 2: Move bus to Tadepalli
```bash
curl -X POST http://localhost:8000/api/buses/location \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"busNumber":"Bus1","lat":16.48,"long":80.6}'
```

**Expected:** `currentStopIndex` = 3, Tadepalli shows `"status": "current"`, Undavalli shows `"status": "passed"`

### Test 3: Check updated bus data
```bash
# Get all buses
curl http://localhost:8000/api/buses \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get student's bus (as student)
curl http://localhost:8000/api/students/me/bus \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

**Expected:** Both will show the updated `currentStopIndex` and correct coverage point statuses.

## Timeline UI Example

After manual update, your frontend can now simply render:

```javascript
function renderTimeline(coveragePoints) {
  const icons = { passed: '✅', current: '🚌', upcoming: '○' };
  
  return coveragePoints.map(point => 
    `<div class="point ${point.status}">
      ${icons[point.status]} ${point.name}
    </div>`
  ).join('');
}
```

**Visual Output (after moving bus to Undavalli):**
```
✅ Vijayawada
✅ Mangalagiri
🚌 Undavalli      ← Bus is here (currentStopIndex = 2)
○ Tadepalli
○ Amaravati (VIT AP)
```

## Summary

✅ **Manual updates** (POST /api/update_bus_location, POST /api/buses/location) → auto-calculate `currentStopIndex`
✅ **MQTT hardware** (bus/gps topic) → auto-calculate `currentStopIndex`
✅ **Coverage points** → always reflect current bus position status
✅ **500m threshold** → determines if bus is AT a stop or BETWEEN stops

No more manual `currentStopIndex` management needed!
