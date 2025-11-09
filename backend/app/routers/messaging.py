"""
Messaging endpoints for admin, students, and drivers
Handles broadcast messages, route-specific messages, group chats, and complaints
"""
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId
from ..db import get_db
from .deps import get_current_user
from ..models.messaging import (
    MessageCreate, BroadcastMessage, RouteMessage, 
    DriverMessage, ComplaintCreate, ComplaintUpdate
)

router = APIRouter(prefix="/api/messages", tags=["messaging"])


# ==================== ADMIN MESSAGING ENDPOINTS ====================

@router.post("/admin/broadcast/all-students")
async def broadcast_to_all_students(
    payload: BroadcastMessage,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Admin broadcasts message to all students
    Creates/updates the 'all_students' group chat
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    message = {
        "groupId": "all_students",
        "groupName": "All Students",
        "sender": {
            "id": str(current_user.get("_id")),
            "name": current_user.get("name", "Admin"),
            "role": "admin"
        },
        "content": payload.content,
        "timestamp": datetime.now(),
        "recipientType": "students"
    }
    
    await db.messages.insert_one(message)
    
    # Ensure group exists
    await db.groups.update_one(
        {"groupId": "all_students"},
        {
            "$set": {
                "groupName": "All Students",
                "type": "broadcast",
                "lastMessage": payload.content,
                "lastMessageTime": datetime.now()
            },
            "$setOnInsert": {"createdAt": datetime.now()}
        },
        upsert=True
    )
    
    return {
        "success": True,
        "message": "Broadcast sent to all students",
        "groupId": "all_students"
    }


@router.post("/admin/broadcast/route")
async def broadcast_to_route(
    payload: RouteMessage,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Admin broadcasts message to specific route (students, drivers, parents, or all)
    Creates route-specific group if not exists
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    # Verify route exists
    route = await db.routes.find_one({"name": payload.routeName})
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    group_id = f"route_{payload.routeName.replace(' ', '_')}_{payload.recipientType}"
    
    message = {
        "groupId": group_id,
        "groupName": f"{payload.routeName} - {payload.recipientType.title()}",
        "sender": {
            "id": str(current_user.get("_id")),
            "name": current_user.get("name", "Admin"),
            "role": "admin"
        },
        "content": payload.content,
        "timestamp": datetime.now(),
        "route": payload.routeName,
        "recipientType": payload.recipientType
    }
    
    await db.messages.insert_one(message)
    
    # Update/create group
    await db.groups.update_one(
        {"groupId": group_id},
        {
            "$set": {
                "groupName": f"{payload.routeName} - {payload.recipientType.title()}",
                "type": "route",
                "route": payload.routeName,
                "recipientType": payload.recipientType,
                "lastMessage": payload.content,
                "lastMessageTime": datetime.now()
            },
            "$setOnInsert": {"createdAt": datetime.now()}
        },
        upsert=True
    )
    
    return {
        "success": True,
        "message": f"Message sent to {payload.recipientType} on route {payload.routeName}",
        "groupId": group_id
    }


@router.post("/admin/broadcast/all-drivers")
async def broadcast_to_all_drivers(
    payload: BroadcastMessage,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Admin broadcasts message to all drivers
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    message = {
        "groupId": "all_drivers",
        "groupName": "All Drivers",
        "sender": {
            "id": str(current_user.get("_id")),
            "name": current_user.get("name", "Admin"),
            "role": "admin"
        },
        "content": payload.content,
        "timestamp": datetime.now(),
        "recipientType": "drivers"
    }
    
    await db.messages.insert_one(message)
    
    # Ensure group exists
    await db.groups.update_one(
        {"groupId": "all_drivers"},
        {
            "$set": {
                "groupName": "All Drivers",
                "type": "broadcast",
                "lastMessage": payload.content,
                "lastMessageTime": datetime.now()
            },
            "$setOnInsert": {"createdAt": datetime.now()}
        },
        upsert=True
    )
    
    return {
        "success": True,
        "message": "Broadcast sent to all drivers",
        "groupId": "all_drivers"
    }


@router.post("/admin/broadcast/route-drivers")
async def broadcast_to_route_drivers(
    routeName: str = Query(..., description="Route name"),
    content: str = Query(..., description="Message content"),
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Admin broadcasts message to drivers on specific route
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    # Verify route exists
    route = await db.routes.find_one({"name": routeName})
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    group_id = f"route_{routeName.replace(' ', '_')}_drivers"
    
    message = {
        "groupId": group_id,
        "groupName": f"{routeName} - Drivers",
        "sender": {
            "id": str(current_user.get("_id")),
            "name": current_user.get("name", "Admin"),
            "role": "admin"
        },
        "content": content,
        "timestamp": datetime.now(),
        "route": routeName,
        "recipientType": "drivers"
    }
    
    await db.messages.insert_one(message)
    
    # Update/create group
    await db.groups.update_one(
        {"groupId": group_id},
        {
            "$set": {
                "groupName": f"{routeName} - Drivers",
                "type": "route",
                "route": routeName,
                "recipientType": "drivers",
                "lastMessage": content,
                "lastMessageTime": datetime.now()
            },
            "$setOnInsert": {"createdAt": datetime.now()}
        },
        upsert=True
    )
    
    return {
        "success": True,
        "message": f"Message sent to drivers on route {routeName}",
        "groupId": group_id
    }


# ==================== DRIVER MESSAGING ENDPOINTS ====================

@router.post("/driver/send-to-students")
async def driver_send_to_students(
    payload: DriverMessage,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Driver sends message to their assigned students
    Example: "Bus will be delayed by 30 minutes due to tire puncture"
    """
    if current_user.get("role") != "driver":
        raise HTTPException(status_code=403, detail="Driver access only")
    
    # Get driver's assigned bus
    driver_id = str(current_user.get("_id"))
    bus = await db.buses.find_one({"driverId": driver_id})
    
    if not bus:
        raise HTTPException(status_code=404, detail="No bus assigned to driver")
    
    bus_number = bus.get("number")
    route = bus.get("route")
    
    # Create group ID for this driver's students
    group_id = f"driver_{driver_id}_students"
    
    message = {
        "groupId": group_id,
        "groupName": f"Bus {bus_number} - {route}",
        "sender": {
            "id": driver_id,
            "name": current_user.get("name", "Driver"),
            "role": "driver"
        },
        "content": payload.content,
        "timestamp": datetime.now(),
        "busNumber": bus_number,
        "route": route,
        "recipientType": "students"
    }
    
    await db.messages.insert_one(message)
    
    # Update/create group
    await db.groups.update_one(
        {"groupId": group_id},
        {
            "$set": {
                "groupName": f"Bus {bus_number} - {route}",
                "type": "driver_students",
                "driverId": driver_id,
                "busNumber": bus_number,
                "route": route,
                "lastMessage": payload.content,
                "lastMessageTime": datetime.now()
            },
            "$setOnInsert": {"createdAt": datetime.now()}
        },
        upsert=True
    )
    
    return {
        "success": True,
        "message": "Message sent to your assigned students",
        "groupId": group_id,
        "busNumber": bus_number
    }


@router.get("/driver/my-groups")
async def get_driver_groups(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get all message groups for the driver
    """
    if current_user.get("role") != "driver":
        raise HTTPException(status_code=403, detail="Driver access only")
    
    driver_id = str(current_user.get("_id"))
    
    # Get driver's bus info
    bus = await db.buses.find_one({"driverId": driver_id})
    if not bus:
        return {"groups": []}
    
    route = bus.get("route")
    
    # Find relevant groups
    groups_cursor = db.groups.find({
        "$or": [
            {"groupId": "all_drivers"},
            {"groupId": f"driver_{driver_id}_students"},
            {"route": route, "recipientType": {"$in": ["drivers", "all"]}}
        ]
    }, {"_id": 0})
    
    groups = [doc async for doc in groups_cursor]
    
    return {"groups": groups}


# ==================== STUDENT MESSAGING ENDPOINTS ====================


@router.post("/student/send-message")
async def student_send_message(
    payload: MessageCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Student sends message to their bus-specific student group
    Only students on the same bus can chat together
    """
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Student access only")
    
    assigned_bus = current_user.get("assignedBus")
    if not assigned_bus:
        raise HTTPException(status_code=400, detail="No bus assigned to student")
    
    # Create bus-specific student group ID
    group_id = f"bus_{assigned_bus}_students"
    
    # Get bus and route info
    bus = await db.buses.find_one({"number": assigned_bus})
    route = bus.get("route") if bus else "Unknown Route"
    
    message = {
        "groupId": group_id,
        "groupName": f"Bus {assigned_bus} - Students",
        "sender": {
            "id": str(current_user.get("_id")),
            "name": current_user.get("name"),
            "rollNo": current_user.get("roll_no"),
            "role": "student"
        },
        "content": payload.content,
        "timestamp": datetime.now(),
        "busNumber": assigned_bus,
        "route": route
    }
    
    result = await db.messages.insert_one(message)
    message["_id"] = str(result.inserted_id)
    
    # Update/create group
    await db.groups.update_one(
        {"groupId": group_id},
        {
            "$set": {
                "groupName": f"Bus {assigned_bus} - Students",
                "type": "bus_students",
                "busNumber": assigned_bus,
                "route": route,
                "lastMessage": payload.content,
                "lastMessageTime": datetime.now(),
                "lastSender": current_user.get("name")
            },
            "$setOnInsert": {"createdAt": datetime.now()}
        },
        upsert=True
    )
    
    return {
        "success": True,
        "message": "Message sent to bus group",
        "groupId": group_id,
        "messageId": message["_id"]
    }


@router.get("/student/driver-messages")
async def get_driver_messages(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
    limit: int = Query(50, description="Number of messages to retrieve"),
    skip: int = Query(0, description="Number of messages to skip")
):
    """
    Get messages sent by driver to students on this bus
    """
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Student access only")
    
    assigned_bus = current_user.get("assignedBus")
    if not assigned_bus:
        raise HTTPException(status_code=400, detail="No bus assigned to student")
    
    # Find driver for the assigned bus
    bus = await db.buses.find_one({"number": assigned_bus})
    if not bus or not bus.get("driverId"):
        return {
            "busNumber": assigned_bus,
            "messages": [],
            "count": 0
        }
    
    driver_id = bus.get("driverId")
    group_id = f"driver_{driver_id}_students"
    
    # Get driver info
    driver = await db.users.find_one({"_id": ObjectId(driver_id)}, {"password": 0})
    driver_name = driver.get("name") if driver else "Driver"
    
    # Fetch messages from driver to students
    cursor = db.messages.find(
        {"groupId": group_id},
        {"_id": 0}
    ).sort("timestamp", -1).skip(skip).limit(limit)
    
    messages = [doc async for doc in cursor]
    
    return {
        "busNumber": assigned_bus,
        "driverName": driver_name,
        "groupId": group_id,
        "messages": messages,
        "count": len(messages)
    }


@router.get("/student/bus-chat")
async def get_bus_chat_messages(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
    limit: int = Query(50, description="Number of messages to retrieve"),
    skip: int = Query(0, description="Number of messages to skip")
):
    """
    Get chat messages from students in the same bus
    Student-to-student chat only
    """
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Student access only")
    
    assigned_bus = current_user.get("assignedBus")
    if not assigned_bus:
        raise HTTPException(status_code=400, detail="No bus assigned to student")
    
    group_id = f"bus_{assigned_bus}_students"
    
    # Get bus and route info
    bus = await db.buses.find_one({"number": assigned_bus}, {"_id": 0})
    
    # Get all students on this bus for member list
    students_cursor = db.users.find(
        {"role": "student", "assignedBus": assigned_bus},
        {"password": 0, "_id": 0}
    ).sort("name", 1)
    
    students = [doc async for doc in students_cursor]
    
    # Fetch chat messages
    cursor = db.messages.find(
        {"groupId": group_id},
        {"_id": 0}
    ).sort("timestamp", -1).skip(skip).limit(limit)
    
    messages = [doc async for doc in cursor]
    
    # Get group info for last message
    group = await db.groups.find_one({"groupId": group_id}, {"_id": 0})
    
    return {
        "groupId": group_id,
        "busNumber": assigned_bus,
        "route": bus.get("route") if bus else None,
        "memberCount": len(students),
        "members": students,
        "messages": messages,
        "messageCount": len(messages),
        "lastMessage": group.get("lastMessage") if group else None,
        "lastMessageTime": group.get("lastMessageTime") if group else None,
        "lastSender": group.get("lastSender") if group else None
    }


@router.post("/student/complaint")
async def submit_complaint(
    payload: ComplaintCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Student submits complaint (e.g., rash driving, lost and found)
    Goes directly to admin
    """
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Student access only")
    
    complaint = {
        "studentId": str(current_user.get("_id")),
        "studentName": current_user.get("name"),
        "rollNo": current_user.get("roll_no"),
        "category": payload.category,
        "description": payload.description,
        "busNumber": payload.busNumber or current_user.get("assignedBus"),
        "route": current_user.get("route"),
        "status": "pending",
        "submittedAt": datetime.now(),
        "adminResponse": None
    }
    
    result = await db.complaints.insert_one(complaint)
    complaint["_id"] = str(result.inserted_id)
    
    return {
        "success": True,
        "message": "Complaint submitted successfully",
        "complaint": complaint
    }


@router.get("/student/my-complaints")
async def get_my_complaints(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get all complaints submitted by the student
    """
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Student access only")
    
    student_id = str(current_user.get("_id"))
    
    cursor = db.complaints.find({"studentId": student_id}).sort("submittedAt", -1)
    complaints = []
    
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        complaints.append(doc)
    
    return {"complaints": complaints}


# ==================== ADMIN COMPLAINT MANAGEMENT ====================

@router.get("/admin/complaints")
async def get_all_complaints(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
    status: Optional[str] = Query(None, description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by category")
):
    """
    Admin views all complaints with optional filters
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    query = {}
    if status:
        query["status"] = status
    if category:
        query["category"] = category
    
    cursor = db.complaints.find(query).sort("submittedAt", -1)
    complaints = []
    
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        complaints.append(doc)
    
    return {
        "count": len(complaints),
        "complaints": complaints
    }


@router.patch("/admin/complaints/{complaint_id}")
async def update_complaint(
    complaint_id: str,
    payload: ComplaintUpdate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Admin updates complaint status and adds response
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    update_data = {
        "status": payload.status,
        "updatedAt": datetime.now(),
        "updatedBy": current_user.get("name", "Admin")
    }
    
    if payload.adminResponse:
        update_data["adminResponse"] = payload.adminResponse
    
    result = await db.complaints.update_one(
        {"_id": ObjectId(complaint_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    return {
        "success": True,
        "message": "Complaint updated successfully"
    }
