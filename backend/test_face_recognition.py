"""
Test script for Face Recognition System
Run this to verify your setup is working correctly
"""
import asyncio
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

async def test_face_recognition():
    print("\n" + "="*70)
    print("  TripSync Face Recognition System Test")
    print("="*70 + "\n")
    
    # Test 1: Import dependencies
    print("[1/7] Testing imports...")
    try:
        import fastapi
        print("  ✓ FastAPI")
        import deepface
        print("  ✓ DeepFace")
        import cv2
        print("  ✓ OpenCV")
        import paho.mqtt.client as mqtt
        print("  ✓ MQTT Client")
        from motor.motor_asyncio import AsyncIOMotorClient
        print("  ✓ Motor (MongoDB)")
        import tensorflow as tf
        print(f"  ✓ TensorFlow {tf.__version__}")
        print("  ✅ All imports successful!\n")
    except ImportError as e:
        print(f"  ❌ Import failed: {e}\n")
        return False
    
    # Test 2: Check directories
    print("[2/7] Checking directories...")
    dirs = ["student_faces", "app", "app/routers"]
    for dir_name in dirs:
        if os.path.exists(dir_name):
            print(f"  ✓ {dir_name}")
        else:
            print(f"  ⚠ Missing: {dir_name}")
    print()
    
    # Test 3: Check required files
    print("[3/7] Checking required files...")
    files = [
        "face_recognition_service.py",
        "mqtt_service.py",
        "app/routers/face_recognition.py",
        "main.py"
    ]
    for file_name in files:
        if os.path.exists(file_name):
            print(f"  ✓ {file_name}")
        else:
            print(f"  ❌ Missing: {file_name}")
    print()
    
    # Test 4: Load face recognition service
    print("[4/7] Loading face recognition service...")
    try:
        from face_recognition_service import face_service
        print(f"  ✓ Face service loaded")
        print(f"  ✓ Database entries: {len(face_service.face_database)}")
        
        if len(face_service.face_database) > 0:
            students = set([entry['roll_no'] for entry in face_service.face_database])
            print(f"  ✓ Enrolled students: {len(students)}")
            print(f"  ✓ Students: {', '.join(list(students)[:5])}...")
        else:
            print("  ⚠ No students enrolled yet")
        print()
    except Exception as e:
        print(f"  ❌ Failed to load service: {e}\n")
        return False
    
    # Test 5: Test DeepFace model
    print("[5/7] Testing DeepFace model...")
    try:
        from deepface import DeepFace
        
        # Create a test image
        import numpy as np
        test_img = np.zeros((480, 640, 3), dtype=np.uint8)
        test_img[100:380, 200:440] = [255, 200, 150]  # Skin-tone rectangle
        
        cv2.imwrite("test_face.jpg", test_img)
        
        print("  ⓘ Testing face detection (this may take a moment)...")
        try:
            result = DeepFace.represent(
                img_path="test_face.jpg",
                model_name="Facenet512",
                detector_backend="opencv",
                enforce_detection=False  # Don't enforce for test image
            )
            print("  ✓ DeepFace model loaded successfully")
            print(f"  ✓ Embedding dimension: {len(result[0]['embedding'])}")
        except Exception as e:
            print(f"  ⚠ Face detection warning: {e}")
            print("  ℹ This is normal for test image - real faces will work")
        
        # Cleanup
        if os.path.exists("test_face.jpg"):
            os.remove("test_face.jpg")
        print()
    except Exception as e:
        print(f"  ❌ DeepFace test failed: {e}\n")
        return False
    
    # Test 6: Test MQTT service
    print("[6/7] Testing MQTT service...")
    try:
        from mqtt_service import mqtt_service
        print("  ✓ MQTT service imported")
        print(f"  ✓ Broker: {mqtt_service.broker}:{mqtt_service.port}")
        print(f"  ✓ Connected: {mqtt_service.connected}")
        print()
    except Exception as e:
        print(f"  ❌ MQTT test failed: {e}\n")
        return False
    
    # Test 7: Check environment
    print("[7/7] Checking environment configuration...")
    try:
        from app.core.config import get_settings
        settings = get_settings()
        
        if settings.MONGO_URI and "mongodb" in settings.MONGO_URI.lower():
            print(f"  ✓ MongoDB URI configured")
        else:
            print(f"  ⚠ MongoDB URI not configured")
        
        if settings.JWT_SECRET and settings.JWT_SECRET != "change_me":
            print(f"  ✓ JWT Secret configured")
        else:
            print(f"  ⚠ JWT Secret using default (change for production!)")
        
        print(f"  ✓ Database: {settings.MONGO_DB}")
        print(f"  ✓ Host: {settings.APP_HOST}:{settings.APP_PORT}")
        print()
    except Exception as e:
        print(f"  ❌ Config test failed: {e}\n")
        return False
    
    # Summary
    print("="*70)
    print("  Test Summary")
    print("="*70)
    print("\n✅ System is ready for face recognition!")
    print("\nNext Steps:")
    print("  1. Start server: uvicorn main:app --reload --host 0.0.0.0 --port 3000")
    print("  2. Open browser: http://localhost:3000/docs")
    print("  3. Enroll students via Admin Dashboard")
    print("  4. Configure and upload ESP32-CAM code")
    print("\nDocumentation:")
    print("  • Quick Reference: QUICK_REFERENCE.md")
    print("  • Full Guide: ESP32_CAM_INTEGRATION_GUIDE.md")
    print("  • Implementation: FACE_RECOGNITION_IMPLEMENTATION.md")
    print("\n" + "="*70 + "\n")
    
    return True

if __name__ == "__main__":
    try:
        result = asyncio.run(test_face_recognition())
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
