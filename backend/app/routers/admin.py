"""
Admin endpoints for system management and overview
Manages buses, routes, students, drivers, leave requests
"""
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId
from ..db import get_db
from .deps import get_current_user
from ..models.messaging import LeaveApproval, StudentUpdate, BusUpdate, DriverUpdate

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ==================== ADMIN PROFILE & DASHBOARD ====================

@router.get("/me")
async def get_admin_profile(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get admin profile and basic details
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    profile = {
        "id": str(current_user.get("_id")),
        "name": current_user.get("name"),
        "email": current_user.get("email"),
        "role": "admin"
    }
    
    return {"admin": profile}


@router.get("/dashboard")
async def get_admin_dashboard(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get comprehensive dashboard statistics for admin
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    # Count totals
    total_buses = await db.buses.count_documents({})
    total_students = await db.users.count_documents({"role": "student"})
    total_drivers = await db.users.count_documents({"role": "driver"})
    total_routes = await db.routes.count_documents({})
    
    # Count running buses (buses with assigned drivers)
    buses_with_drivers = await db.buses.count_documents({"driverId": {"$exists": True, "$ne": None}})
    
    # Pending leave requests
    pending_leaves = await db.leave_requests.count_documents({"status": "pending"})
    
    # Pending complaints
    pending_complaints = await db.complaints.count_documents({"status": "pending"})
    
    # Get routes with bus count
    routes_cursor = db.routes.find({}, {"_id": 0})
    routes = []
    async for route in routes_cursor:
        route_name = route.get("name")
        bus_count = await db.buses.count_documents({"route": route_name})
        student_count = await db.users.count_documents({"role": "student", "route": route_name})
        routes.append({
            "name": route_name,
            "busCount": bus_count,
            "studentCount": student_count,
            "stops": len(route.get("stops", []))
        })
    
    return {
        "statistics": {
            "totalBuses": total_buses,
            "runningBuses": buses_with_drivers,
            "totalStudents": total_students,
            "totalDrivers": total_drivers,
            "totalRoutes": total_routes,
            "pendingLeaves": pending_leaves,
            "pendingComplaints": pending_complaints
        },
        "routes": routes
    }


# ==================== BUS MANAGEMENT ====================

@router.get("/buses")
async def get_all_buses(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
    route: Optional[str] = Query(None, description="Filter by route"),
    status: Optional[str] = Query(None, description="Filter: running, idle")
):
    """
    Get all buses with detailed information
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    query = {}
    if route:
        query["route"] = route
    
    if status == "running":
        query["driverId"] = {"$exists": True, "$ne": None}
    elif status == "idle":
        query["driverId"] = {"$exists": False}
    
    cursor = db.buses.find(query, {"_id": 0})
    buses = []
    
    async for bus in cursor:
        bus_number = bus.get("number")
        
        # Get driver info
        driver_info = None
        if bus.get("driverId"):
            try:
                driver = await db.users.find_one(
                    {"_id": ObjectId(bus["driverId"])},
                    {"password": 0, "_id": 0}
                )
                if driver:
                    driver_info = {
                        "name": driver.get("name"),
                        "email": driver.get("email"),
                        "phone": driver.get("phone")
                    }
            except:
                pass
        
        # Get student count
        student_count = await db.users.count_documents({
            "role": "student",
            "assignedBus": bus_number
        })
        
        # Add coverage points
        from ..utils.coverage import get_coverage_points_for_bus
        coverage = await get_coverage_points_for_bus(db, bus_number)
        
        bus["driver"] = driver_info
        bus["studentCount"] = student_count
        bus["coveragePoints"] = coverage
        buses.append(bus)
    
    return {
        "count": len(buses),
        "buses": buses
    }


@router.get("/buses/{bus_number}")
async def get_bus_details(
    bus_number: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get detailed information about a specific bus
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    bus = await db.buses.find_one({"number": bus_number}, {"_id": 0})
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    # Get driver info
    driver_info = None
    if bus.get("driverId"):
        try:
            driver = await db.users.find_one(
                {"_id": ObjectId(bus["driverId"])},
                {"password": 0}
            )
            if driver:
                driver_info = {
                    "id": str(driver.get("_id")),
                    "name": driver.get("name"),
                    "email": driver.get("email"),
                    "phone": driver.get("phone")
                }
        except:
            pass
    
    # Get route details
    route = None
    if bus.get("route"):
        route = await db.routes.find_one({"name": bus.get("route")}, {"_id": 0})
    
    # Get students on this bus
    students_cursor = db.users.find(
        {"role": "student", "assignedBus": bus_number},
        {"password": 0, "_id": 0}
    )
    students = [s async for s in students_cursor]
    
    # Get coverage points
    from ..utils.coverage import get_coverage_points_for_bus
    coverage = await get_coverage_points_for_bus(db, bus_number)
    
    return {
        "bus": bus,
        "driver": driver_info,
        "route": route,
        "students": students,
        "studentCount": len(students),
        "coveragePoints": coverage
    }


@router.patch("/buses/{bus_number}")
async def update_bus(
    bus_number: str,
    payload: BusUpdate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Admin updates bus details (driver, route assignment)
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    # Verify bus exists
    bus = await db.buses.find_one({"number": bus_number})
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    update_data = {}
    
    # Update driver
    if payload.driverId is not None:
        if payload.driverId:  # Assigning a driver
            # Verify driver exists
            try:
                driver = await db.users.find_one(
                    {"_id": ObjectId(payload.driverId), "role": "driver"}
                )
                if not driver:
                    raise HTTPException(status_code=404, detail="Driver not found")
                
                # Check if driver is already assigned to another bus
                existing_bus = await db.buses.find_one({
                    "driverId": payload.driverId,
                    "number": {"$ne": bus_number}
                })
                if existing_bus:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Driver already assigned to bus {existing_bus.get('number')}"
                    )
                
                update_data["driverId"] = payload.driverId
            except Exception as e:
                raise HTTPException(status_code=400, detail=str(e))
        else:  # Removing driver
            update_data["driverId"] = None
    
    # Update route
    if payload.route is not None:
        if payload.route:
            # Verify route exists
            route = await db.routes.find_one({"name": payload.route})
            if not route:
                raise HTTPException(status_code=404, detail="Route not found")
            update_data["route"] = payload.route
        else:
            update_data["route"] = None
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    update_data["updatedAt"] = datetime.now()
    
    result = await db.buses.update_one(
        {"number": bus_number},
        {"$set": update_data}
    )
    
    return {
        "success": True,
        "message": "Bus updated successfully",
        "busNumber": bus_number,
        "updated": update_data
    }


@router.get("/buses/{bus_number}/location")
async def get_bus_current_location(
    bus_number: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get current real-time location of a specific bus
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    bus = await db.buses.find_one({"number": bus_number}, {"_id": 0})
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    # Get coverage points for timeline
    from ..utils.coverage import get_coverage_points_for_bus
    coverage = await get_coverage_points_for_bus(db, bus_number)
    
    return {
        "busNumber": bus_number,
        "currentLocation": bus.get("currentLocation"),
        "currentStopIndex": bus.get("currentStopIndex"),
        "route": bus.get("route"),
        "coveragePoints": coverage,
        "lastUpdated": bus.get("currentLocation", {}).get("timestamp")
    }


@router.get("/buses/locations/all")
async def get_all_bus_locations(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get current locations of all buses
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    cursor = db.buses.find({}, {"_id": 0})
    locations = []
    
    async for bus in cursor:
        locations.append({
            "busNumber": bus.get("number"),
            "route": bus.get("route"),
            "currentLocation": bus.get("currentLocation"),
            "currentStopIndex": bus.get("currentStopIndex"),
            "lastUpdated": bus.get("currentLocation", {}).get("timestamp")
        })
    
    return {"locations": locations}


# ==================== STUDENT MANAGEMENT ====================

@router.get("/students")
async def get_all_students(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
    route: Optional[str] = Query(None, description="Filter by route"),
    bus: Optional[str] = Query(None, description="Filter by bus number"),
    boarding: Optional[str] = Query(None, description="Filter by boarding point")
):
    """
    Get all students with filters
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    query = {"role": "student"}
    if route:
        query["route"] = route
    if bus:
        query["assignedBus"] = bus
    if boarding:
        query["boarding"] = boarding
    
    cursor = db.users.find(query, {"password": 0, "_id": 0})
    students = [s async for s in cursor]
    
    return {
        "count": len(students),
        "students": students
    }


@router.patch("/students/{roll_no}")
async def update_student(
    roll_no: str,
    payload: StudentUpdate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Admin updates student details
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    # Verify student exists
    student = await db.users.find_one({"roll_no": roll_no, "role": "student"})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    update_data = {}
    
    if payload.name:
        update_data["name"] = payload.name
    if payload.email:
        # Check if email is unique
        existing = await db.users.find_one({
            "email": payload.email,
            "roll_no": {"$ne": roll_no}
        })
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        update_data["email"] = payload.email
    
    if payload.route:
        # Verify route exists
        route = await db.routes.find_one({"name": payload.route})
        if not route:
            raise HTTPException(status_code=404, detail="Route not found")
        update_data["route"] = payload.route
    
    if payload.boarding:
        update_data["boarding"] = payload.boarding
    
    if payload.assignedBus:
        # Verify bus exists
        bus = await db.buses.find_one({"number": payload.assignedBus})
        if not bus:
            raise HTTPException(status_code=404, detail="Bus not found")
        update_data["assignedBus"] = payload.assignedBus
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    update_data["updatedAt"] = datetime.now()
    
    result = await db.users.update_one(
        {"roll_no": roll_no},
        {"$set": update_data}
    )
    
    return {
        "success": True,
        "message": "Student updated successfully",
        "rollNo": roll_no,
        "updated": update_data
    }


# ==================== LEAVE REQUEST MANAGEMENT ====================

@router.get("/leaves")
async def get_all_leave_requests(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
    status: Optional[str] = Query(None, description="Filter: pending, approved, rejected"),
    date: Optional[str] = Query(None, description="Filter by date (YYYY-MM-DD)")
):
    """
    Get all driver leave requests
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    query = {}
    if status:
        query["status"] = status
    if date:
        query["date"] = date
    
    cursor = db.leave_requests.find(query).sort("date", 1)
    leaves = []
    
    async for leave in cursor:
        leave["_id"] = str(leave["_id"])
        
        # Get substitute driver info if assigned
        if leave.get("substituteDriverId"):
            try:
                sub_driver = await db.users.find_one(
                    {"_id": ObjectId(leave["substituteDriverId"])},
                    {"password": 0, "_id": 0}
                )
                if sub_driver:
                    leave["substituteDriver"] = {
                        "name": sub_driver.get("name"),
                        "email": sub_driver.get("email"),
                        "phone": sub_driver.get("phone")
                    }
            except:
                pass
        
        leaves.append(leave)
    
    return {
        "count": len(leaves),
        "leaves": leaves
    }


@router.patch("/leaves/{leave_id}")
async def process_leave_request(
    leave_id: str,
    payload: LeaveApproval,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Admin approves or rejects leave request and assigns substitute driver
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    # Verify leave request exists
    try:
        leave = await db.leave_requests.find_one({"_id": ObjectId(leave_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid leave ID")
    
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    if leave.get("status") != "pending":
        raise HTTPException(status_code=400, detail="Leave request already processed")
    
    update_data = {
        "approved": payload.approved,
        "status": "approved" if payload.approved else "rejected",
        "processedAt": datetime.now(),
        "processedBy": current_user.get("name", "Admin")
    }
    
    if payload.adminNotes:
        update_data["adminNotes"] = payload.adminNotes
    
    # If approved and substitute driver provided
    if payload.approved and payload.substituteDriverId:
        # Verify substitute driver exists and is available
        try:
            sub_driver = await db.users.find_one({
                "_id": ObjectId(payload.substituteDriverId),
                "role": "driver"
            })
            if not sub_driver:
                raise HTTPException(status_code=404, detail="Substitute driver not found")
            
            # Check if substitute is already assigned
            sub_bus = await db.buses.find_one({"driverId": payload.substituteDriverId})
            if sub_bus:
                raise HTTPException(
                    status_code=400,
                    detail=f"Substitute driver already assigned to bus {sub_bus.get('number')}"
                )
            
            update_data["substituteDriverId"] = payload.substituteDriverId
            
            # Temporarily assign substitute to the bus (would need date-based logic in production)
            # For now, just record it in the leave request
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    result = await db.leave_requests.update_one(
        {"_id": ObjectId(leave_id)},
        {"$set": update_data}
    )
    
    return {
        "success": True,
        "message": f"Leave request {'approved' if payload.approved else 'rejected'}",
        "leaveId": leave_id
    }


# ==================== ROUTE MANAGEMENT ====================

@router.get("/routes")
async def get_all_routes_detailed(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get all routes with detailed statistics
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    cursor = db.routes.find({}, {"_id": 0})
    routes = []
    
    async for route in cursor:
        route_name = route.get("name")
        
        # Get buses on this route
        bus_count = await db.buses.count_documents({"route": route_name})
        
        # Get students on this route
        student_count = await db.users.count_documents({
            "role": "student",
            "route": route_name
        })
        
        # Get drivers on this route
        buses_cursor = db.buses.find({"route": route_name})
        driver_ids = []
        async for bus in buses_cursor:
            if bus.get("driverId"):
                driver_ids.append(bus.get("driverId"))
        
        route["busCount"] = bus_count
        route["studentCount"] = student_count
        route["driverCount"] = len(driver_ids)
        route["stopCount"] = len(route.get("stops", []))
        
        routes.append(route)
    
    return {
        "count": len(routes),
        "routes": routes
    }


@router.get("/routes/{route_name}")
async def get_route_details(
    route_name: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get detailed information about a specific route
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    route = await db.routes.find_one({"name": route_name}, {"_id": 0})
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    # Get buses on this route
    buses_cursor = db.buses.find({"route": route_name}, {"_id": 0})
    buses = [b async for b in buses_cursor]
    
    # Get students on this route
    students_cursor = db.users.find(
        {"role": "student", "route": route_name},
        {"password": 0, "_id": 0}
    )
    students = [s async for s in students_cursor]
    
    return {
        "route": route,
        "buses": buses,
        "busCount": len(buses),
        "students": students,
        "studentCount": len(students),
        "stopCount": len(route.get("stops", []))
    }


# ==================== SYSTEM STATISTICS ====================

@router.get("/statistics")
async def get_system_statistics(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get comprehensive system-wide statistics
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    # Counts
    total_buses = await db.buses.count_documents({})
    running_buses = await db.buses.count_documents({"driverId": {"$exists": True, "$ne": None}})
    total_students = await db.users.count_documents({"role": "student"})
    total_drivers = await db.users.count_documents({"role": "driver"})
    assigned_drivers = await db.buses.count_documents({"driverId": {"$exists": True, "$ne": None}})
    total_routes = await db.routes.count_documents({})
    
    # Pending items
    pending_leaves = await db.leave_requests.count_documents({"status": "pending"})
    pending_complaints = await db.complaints.count_documents({"status": "pending"})
    
    # Attendance today
    from datetime import date
    today = date.today().isoformat()
    attendance_today = await db.attendance.count_documents({"date": today})
    
    return {
        "buses": {
            "total": total_buses,
            "running": running_buses,
            "idle": total_buses - running_buses
        },
        "users": {
            "students": total_students,
            "drivers": total_drivers,
            "assignedDrivers": assigned_drivers,
            "unassignedDrivers": total_drivers - assigned_drivers
        },
        "routes": {
            "total": total_routes
        },
        "pending": {
            "leaves": pending_leaves,
            "complaints": pending_complaints
        },
        "attendance": {
            "today": attendance_today
        }
    }
