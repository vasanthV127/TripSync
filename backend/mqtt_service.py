"""
MQTT Service for Real-time Bus Location Updates
Handles communication with ESP32-CAM devices
"""
import asyncio
import json
from datetime import datetime
from typing import Optional
import paho.mqtt.client as mqtt
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import MongoClient
import threading

class MQTTService:
    def __init__(self, broker: str = "broker.hivemq.com", port: int = 1883):
        self.broker = broker
        self.port = port
        self.client: Optional[mqtt.Client] = None
        self.db: Optional[AsyncIOMotorDatabase] = None
        self.connected = False
        self.should_reconnect = True
        
        # Topics
        self.LOCATION_TOPIC = "tripsync/bus/+/location"  # Subscribe to all buses
        self.COMMAND_TOPIC = "tripsync/bus/{}/command"   # Publish commands to specific bus
        
    def on_connect(self, client, userdata, flags, rc):
        """Callback when connected to MQTT broker"""
        if rc == 0:
            print("✓ Connected to MQTT broker")
            self.connected = True
            # Subscribe to all bus location updates
            client.subscribe(self.LOCATION_TOPIC)
            print(f"✓ Subscribed to {self.LOCATION_TOPIC}")
        else:
            print(f"✗ Failed to connect to MQTT broker. Return code: {rc}")
    
    def on_disconnect(self, client, userdata, rc):
        """Callback when disconnected from MQTT broker"""
        if rc != 0:
            # Silently handle reconnection - too verbose otherwise
            self.connected = False
        else:
            print("✓ Disconnected from MQTT broker (clean)")
            self.connected = False
    
    def on_message(self, client, userdata, msg):
        """Callback when message received"""
        try:
            # Parse topic to get bus number
            # Topic format: tripsync/bus/BUS1/location
            topic_parts = msg.topic.split('/')
            if len(topic_parts) >= 3:
                bus_number = topic_parts[2]
            else:
                print(f"Invalid topic format: {msg.topic}")
                return
            
            # Parse payload
            payload = json.loads(msg.payload.decode())
            
            # Extract location data
            latitude = payload.get('latitude') or payload.get('lat')
            longitude = payload.get('longitude') or payload.get('long')
            device_id = payload.get('device_id')
            
            if latitude is None or longitude is None:
                print(f"Missing location data in payload: {payload}")
                return
            
            # Update database using thread-safe method
            thread = threading.Thread(
                target=self._sync_update_location,
                args=(bus_number, latitude, longitude, device_id)
            )
            thread.daemon = True
            thread.start()
            
            print(f"📍 Bus {bus_number} location: ({latitude}, {longitude})")
        
        except json.JSONDecodeError as e:
            print(f"Error decoding MQTT message: {e}")
        except Exception as e:
            print(f"Error processing MQTT message: {e}")
    
    def _sync_update_location(self, bus_number: str, latitude: float, longitude: float, device_id: Optional[str] = None):
        """Synchronous update to database - runs in separate thread"""
        try:
            # Create a synchronous MongoDB client for this thread
            from app.core.config import get_settings
            settings = get_settings()
            sync_client = MongoClient(settings.MONGO_URI)
            sync_db = sync_client[settings.MONGO_DB]
            
            location_data = {
                "lat": latitude,
                "long": longitude,
                "timestamp": datetime.utcnow()
            }
            
            if device_id:
                location_data["device_id"] = device_id
            
            # Try both field names for compatibility
            result = sync_db.buses.update_one(
                {"$or": [{"busNumber": bus_number}, {"number": bus_number}]},
                {
                    "$set": {
                        "currentLocation": location_data,
                        "lastUpdated": datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count > 0:
                print(f"✓ Updated location for {bus_number}")
            else:
                print(f"⚠ Bus {bus_number} not found in database")
            
            sync_client.close()
        except Exception as e:
            print(f"Error updating location: {e}")
    
    async def update_bus_location(
        self, 
        bus_number: str, 
        latitude: float, 
        longitude: float,
        device_id: Optional[str] = None
    ):
        """Update bus location in MongoDB"""
        if self.db is None:
            print("Database not initialized in MQTT service")
            return
        
        try:
            location_data = {
                "lat": latitude,
                "long": longitude,
                "timestamp": datetime.utcnow()
            }
            
            if device_id:
                location_data["device_id"] = device_id
            
            result = await self.db.buses.update_one(
                {"busNumber": bus_number},
                {
                    "$set": {
                        "location": location_data,
                        "lastUpdated": datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count > 0:
                print(f"✓ Updated location for {bus_number}")
            else:
                print(f"⚠ Bus {bus_number} not found in database")
        
        except Exception as e:
            print(f"Error updating bus location in database: {e}")
    
    def start(self, db: AsyncIOMotorDatabase):
        """Start MQTT client"""
        self.db = db
        
        try:
            # Create MQTT client with clean session and protocol version 3.1.1
            self.client = mqtt.Client(
                client_id="tripsync_backend",
                clean_session=True,
                protocol=mqtt.MQTTv311
            )
            
            # Set callbacks
            self.client.on_connect = self.on_connect
            self.client.on_disconnect = self.on_disconnect
            self.client.on_message = self.on_message
            
            # Enable automatic reconnection
            self.client.reconnect_delay_set(min_delay=1, max_delay=120)
            
            print(f"Connecting to MQTT broker: {self.broker}:{self.port}")
            # Increase keep-alive to 120 seconds and set connection timeout
            self.client.connect(self.broker, self.port, keepalive=120)
            
            # Start network loop in background (handles auto-reconnect)
            self.client.loop_start()
            print("✓ MQTT service started with auto-reconnect")
        
        except Exception as e:
            print(f"Error starting MQTT service: {e}")
    
    def stop(self):
        """Stop MQTT client"""
        self.should_reconnect = False
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()
            print("MQTT service stopped")
    
    def publish_command(self, bus_number: str, command: dict):
        """Publish command to specific bus"""
        if not self.connected:
            print("Not connected to MQTT broker")
            return False
        
        try:
            topic = self.COMMAND_TOPIC.format(bus_number)
            payload = json.dumps(command)
            
            result = self.client.publish(topic, payload, qos=1)
            
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                print(f"✓ Published command to {bus_number}: {command}")
                return True
            else:
                print(f"✗ Failed to publish command. Error code: {result.rc}")
                return False
        
        except Exception as e:
            print(f"Error publishing MQTT command: {e}")
            return False

# Global MQTT service instance
mqtt_service = MQTTService()
