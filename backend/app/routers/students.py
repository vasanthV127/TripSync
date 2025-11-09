from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from ..db import get_db
from .deps import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/api/students", tags=["students"])

# ==================== STUDENT-ONLY ENDPOINTS ====================

@router.get("/me")
async def get_my_basic_info(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get basic student information (student only)
    Returns: name, roll_no, email, role, boarding, assignedBus, route
    """
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Student access only")
    
    return {
        "student": {
            "name": current_user.get("name"),
            "roll_no": current_user.get("roll_no"),
            "email": current_user.get("email"),
            "role": current_user.get("role"),
            "boarding": current_user.get("boarding"),
            "assignedBus": current_user.get("assignedBus"),
            "route": current_user.get("route")
        }
    }


@router.get("/me/route")
async def get_my_route(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get student's assigned route details with stops (student only)
    """
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Student access only")
    
    route_name = current_user.get("route")
    if not route_name:
        raise HTTPException(status_code=404, detail="No route assigned")
    
    route = await db.routes.find_one({"name": route_name}, {"_id": 0})
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    return {"route": route}


@router.get("/me/bus")
async def get_my_bus(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get student's assigned bus details with current location (student only)
    Also includes coveragePoints for timeline display.
    """
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Student access only")
    
    bus_number = current_user.get("assignedBus")
    if not bus_number:
        raise HTTPException(status_code=404, detail="No bus assigned")
    
    bus = await db.buses.find_one({"number": bus_number}, {"_id": 0})
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    # enrich bus with coverage points
    from ..utils.coverage import get_coverage_points_for_bus
    coverage = await get_coverage_points_for_bus(db, bus_number)
    bus["coveragePoints"] = coverage
    
    return {"bus": bus}


@router.get("/me/driver")
async def get_my_driver(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get student's bus driver details (student only)
    """
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Student access only")
    
    bus_number = current_user.get("assignedBus")
    if not bus_number:
        raise HTTPException(status_code=404, detail="No bus assigned")
    
    bus = await db.buses.find_one({"number": bus_number})
    if not bus or not bus.get("driverId"):
        raise HTTPException(status_code=404, detail="Driver not assigned to bus")
    
    try:
        driver_doc = await db.users.find_one(
            {"_id": ObjectId(bus["driverId"]), "role": "driver"},
            {"password": 0, "_id": 0}
        )
        if not driver_doc:
            raise HTTPException(status_code=404, detail="Driver not found")
        
        return {
            "driver": {
                "name": driver_doc.get("name"),
                "email": driver_doc.get("email"),
                "phone": driver_doc.get("phone")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching driver details")


@router.get("/me/attendance")
async def get_my_attendance(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get student's attendance history and statistics (student only)
    """
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Student access only")
    
    roll_no = current_user.get("roll_no")
    
    # Get attendance history
    attendance_cursor = db.attendance.find(
        {"roll_no": roll_no},
        {"_id": 0}
    ).sort("timestamp", -1)
    attendance_history = [doc async for doc in attendance_cursor]
    
    # Calculate stats
    total_days = len(attendance_history)
    present_days = len([a for a in attendance_history if a.get("status") == "Boarded"])
    
    return {
        "attendance": {
            "total_days": total_days,
            "present_days": present_days,
            "attendance_percentage": round((present_days / total_days * 100), 2) if total_days > 0 else 0,
            "history": attendance_history
        }
    }


# ==================== ADMIN/DRIVER ENDPOINTS ====================

@router.get("/profile")
async def get_student_profile(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
    roll_no: str = Query(..., description="Student roll number")
):
    """
    Get complete student profile (admin/driver only)
    Returns all student information including route, bus, driver, and attendance
    """
    # Only admin and driver can access
    if current_user.get("role") not in ["admin", "driver"]:
        raise HTTPException(status_code=403, detail="Admin or driver access only")
    
    # Fetch student
    student = await db.users.find_one({"roll_no": roll_no, "role": "student"})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    target_roll_no = roll_no
    
    # Get student basic info
    student_info = {
        "name": student.get("name"),
        "roll_no": student.get("roll_no"),
        "email": student.get("email"),
        "role": student.get("role"),
        "boarding": student.get("boarding"),
        "assignedBus": student.get("assignedBus"),
        "route": student.get("route")
    }
    
    # Get route details
    route_name = student.get("route")
    route = None
    if route_name:
        route = await db.routes.find_one({"name": route_name}, {"_id": 0})
    
    # Get bus details
    bus_number = student.get("assignedBus")
    bus = None
    driver = None
    if bus_number:
        bus = await db.buses.find_one({"number": bus_number}, {"_id": 0})
        
        # Get driver details if bus has a driver
        if bus and bus.get("driverId"):
            try:
                driver_doc = await db.users.find_one(
                    {"_id": ObjectId(bus["driverId"]), "role": "driver"},
                    {"password": 0}
                )
                if driver_doc:
                    driver = {
                        "name": driver_doc.get("name"),
                        "email": driver_doc.get("email"),
                        "phone": driver_doc.get("phone")
                    }
            except:
                driver = None
    
    # Get attendance history
    attendance_cursor = db.attendance.find(
        {"roll_no": target_roll_no},
        {"_id": 0}
    ).sort("timestamp", -1)
    attendance_history = [doc async for doc in attendance_cursor]
    
    # Calculate attendance stats
    total_days = len(attendance_history)
    present_days = len([a for a in attendance_history if a.get("status") == "Boarded"])
    
    return {
        "student": student_info,
        "route": route,
        "bus": bus,
        "driver": driver,
        "attendance": {
            "total_days": total_days,
            "present_days": present_days,
            "attendance_percentage": round((present_days / total_days * 100), 2) if total_days > 0 else 0,
            "history": attendance_history
        }
    }


@router.get("/list")
async def list_students(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
    route: Optional[str] = Query(None, description="Filter by route name"),
    busNumber: Optional[str] = Query(None, description="Filter by bus number")
):
    """
    List all students with filters (admin/driver only)
    """
    if current_user.get("role") not in ["admin", "driver"]:
        raise HTTPException(status_code=403, detail="Admin or driver access only")
    
    # Build query
    query = {"role": "student"}
    if route:
        query["route"] = route
    if busNumber:
        query["assignedBus"] = busNumber
    
    # Fetch students
    cursor = db.users.find(query, {"password": 0, "_id": 0})
    students = [doc async for doc in cursor]
    
    return {
        "count": len(students),
        "students": students
    }


@router.get("/{roll_no}/attendance-summary")
async def get_attendance_summary(
    roll_no: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
    from_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """
    Get attendance summary for a student with date range filter (admin/driver/parent only)
    Note: Students should use /api/students/me/attendance instead
    """
    # Permission check
    if current_user.get("role") == "student":
        raise HTTPException(status_code=403, detail="Students should use /api/students/me/attendance")
    elif current_user.get("role") == "parent":
        child = await db.users.find_one({"name": current_user.get("child"), "role": "student"})
        if not child or child.get("roll_no") != roll_no:
            raise HTTPException(status_code=403, detail="Can only view your child's attendance")
    elif current_user.get("role") not in ["admin", "driver"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Build query
    query = {"roll_no": roll_no}
    if from_date:
        query["date"] = {"$gte": from_date}
    if to_date:
        if "date" in query:
            query["date"]["$lte"] = to_date
        else:
            query["date"] = {"$lte": to_date}
    
    # Fetch records
    cursor = db.attendance.find(query, {"_id": 0}).sort("date", -1)
    records = [doc async for doc in cursor]
    
    # Calculate summary
    total = len(records)
    present = len([r for r in records if r.get("status") == "Boarded"])
    
    # Group by date
    dates_present = list(set([r.get("date") for r in records if r.get("status") == "Boarded"]))
    
    return {
        "roll_no": roll_no,
        "period": {
            "from": from_date or "all time",
            "to": to_date or "present"
        },
        "summary": {
            "total_entries": total,
            "present_count": present,
            "attendance_percentage": round((present / total * 100), 2) if total > 0 else 0,
            "dates_present": sorted(dates_present, reverse=True)
        },
        "records": records
    }
