"""
Driver endpoints for profile, leave requests, and bus management
"""
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId
from ..db import get_db
from .deps import get_current_user
from ..models.messaging import LeaveRequest

router = APIRouter(prefix="/api/drivers", tags=["drivers"])


# ==================== DRIVER PROFILE & INFO ====================

@router.get("/me")
async def get_driver_profile(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get driver's basic profile and assigned bus/route information
    """
    if current_user.get("role") != "driver":
        raise HTTPException(status_code=403, detail="Driver access only")
    
    driver_id = str(current_user.get("_id"))
    
    # Get assigned bus
    bus = await db.buses.find_one({"driverId": driver_id}, {"_id": 0})
    
    # Get route details if bus is assigned
    route = None
    if bus and bus.get("route"):
        route = await db.routes.find_one({"name": bus.get("route")}, {"_id": 0})
    
    # Get student count on this bus
    student_count = 0
    if bus:
        student_count = await db.users.count_documents({
            "role": "student",
            "assignedBus": bus.get("number")
        })
    
    profile = {
        "id": driver_id,
        "name": current_user.get("name"),
        "email": current_user.get("email"),
        "phone": current_user.get("phone"),
        "role": "driver",
        "assignedBus": bus.get("number") if bus else None,
        "busDetails": bus,
        "route": route,
        "studentCount": student_count
    }
    
    return {"driver": profile}


@router.get("/me/students")
async def get_assigned_students(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get list of students assigned to driver's bus
    """
    if current_user.get("role") != "driver":
        raise HTTPException(status_code=403, detail="Driver access only")
    
    driver_id = str(current_user.get("_id"))
    
    # Get driver's bus
    bus = await db.buses.find_one({"driverId": driver_id})
    if not bus:
        raise HTTPException(status_code=404, detail="No bus assigned to driver")
    
    bus_number = bus.get("number")
    
    # Get students on this bus
    cursor = db.users.find(
        {"role": "student", "assignedBus": bus_number},
        {"password": 0, "_id": 0}
    ).sort("name", 1)
    
    students = [doc async for doc in cursor]
    
    return {
        "busNumber": bus_number,
        "route": bus.get("route"),
        "studentCount": len(students),
        "students": students
    }


@router.get("/me/bus-location")
async def get_my_bus_location(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get current location and status of driver's assigned bus
    """
    if current_user.get("role") != "driver":
        raise HTTPException(status_code=403, detail="Driver access only")
    
    driver_id = str(current_user.get("_id"))
    bus = await db.buses.find_one({"driverId": driver_id}, {"_id": 0})
    
    if not bus:
        raise HTTPException(status_code=404, detail="No bus assigned to driver")
    
    # Get coverage points for timeline
    from ..utils.coverage import get_coverage_points_for_bus
    coverage = await get_coverage_points_for_bus(db, bus.get("number"))
    bus["coveragePoints"] = coverage
    
    return {"bus": bus}


# ==================== LEAVE MANAGEMENT ====================

@router.post("/me/leave")
async def request_leave(
    payload: LeaveRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Driver submits leave request for a specific date
    """
    if current_user.get("role") != "driver":
        raise HTTPException(status_code=403, detail="Driver access only")
    
    driver_id = str(current_user.get("_id"))
    
    # Get driver's bus
    bus = await db.buses.find_one({"driverId": driver_id})
    if not bus:
        raise HTTPException(status_code=404, detail="No bus assigned to driver")
    
    # Check if leave already exists for this date
    existing = await db.leave_requests.find_one({
        "driverId": driver_id,
        "date": payload.date
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Leave request already exists for this date")
    
    leave_request = {
        "driverId": driver_id,
        "driverName": current_user.get("name"),
        "busNumber": bus.get("number"),
        "route": bus.get("route"),
        "date": payload.date,
        "reason": payload.reason,
        "status": "pending",
        "submittedAt": datetime.now(),
        "approved": None,
        "substituteDriverId": None,
        "adminNotes": None
    }
    
    result = await db.leave_requests.insert_one(leave_request)
    leave_request["_id"] = str(result.inserted_id)
    
    return {
        "success": True,
        "message": "Leave request submitted successfully",
        "leaveRequest": leave_request
    }


@router.get("/me/leaves")
async def get_my_leaves(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
    status: Optional[str] = Query(None, description="Filter by status: pending, approved, rejected")
):
    """
    Get all leave requests for the driver
    """
    if current_user.get("role") != "driver":
        raise HTTPException(status_code=403, detail="Driver access only")
    
    driver_id = str(current_user.get("_id"))
    
    query = {"driverId": driver_id}
    if status:
        query["status"] = status
    
    cursor = db.leave_requests.find(query).sort("date", -1)
    leaves = []
    
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        leaves.append(doc)
    
    return {
        "count": len(leaves),
        "leaves": leaves
    }


@router.delete("/me/leave/{leave_id}")
async def cancel_leave_request(
    leave_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Driver cancels their own leave request (only if pending)
    """
    if current_user.get("role") != "driver":
        raise HTTPException(status_code=403, detail="Driver access only")
    
    driver_id = str(current_user.get("_id"))
    
    # Check if leave exists and is pending
    leave = await db.leave_requests.find_one({
        "_id": ObjectId(leave_id),
        "driverId": driver_id
    })
    
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    if leave.get("status") != "pending":
        raise HTTPException(status_code=400, detail="Can only cancel pending leave requests")
    
    result = await db.leave_requests.delete_one({"_id": ObjectId(leave_id)})
    
    return {
        "success": True,
        "message": "Leave request cancelled successfully"
    }


# ==================== DRIVER ATTENDANCE/SCHEDULE ====================

@router.get("/me/schedule")
async def get_my_schedule(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get driver's work schedule and upcoming leaves
    """
    if current_user.get("role") != "driver":
        raise HTTPException(status_code=403, detail="Driver access only")
    
    driver_id = str(current_user.get("_id"))
    
    # Get bus and route
    bus = await db.buses.find_one({"driverId": driver_id}, {"_id": 0})
    if not bus:
        return {"message": "No bus assigned", "schedule": None}
    
    route = await db.routes.find_one({"name": bus.get("route")}, {"_id": 0})
    
    # Get upcoming approved leaves
    from datetime import date
    today = date.today().isoformat()
    
    leaves_cursor = db.leave_requests.find({
        "driverId": driver_id,
        "status": "approved",
        "date": {"$gte": today}
    }).sort("date", 1)
    
    leaves = [doc async for doc in leaves_cursor]
    for leave in leaves:
        leave["_id"] = str(leave["_id"])
    
    return {
        "bus": bus,
        "route": route,
        "upcomingLeaves": leaves
    }


# ==================== ADMIN ENDPOINTS FOR DRIVERS ====================

@router.get("/list")
async def list_all_drivers(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
    assigned: Optional[bool] = Query(None, description="Filter by assignment status")
):
    """
    Admin gets list of all drivers with their assignments
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    # Get all drivers
    cursor = db.users.find({"role": "driver"}, {"password": 0})
    drivers = []
    
    async for driver in cursor:
        driver_id = str(driver.get("_id"))
        driver["_id"] = driver_id
        
        # Get assigned bus
        bus = await db.buses.find_one({"driverId": driver_id}, {"_id": 0})
        driver["assignedBus"] = bus.get("number") if bus else None
        driver["route"] = bus.get("route") if bus else None
        
        # Filter by assignment status if specified
        if assigned is not None:
            if assigned and bus:
                drivers.append(driver)
            elif not assigned and not bus:
                drivers.append(driver)
        else:
            drivers.append(driver)
    
    return {
        "count": len(drivers),
        "drivers": drivers
    }


@router.get("/{driver_id}")
async def get_driver_details(
    driver_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Admin gets detailed information about a specific driver
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    try:
        driver = await db.users.find_one(
            {"_id": ObjectId(driver_id), "role": "driver"},
            {"password": 0}
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid driver ID")
    
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    driver["_id"] = str(driver["_id"])
    
    # Get assigned bus
    bus = await db.buses.find_one({"driverId": driver_id}, {"_id": 0})
    
    # Get route
    route = None
    if bus and bus.get("route"):
        route = await db.routes.find_one({"name": bus.get("route")}, {"_id": 0})
    
    # Get student count
    student_count = 0
    if bus:
        student_count = await db.users.count_documents({
            "role": "student",
            "assignedBus": bus.get("number")
        })
    
    # Get recent leave requests
    leaves_cursor = db.leave_requests.find(
        {"driverId": driver_id}
    ).sort("date", -1).limit(10)
    
    leaves = []
    async for leave in leaves_cursor:
        leave["_id"] = str(leave["_id"])
        leaves.append(leave)
    
    return {
        "driver": driver,
        "assignedBus": bus,
        "route": route,
        "studentCount": student_count,
        "recentLeaves": leaves
    }


@router.patch("/{driver_id}")
async def update_driver(
    driver_id: str,
    updates: dict,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Admin updates driver information
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    # Validate driver exists
    try:
        driver = await db.users.find_one({"_id": ObjectId(driver_id), "role": "driver"})
    except:
        raise HTTPException(status_code=400, detail="Invalid driver ID")
    
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    # Allowed fields to update
    allowed_fields = ["name", "email", "phone"]
    update_data = {k: v for k, v in updates.items() if k in allowed_fields and v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    update_data["updatedAt"] = datetime.now()
    
    result = await db.users.update_one(
        {"_id": ObjectId(driver_id)},
        {"$set": update_data}
    )
    
    return {
        "success": True,
        "message": "Driver updated successfully",
        "updated": update_data
    }
