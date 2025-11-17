/*
 * ESP32-CAM TripSync Integration
 * 
 * Features:
 * - Face capture and recognition via FastAPI backend
 * - GPS location tracking
 * - MQTT for real-time location updates
 * - Automated attendance marking
 * 
 * Hardware Required:
 * - ESP32-CAM (AI-Thinker)
 * - GPS Module (NEO-6M or similar) - Optional but recommended
 * 
 * Connections:
 * GPS Module:
 *   VCC -> 3.3V
 *   GND -> GND
 *   TX -> GPIO13 (RX2)
 *   RX -> GPIO12 (TX2)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <PubSubClient.h>
#include "esp_camera.h"
#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <ArduinoJson.h>

// ==================== CONFIGURATION ====================

// WiFi credentials
const char* WIFI_SSID = "DESKTOP-GKDLKET 6501";
const char* WIFI_PASSWORD = "Q}89295z";

// Server configuration
const char* SERVER_URL = "http://172.18.108.241:8000/api/face/recognize-attendance";  // Updated to port 8000

// MQTT configuration
const char* MQTT_BROKER = "broker.hivemq.com";  // Must match backend broker
const int MQTT_PORT = 1883;
const char* MQTT_CLIENT_ID = "ESP32CAM_AP29A1234";  // Change for each device

// Bus configuration
const char* BUS_NUMBER = "AP29A1234";  // Bus number
const char* DEVICE_ID = "ESP32CAM_001";  // Unique device identifier

// Hardcoded GPS coordinates - VIT-AP MH1 Hostel
const double FIXED_LATITUDE = 16.5096;   // VIT-AP MH1 Hostel latitude
const double FIXED_LONGITUDE = 80.6470;  // VIT-AP MH1 Hostel longitude
const bool USE_HARDCODED_GPS = true;     // Set to true to use fixed location

// Feature flags
const bool ENABLE_MQTT = true;  // Set to true to enable MQTT for bus location tracking

// ==================== PIN DEFINITIONS ====================

// AI Thinker ESP32-CAM Camera Pins
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

#define LED_PIN 4  // Built-in LED
#define FLASH_PIN 4  // Flash LED (same as LED)

// GPS Serial (using UART2)
#define GPS_RX 13
#define GPS_TX 12

// ==================== GLOBAL OBJECTS ====================

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

// Location data
double currentLat = 0.0;
double currentLong = 0.0;
bool gpsValid = false;

// Timing
unsigned long lastCaptureTime = 0;
unsigned long lastLocationUpdate = 0;
unsigned long lastGPSCheck = 0;

const unsigned long CAPTURE_INTERVAL = 15000;  // Capture every 15 seconds (reduced frequency)
const unsigned long LOCATION_UPDATE_INTERVAL = 5000;  // Update location every 5 seconds
const unsigned long GPS_CHECK_INTERVAL = 1000;  // Check GPS every second

// ==================== SETUP ====================

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n====================================");
  Serial.println("  ESP32-CAM TripSync System");
  Serial.println("====================================\n");
  
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  // Initialize GPS
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);
  Serial.println("GPS module initialized");
  
  // Initialize camera
  if (!initCamera()) {
    Serial.println("FATAL: Camera initialization failed!");
    while(1) {
      blinkError();
      delay(1000);
    }
  }
  
  // Connect to WiFi
  connectWiFi();
  
  // Connect to MQTT (only if enabled)
  if (ENABLE_MQTT) {
    mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
    mqttClient.setCallback(mqttCallback);
    connectMQTT();
  } else {
    Serial.println("⚠ MQTT disabled - location tracking unavailable");
  }
  
  Serial.println("\n====================================");
  Serial.println("  System Ready!");
  Serial.println("====================================\n");
  Serial.printf("Bus: %s\n", BUS_NUMBER);
  Serial.printf("Device ID: %s\n", DEVICE_ID);
  if (ENABLE_MQTT) {
    Serial.println("Mode: Face Recognition + Location Tracking");
  } else {
    Serial.println("Mode: Face Recognition Only");
  }
  Serial.println();
  
  delay(2000);
}

// ==================== MAIN LOOP ====================

void loop() {
  unsigned long currentMillis = millis();
  
  // Maintain MQTT connection (only if enabled)
  if (ENABLE_MQTT) {
    if (!mqttClient.connected()) {
      connectMQTT();
    }
    mqttClient.loop();
  }
  
  // Read GPS data (only if MQTT enabled for location tracking)
  if (ENABLE_MQTT && currentMillis - lastGPSCheck >= GPS_CHECK_INTERVAL) {
    lastGPSCheck = currentMillis;
    readGPS();
  }
  
  // Publish location via MQTT (only if enabled)
  if (ENABLE_MQTT && currentMillis - lastLocationUpdate >= LOCATION_UPDATE_INTERVAL) {
    lastLocationUpdate = currentMillis;
    if (gpsValid) {
      publishLocation();
    }
  }
  
  // Capture and recognize face (always active)
  if (currentMillis - lastCaptureTime >= CAPTURE_INTERVAL) {
    lastCaptureTime = currentMillis;
    captureAndRecognize();
  }
}

// ==================== CAMERA FUNCTIONS ====================

bool initCamera() {
  Serial.println("Initializing camera...");
  
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
  // Image quality settings
  if(psramFound()){
    config.frame_size = FRAMESIZE_VGA; // 640x480 - better quality for face recognition
    config.jpeg_quality = 10;  // Better quality (lower number = higher quality)
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_QVGA; // 320x240
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }
  
  // Initialize camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed: 0x%x\n", err);
    return false;
  }
  
  // Adjust camera settings for better face recognition
  sensor_t * s = esp_camera_sensor_get();
  s->set_brightness(s, 0);     // -2 to 2
  s->set_contrast(s, 0);       // -2 to 2
  s->set_saturation(s, 0);     // -2 to 2
  s->set_sharpness(s, 0);      // Auto sharpness
  s->set_denoise(s, 0);        // Denoise off for clarity
  s->set_whitebal(s, 1);       // Auto white balance
  s->set_awb_gain(s, 1);       // Auto white balance gain
  s->set_wb_mode(s, 0);        // Auto white balance mode
  s->set_exposure_ctrl(s, 1);  // Auto exposure
  s->set_aec2(s, 0);           // AEC DSP off
  s->set_ae_level(s, 0);       // -2 to 2
  s->set_aec_value(s, 300);    // 0 to 1200
  s->set_gain_ctrl(s, 1);      // Auto gain
  s->set_agc_gain(s, 0);       // 0 to 30
  s->set_gainceiling(s, (gainceiling_t)0);  // 0 to 6
  s->set_bpc(s, 0);            // Black pixel correction
  s->set_wpc(s, 1);            // White pixel correction
  s->set_raw_gma(s, 1);        // Gamma correction
  s->set_lenc(s, 1);           // Lens correction
  s->set_hmirror(s, 0);        // Horizontal mirror
  s->set_vflip(s, 0);          // Vertical flip
  s->set_dcw(s, 1);            // DCW (downsize enable)
  s->set_colorbar(s, 0);       // Colorbar pattern off
  
  Serial.println("✓ Camera initialized successfully");
  return true;
}

// ==================== WIFI FUNCTIONS ====================

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n✗ WiFi connection failed!");
  }
}

// ==================== MQTT FUNCTIONS ====================

void connectMQTT() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }
  
  Serial.print("Connecting to MQTT broker...");
  
  int attempts = 0;
  while (!mqttClient.connected() && attempts < 3) {
    if (mqttClient.connect(MQTT_CLIENT_ID)) {
      Serial.println(" ✓ Connected!");
      
      // Subscribe to command topic
      String commandTopic = "tripsync/bus/" + String(BUS_NUMBER) + "/command";
      mqttClient.subscribe(commandTopic.c_str());
      Serial.println("✓ Subscribed to: " + commandTopic);
    } else {
      Serial.print("✗ Failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" Retrying...");
      delay(2000);
    }
    attempts++;
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("MQTT message received on ");
  Serial.print(topic);
  Serial.print(": ");
  
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);
  
  // Parse JSON command
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, message);
  
  if (!error) {
    const char* cmd = doc["command"];
    
    if (strcmp(cmd, "capture") == 0) {
      Serial.println("Remote capture command received");
      captureAndRecognize();
    }
  }
}

void publishLocation() {
  if (!mqttClient.connected() || !gpsValid) {
    return;
  }
  
  String locationTopic = "tripsync/bus/" + String(BUS_NUMBER) + "/location";
  
  StaticJsonDocument<200> doc;
  doc["bus_number"] = BUS_NUMBER;
  doc["device_id"] = DEVICE_ID;
  doc["latitude"] = currentLat;
  doc["longitude"] = currentLong;
  doc["timestamp"] = millis();
  
  String payload;
  serializeJson(doc, payload);
  
  if (mqttClient.publish(locationTopic.c_str(), payload.c_str())) {
    Serial.println("📍 Location published: " + payload);
  }
}

// ==================== GPS FUNCTIONS ====================

void readGPS() {
  if (USE_HARDCODED_GPS) {
    // Use hardcoded GPS coordinates
    currentLat = FIXED_LATITUDE;
    currentLong = FIXED_LONGITUDE;
    gpsValid = true;
    return;
  }
  
  // Read from GPS module if not using hardcoded location
  while (gpsSerial.available() > 0) {
    char c = gpsSerial.read();
    if (gps.encode(c)) {
      if (gps.location.isValid()) {
        currentLat = gps.location.lat();
        currentLong = gps.location.lng();
        gpsValid = true;
      }
    }
  }
  
  // Fallback: use hardcoded location if GPS not available
  if (!gpsValid) {
    currentLat = FIXED_LATITUDE;
    currentLong = FIXED_LONGITUDE;
    gpsValid = true;
  }
}

// ==================== FACE RECOGNITION ====================

void captureAndRecognize() {
  Serial.println("\n--- Capturing Image for Recognition ---");
  
  // Turn on LED
  digitalWrite(LED_PIN, HIGH);
  delay(100);  // Brief flash
  
  // Capture image
  camera_fb_t * fb = esp_camera_fb_get();
  if(!fb) {
    Serial.println("✗ Camera capture failed");
    digitalWrite(LED_PIN, LOW);
    return;
  }
  
  Serial.printf("✓ Image captured: %d bytes\n", fb->len);
  
  // Send to server
  if(WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    
    // Build URL with query parameters instead of multipart form
    String url = String(SERVER_URL) + 
                 "?bus_number=" + String(BUS_NUMBER) +
                 "&device_id=" + String(DEVICE_ID) +
                 "&latitude=" + String(currentLat, 6) +
                 "&longitude=" + String(currentLong, 6);
    
    http.begin(client, url);
    http.setTimeout(30000);
    http.addHeader("Content-Type", "image/jpeg");
    
    Serial.println("Sending to server...");
    int httpCode = http.POST(fb->buf, fb->len);
    
    if (httpCode > 0) {
      String response = http.getString();
      Serial.println("\n=== RECOGNITION RESULT ===");
      Serial.println(response);
      Serial.println("==========================\n");
      
      // Parse JSON response
      StaticJsonDocument<512> doc;
      DeserializationError error = deserializeJson(doc, response);
      
      if (!error) {
        const char* ledPattern = doc["led_pattern"];
        
        // Control LED based on result
        if (strcmp(ledPattern, "success_blink") == 0) {
          blinkSuccess();  // Attendance marked
        } else if (strcmp(ledPattern, "double_blink") == 0) {
          blinkDouble();  // Already marked
        } else if (strcmp(ledPattern, "error_blink") == 0) {
          blinkError();  // Wrong bus
        } else {
          blinkSlow();  // Unknown person
        }
      }
    } else {
      Serial.printf("✗ HTTP Error: %d\n", httpCode);
      blinkError();
    }
    
    http.end();
  } else {
    Serial.println("✗ WiFi not connected!");
  }
  
  esp_camera_fb_return(fb);
  digitalWrite(LED_PIN, LOW);
}

// ==================== LED PATTERNS ====================

void blinkSuccess() {
  // 3 fast blinks - attendance marked successfully
  for(int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(100);
    digitalWrite(LED_PIN, LOW);
    delay(100);
  }
}

void blinkDouble() {
  // 2 medium blinks - already marked today
  for(int i = 0; i < 2; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
}

void blinkSlow() {
  // 1 slow blink - unknown person
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
  delay(500);
}

void blinkError() {
  // Rapid blinks - error
  for(int i = 0; i < 5; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(50);
    digitalWrite(LED_PIN, LOW);
    delay(50);
  }
}
