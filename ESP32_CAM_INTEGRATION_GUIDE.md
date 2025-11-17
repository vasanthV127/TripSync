# ESP32-CAM Face Recognition Integration Guide

## 📋 Overview

This integration adds automated attendance marking using ESP32-CAM with face recognition, GPS tracking, and real-time MQTT communication.

## 🔧 Hardware Requirements

### Required Components
- **ESP32-CAM** (AI-Thinker module)
- **ESP32-CAM MB** (programmer board)
- **GPS Module** (NEO-6M or similar) - Optional but recommended
- **Micro USB cable**
- **Power supply** (5V for ESP32-CAM)

### Optional Components
- External antenna for better WiFi range
- SD card for local image storage
- External LED indicators

## 📦 Software Installation

### Backend Setup

1. **Install Python dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

This will install:
- `deepface` - Face recognition library
- `tensorflow` - Deep learning backend
- `opencv-python` - Image processing
- `scipy` - Distance calculations
- `paho-mqtt` - MQTT client
- `python-multipart` - File upload support

2. **First-time model download:**

DeepFace will automatically download the Facenet512 model (~100MB) on first use. This may take a few minutes.

3. **Start the backend:**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 3000
```

### Frontend Setup

The face enrollment component is already integrated into the admin dashboard.

**Usage:**
1. Navigate to Students section in admin panel
2. Click "Enroll Face" button next to student name
3. Upload 3 images: Front, Left, Right views
4. System will process and store face encodings

## 🎯 ESP32-CAM Setup

### 1. Arduino IDE Configuration

**Install ESP32 board:**
1. Open Arduino IDE
2. File → Preferences
3. Add to "Additional Board Manager URLs":
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Tools → Board → Board Manager
5. Search "esp32" and install

**Install required libraries:**
1. Sketch → Include Library → Manage Libraries
2. Install:
   - `TinyGPS++` (by Mikal Hart)
   - `ArduinoJson` (by Benoit Blanchon)
   - `PubSubClient` (by Nick O'Leary)

### 2. Hardware Connections

**GPS Module (Optional):**
```
GPS Module → ESP32-CAM
VCC        → 3.3V
GND        → GND
TX         → GPIO13 (RX2)
RX         → GPIO12 (TX2)
```

**Power:**
- Use 5V power supply (NOT 3.3V)
- Current requirement: 500mA minimum

### 3. Upload Code

1. Open `ESP32_CAM_TripSync.ino`
2. Update configuration:
   ```cpp
   const char* WIFI_SSID = "YourWiFiName";
   const char* WIFI_PASSWORD = "YourWiFiPassword";
   const char* SERVER_URL = "http://YOUR_SERVER_IP:3000/api/face/recognize-attendance";
   const char* BUS_NUMBER = "Bus1";  // Change for each bus
   const char* DEVICE_ID = "ESP32CAM_001";  // Unique ID
   ```
3. Connect ESP32-CAM to computer via programmer board
4. Select: Tools → Board → AI Thinker ESP32-CAM
5. Select correct COM port
6. Press and hold **IO0/BOOT** button
7. Click Upload
8. Release button when "Connecting..." appears

## 🔄 System Workflow

### 1. Student Enrollment (Admin)

```
Admin Dashboard → Students → Enroll Face
   ↓
Upload 3 images (Front, Left, Right)
   ↓
Backend processes with DeepFace
   ↓
Face encodings stored in database
   ↓
Student marked as "face_enrolled: true"
```

### 2. Automated Attendance (ESP32-CAM)

```
ESP32-CAM captures image every 10 seconds
   ↓
Reads GPS coordinates
   ↓
Sends image + GPS + bus info to backend
   ↓
Backend recognizes face using DeepFace
   ↓
Validates student assigned to bus
   ↓
Marks attendance in database
   ↓
Returns result to ESP32-CAM
   ↓
LED blinks based on result
```

### 3. Real-time Location (MQTT)

```
ESP32-CAM reads GPS every second
   ↓
Publishes location every 5 seconds via MQTT
   ↓
Backend MQTT service receives location
   ↓
Updates bus location in database
   ↓
Frontend displays on map in real-time
```

## 📡 API Endpoints

### Face Enrollment (Admin)
```http
POST /api/face/enroll
Content-Type: multipart/form-data

Form Data:
- roll_no: string
- front_image: file
- left_image: file
- right_image: file

Response:
{
  "status": "success",
  "message": "Face enrollment successful",
  "encoded_views": ["front", "left", "right"],
  "total_encodings": 3
}
```

### Face Recognition (ESP32-CAM)
```http
POST /api/face/recognize-attendance
Content-Type: multipart/form-data

Form Data:
- image: file (captured face)
- bus_number: string
- device_id: string
- latitude: float
- longitude: float

Response:
{
  "success": true,
  "message": "✓ Attendance marked for John Doe",
  "roll_no": "22BEC7001",
  "name": "John Doe",
  "confidence": 0.95,
  "time": "09:15:30",
  "led_pattern": "success_blink"
}
```

### System Status
```http
GET /api/face/status

Response:
{
  "status": "online",
  "model": "Facenet512",
  "detector": "opencv",
  "enrolled_students": 25,
  "total_encodings": 75
}
```

## 🔌 MQTT Topics

### Location Updates (ESP32 → Backend)
```
Topic: tripsync/bus/{BUS_NUMBER}/location
Payload: {
  "bus_number": "Bus1",
  "device_id": "ESP32CAM_001",
  "latitude": 16.5062,
  "longitude": 80.6480,
  "timestamp": 1234567890
}
```

### Commands (Backend → ESP32)
```
Topic: tripsync/bus/{BUS_NUMBER}/command
Payload: {
  "command": "capture",
  "timestamp": 1234567890
}
```

## 🚨 LED Patterns

ESP32-CAM built-in LED indicates recognition results:

| Pattern | Meaning |
|---------|---------|
| **3 fast blinks** | ✓ Attendance marked successfully |
| **2 medium blinks** | Already marked today |
| **1 slow blink** | Unknown person / No match |
| **5 rapid blinks** | Error (wrong bus, network issue) |

## 🐛 Troubleshooting

### Camera Issues

**"Camera init failed"**
- Check camera ribbon cable connection
- Ensure cable inserted in correct orientation
- Try different power supply

**"No face detected"**
- Improve lighting conditions
- Move closer to camera (1-2 meters)
- Ensure face is clearly visible
- Adjust camera angle

### Network Issues

**"WiFi won't connect"**
- Verify SSID and password
- Use 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- Check WiFi signal strength
- Disable MAC filtering temporarily

**"HTTP Error"**
- Verify server URL and port
- Check firewall settings
- Ensure both devices on same network
- Test server: `http://YOUR_IP:3000/health`

### Recognition Issues

**"Unknown person" for enrolled student**
- Re-enroll with better quality images
- Ensure good lighting during capture
- Add more face encodings (re-upload)
- Check confidence threshold in settings

**"Wrong bus" error**
- Verify student assigned to correct bus in database
- Check BUS_NUMBER constant in ESP32 code
- Update student assignment in admin panel

### GPS Issues

**No GPS location**
- Check GPS module connections
- Wait for GPS fix (may take 1-2 minutes outdoors)
- Ensure GPS antenna has clear view of sky
- System uses fallback location if GPS unavailable

## 📊 Performance Tips

### Image Quality
- Use good lighting (natural or LED)
- Avoid direct sunlight or backlighting
- Clean camera lens regularly
- Use flash LED in low light (optional)

### Recognition Accuracy
- Enroll 3-5 images per student
- Vary facial expressions slightly
- Include images with/without glasses
- Update encodings periodically

### Network Optimization
- Place ESP32-CAM within WiFi range
- Use external antenna for better signal
- Reduce CAPTURE_INTERVAL if needed
- Monitor network bandwidth

## 🔐 Security Considerations

### Current Implementation
- Face encodings stored locally (not images)
- MQTT uses public broker (unencrypted)
- HTTP communication (not HTTPS)

### Production Recommendations
1. **Use HTTPS** for API communication
2. **Private MQTT broker** with authentication
3. **Encrypt face encodings** in database
4. **Rate limiting** on API endpoints
5. **Token authentication** for ESP32
6. **Secure WiFi** (WPA3 if available)

## 📈 Scaling

### Multiple ESP32-CAM Devices
- Use unique DEVICE_ID for each unit
- Unique BUS_NUMBER per bus
- MQTT automatically handles multiple publishers
- Database tracks device_id in attendance records

### Large Student Base
- Face database loads on startup (cached in memory)
- ~75 encodings (25 students × 3 views) = ~5MB RAM
- For 1000+ students, consider batching or clustering

## 🎯 Testing Checklist

- [ ] Backend running with all dependencies
- [ ] MQTT service connected
- [ ] At least one student face enrolled
- [ ] ESP32-CAM connected to WiFi
- [ ] GPS module getting fix (if used)
- [ ] Camera capturing clear images
- [ ] Recognition returning results
- [ ] Attendance being marked in database
- [ ] Location updates via MQTT working
- [ ] LED patterns working correctly

## 📞 Support

For issues or questions:
1. Check logs in Serial Monitor (115200 baud)
2. Test backend: `http://YOUR_IP:3000/docs`
3. Verify MQTT: Use MQTT Explorer app
4. Check face database: `GET /api/face/status`

---

**Last Updated:** November 16, 2025
**Version:** 1.0.0
