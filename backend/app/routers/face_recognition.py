"""
Face Recognition Router for ESP32-CAM Integration
Handles attendance marking via face recognition
"""
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from fastapi import status, Request
from typing import List
from datetime import datetime, date
from bson import ObjectId
import json

from ..db import get_db
from .deps import get_current_user
from face_recognition_service import face_service

router = APIRouter(prefix="/api/face", tags=["face-recognition"])

@router.post("/enroll")
async def enroll_student_faces(
    roll_no: str = Form(...),
    front_image: UploadFile = File(...),
    left_image: UploadFile = File(...),
    right_image: UploadFile = File(...),
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Enroll student face images (Admin only)
    Requires 3 images: front, left, right views
    """
    # Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if student exists
    student = await db.users.find_one({"roll_no": roll_no, "role": "student"})
    if not student:
        raise HTTPException(status_code=404, detail=f"Student {roll_no} not found")
    
    # Read image data
    front_data = await front_image.read()
    left_data = await left_image.read()
    right_data = await right_image.read()
    
    # Add faces to recognition system
    result = await face_service.add_student_faces(
        roll_no=roll_no,
        name=student.get("name", "Unknown"),
        front_image=front_data,
        left_image=left_data,
        right_image=right_data,
        db=db
    )
    
    if result["status"] == "success":
        return result
    else:
        raise HTTPException(status_code=500, detail=result["message"])

@router.post("/recognize-attendance")
async def recognize_and_mark_attendance(
    request: Request,
    db = Depends(get_db)
):
    """
    ESP32-CAM endpoint to recognize face and mark attendance
    
    Accepts image/jpeg directly with query parameters:
    - bus_number: bus number (query param)
    - device_id: ESP32 device identifier (query param)
    - latitude: GPS latitude (query param)
    - longitude: GPS longitude (query param)
    """
    try:
        # Get query parameters
        bus_number = request.query_params.get("bus_number")
        device_id = request.query_params.get("device_id")
        latitude = request.query_params.get("latitude")
        longitude = request.query_params.get("longitude")
        
        print(f"\n{'='*60}")
        print(f"📸 FACE RECOGNITION REQUEST")
        print(f"{'='*60}")
        print(f"Bus: {bus_number}")
        print(f"Device: {device_id}")
        print(f"Location: ({latitude}, {longitude})")
        print(f"Content-Type: {request.headers.get('content-type')}")
        
        if not bus_number:
            print("❌ No bus_number provided")
            raise HTTPException(status_code=400, detail="Bus number required")
        
        # Read image data directly from request body
        image_data = await request.body()
        print(f"📦 Image size: {len(image_data)} bytes")
        
        if not image_data or len(image_data) < 100:
            print("❌ No image data or image too small")
            raise HTTPException(status_code=400, detail="No valid image provided")
        
        # Recognize face
        print("🔍 Starting face recognition...")
        recognition_result = face_service.recognize_face(image_data)
        
        print(f"Recognition result: {recognition_result.get('status')}")
        
        if recognition_result["status"] != "success":
            print(f"❌ Recognition failed: {recognition_result.get('message')}")
            return {
                "success": False,
                "message": recognition_result.get("message", "Recognition failed"),
                "led_pattern": "slow_blink"  # Signal to ESP32
            }
        
        if not recognition_result.get("recognized"):
            print(f"⚠️  Unknown person - Distance: {recognition_result.get('distance')}, Confidence: {recognition_result.get('confidence')}")
            return {
                "success": False,
                "message": "Unknown person - no match found",
                "distance": recognition_result.get("distance"),
                "confidence": recognition_result.get("confidence"),
                "led_pattern": "slow_blink"
            }
        
        # Student recognized - mark attendance
        roll_no = recognition_result["roll_no"]
        name = recognition_result["name"]
        confidence = recognition_result["confidence"]
        distance = recognition_result.get("distance")
        
        print(f"✅ RECOGNIZED: {name} ({roll_no})")
        print(f"   Confidence: {confidence:.3f}, Distance: {distance:.3f}")
        
        # Check if student is assigned to this bus
        student = await db.users.find_one({"roll_no": roll_no})
        if not student:
            print(f"❌ Student {roll_no} not in database")
            return {
                "success": False,
                "message": f"Student {roll_no} not found in database",
                "led_pattern": "slow_blink"
            }
        
        student_bus = student.get("assignedBus") or student.get("busNumber")
        print(f"   Student bus: {student_bus}, Current bus: {bus_number}")
        
        if student_bus != bus_number:
            print(f"❌ Wrong bus: student assigned to {student_bus}")
            return {
                "success": False,
                "message": f"{name} is not assigned to {bus_number}",
                "recognized": True,
                "roll_no": roll_no,
                "name": name,
                "assigned_bus": student_bus,
                "led_pattern": "error_blink"
            }
        
        # Check if already marked today
        today = date.today()
        existing_attendance = await db.attendance.find_one({
            "roll_no": roll_no,
            "date": today.isoformat()
        })
        
        if existing_attendance:
            print(f"⚠️  Already marked today at {existing_attendance.get('time')}")
            return {
                "success": False,
                "message": f"{name} already marked present today",
                "recognized": True,
                "roll_no": roll_no,
                "name": name,
                "time": existing_attendance.get("time"),
                "led_pattern": "double_blink"
            }
        
        # Mark attendance
        now = datetime.utcnow()
        attendance_record = {
            "student_id": str(student["_id"]),
            "roll_no": roll_no,
            "name": name,
            "busNumber": bus_number,
            "date": today.isoformat(),
            "time": now.strftime("%H:%M:%S"),
            "timestamp": now,
            "location": {
                "lat": float(latitude) if latitude else None,
                "long": float(longitude) if longitude else None,
                "timestamp": now
            },
            "recognition": {
                "confidence": confidence,
                "distance": distance,
                "device_id": device_id
            },
            "method": "face_recognition"
        }
        
        await db.attendance.insert_one(attendance_record)
        
        print(f"✅ ATTENDANCE MARKED for {name} at {now.strftime('%H:%M:%S')}")
        print(f"{'='*60}\n")
        
        return {
            "success": True,
            "message": f"✓ Attendance marked for {name}",
            "roll_no": roll_no,
            "name": name,
            "confidence": confidence,
            "distance": distance,
            "time": now.strftime("%H:%M:%S"),
            "led_pattern": "success_blink"  # 3 fast blinks
        }
    
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"❌ Error in recognize_and_mark_attendance: {str(e)}")
        print(f"❌ Full traceback:\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Face recognition error: {str(e) or 'Unknown error'}")

@router.get("/status")
async def face_recognition_status(
    current_user = Depends(get_current_user)
):
    """Get face recognition system status"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    enrolled_students = set([entry['roll_no'] for entry in face_service.face_database])
    
    return {
        "status": "online",
        "model": "Facenet512",
        "detector": "opencv",
        "distance_metric": "cosine",
        "threshold": face_service.threshold,
        "enrolled_students": len(enrolled_students),
        "total_encodings": len(face_service.face_database),
        "students": list(enrolled_students)
    }

@router.delete("/unenroll/{roll_no}")
async def unenroll_student(
    roll_no: str,
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Remove student face enrollment (Admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await face_service.remove_student_faces(roll_no, db)
    
    if result["status"] == "success":
        return result
    else:
        raise HTTPException(status_code=500, detail=result["message"])

@router.post("/rebuild-database")
async def rebuild_face_database(
    current_user = Depends(get_current_user)
):
    """Rebuild face database from stored images (Admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Reload database
    face_service.load_database()
    
    return {
        "status": "success",
        "message": "Face database reloaded",
        "total_encodings": len(face_service.face_database)
    }
