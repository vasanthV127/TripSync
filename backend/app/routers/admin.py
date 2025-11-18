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
from ..models.messaging import LeaveApproval, StudentUpdate, BusUpdate, DriverUpdate, RouteCreate, RouteUpdate, StudentCreate

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

@router.post("/buses")
async def create_bus(
    payload: BusUpdate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Admin creates a new bus
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    # Check if bus number already exists
    existing = await db.buses.find_one({"number": payload.number})
    if existing:
        raise HTTPException(status_code=400, detail="Bus number already exists")
    
    # Create new bus
    from datetime import datetime
    new_bus = {
        "number": payload.number,
        "driverId": payload.driverId,
        "route": payload.route,
        "currentLocation": {
            "lat": 16.5062,
            "long": 80.6480,
            "timestamp": datetime.now()
        },
        "currentStopIndex": 0,
        "createdAt": datetime.now()
    }
    
    result = await db.buses.insert_one(new_bus)
    
    return {
        "success": True,
        "message": "Bus created successfully",
        "busNumber": payload.number
    }


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
    Admin updates bus details (driver, route assignment, bus number)
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    # Verify bus exists
    bus = await db.buses.find_one({"number": bus_number})
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    update_data = {}
    
    # Update bus number (rename)
    if payload.newNumber is not None and payload.newNumber != bus_number:
        # Check if new number already exists
        existing = await db.buses.find_one({"number": payload.newNumber})
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Bus number {payload.newNumber} already exists"
            )
        
        # Update bus number
        update_data["number"] = payload.newNumber
        
        # Update all student assignments to new bus number
        await db.users.update_many(
            {"assignedBus": bus_number},
            {"$set": {"assignedBus": payload.newNumber}}
        )
    
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
        "busNumber": payload.newNumber if payload.newNumber else bus_number,
        "updated": update_data
    }


@router.delete("/buses/{bus_number}")
async def delete_bus(
    bus_number: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Admin deletes a bus
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    # Verify bus exists
    bus = await db.buses.find_one({"number": bus_number})
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    # Check if students are assigned to this bus
    student_count = await db.users.count_documents({
        "role": "student",
        "assignedBus": bus_number
    })
    
    if student_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete bus. {student_count} students are assigned to this bus"
        )
    
    # Delete the bus
    result = await db.buses.delete_one({"number": bus_number})
    
    return {
        "success": True,
        "message": f"Bus {bus_number} deleted successfully"
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


@router.post("/students")
async def create_student(
    payload: StudentCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Admin creates a new student with default password and sends email
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    # Check if student with roll_no already exists
    existing = await db.users.find_one({"roll_no": payload.roll_no})
    if existing:
        raise HTTPException(status_code=400, detail="Student with this roll number already exists")
    
    # Check if email already exists
    existing_email = await db.users.find_one({"email": payload.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already in use")
    
    # Verify route if provided
    if payload.route:
        route = await db.routes.find_one({"name": payload.route})
        if not route:
            raise HTTPException(status_code=404, detail="Route not found")
    
    # Verify bus if provided
    if payload.assignedBus:
        bus = await db.buses.find_one({"number": payload.assignedBus})
        if not bus:
            raise HTTPException(status_code=404, detail="Bus not found")
    
    # Generate default password (roll number)
    default_password = payload.roll_no
    from ..core.security import hash_password
    hashed_password = hash_password(default_password)
    
    new_student = {
        "roll_no": payload.roll_no,
        "name": payload.name,
        "email": payload.email,
        "password": hashed_password,
        "role": "student",
        "route": payload.route,
        "boarding": payload.boarding,
        "assignedBus": payload.assignedBus,
        "createdAt": datetime.now(),
        "passwordChanged": False  # Flag to track if user changed default password
    }
    
    result = await db.users.insert_one(new_student)
    
    # Send email with credentials (async task)
    email_sent = False
    email_error = None
    try:
        await send_welcome_email(payload.email, payload.name, payload.roll_no, default_password)
        email_sent = True
    except Exception as e:
        # Log the error but don't fail the student creation
        email_error = str(e)
        print(f"Failed to send email: {email_error}")
    
    message = "Student created successfully."
    if email_sent:
        message += " Welcome email sent to student."
    else:
        message += f" Note: Email could not be sent. Please share credentials manually: Roll No: {payload.roll_no}, Password: {default_password}"
    
    return {
        "success": True,
        "message": message,
        "rollNo": payload.roll_no,
        "defaultPassword": default_password,
        "emailSent": email_sent,
        "student": {
            "name": payload.name,
            "email": payload.email,
            "rollNo": payload.roll_no
        }
    }


async def send_welcome_email(email: str, name: str, roll_no: str, password: str):
    """
    Send welcome email with login credentials
    """
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    import os
    
    # Email configuration from environment variables
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SENDER_EMAIL = os.getenv("SENDER_EMAIL", "")
    SENDER_PASSWORD = os.getenv("SENDER_PASSWORD", "")
    
    print(f"\n{'='*60}")
    print(f"📧 EMAIL SENDING ATTEMPT")
    print(f"{'='*60}")
    print(f"To: {email}")
    print(f"Name: {name}")
    print(f"Roll No: {roll_no}")
    print(f"SMTP Server: {SMTP_SERVER}:{SMTP_PORT}")
    print(f"Sender Email: {SENDER_EMAIL}")
    print(f"Password Configured: {'Yes' if SENDER_PASSWORD else 'No'}")
    
    # Skip email sending if not configured
    if not SENDER_EMAIL or not SENDER_PASSWORD:
        print(f"⚠️ Email not configured. Skipping email to {email}")
        print(f"📋 Credentials: Roll No: {roll_no}, Password: {password}")
        print(f"{'='*60}\n")
        return
    
    subject = "Welcome to TripSync - Your Account Credentials"
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #FFC812; text-align: center;">Welcome to TripSync!</h2>
                <p>Dear <strong>{name}</strong>,</p>
                <p>Your student account has been created successfully. Here are your login credentials:</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #FFC812; margin: 20px 0;">
                    <p><strong>Roll Number:</strong> {roll_no}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Password:</strong> {password}</p>
                </div>
                
                <p><strong>Important:</strong></p>
                <ul>
                    <li>Please change your password after first login for security</li>
                    <li>Keep your credentials secure and do not share them</li>
                    <li>You can access TripSync at: <a href="http://localhost:5173">TripSync Portal</a></li>
                </ul>
                
                <p>If you have any questions or need assistance, please contact the administrator.</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                <p style="text-align: center; color: #888; font-size: 12px;">
                    This is an automated email. Please do not reply.
                </p>
            </div>
        </body>
    </html>
    """
    
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = SENDER_EMAIL
        message["To"] = email
        
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        print(f"📤 Attempting to send email...")
        
        # Try port 465 (SSL) first, then fallback to 587 (TLS)
        last_error = None
        for port, use_ssl in [(SMTP_PORT, SMTP_PORT == 465), (587, False), (465, True)]:
            try:
                print(f"   Trying port {port} ({'SSL' if use_ssl else 'TLS'})...")
                if use_ssl:
                    # Port 465 - SSL
                    with smtplib.SMTP_SSL(SMTP_SERVER, port, timeout=15) as server:
                        server.set_debuglevel(0)  # Set to 1 for debug output
                        server.login(SENDER_EMAIL, SENDER_PASSWORD)
                        server.send_message(message)
                else:
                    # Port 587 - TLS
                    with smtplib.SMTP(SMTP_SERVER, port, timeout=15) as server:
                        server.set_debuglevel(0)  # Set to 1 for debug output
                        server.starttls()
                        server.login(SENDER_EMAIL, SENDER_PASSWORD)
                        server.send_message(message)
                
                print(f"✅ Welcome email sent successfully to {email} via port {port}")
                print(f"{'='*60}\n")
                return  # Success - exit function
            except smtplib.SMTPAuthenticationError as e:
                last_error = e
                print(f"❌ Authentication failed on port {port}: {str(e)}")
                print(f"   Check SENDER_EMAIL and SENDER_PASSWORD in .env file")
                continue
            except smtplib.SMTPException as e:
                last_error = e
                print(f"⚠️ SMTP error on port {port}: {str(e)}")
                continue
            except Exception as e:
                last_error = e
                print(f"⚠️ Failed to send via port {port}: {str(e)}")
                continue
        
        # If all ports failed, raise the last error
        if last_error:
            print(f"❌ All email sending attempts failed")
            print(f"   Last error: {str(last_error)}")
            print(f"{'='*60}\n")
            raise last_error
    except Exception as e:
        print(f"❌ Error preparing email to {email}: {str(e)}")
        print(f"{'='*60}\n")
        raise


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
    
    # Handle both boarding and boardingPoint field names
    boarding_value = payload.boardingPoint or payload.boarding
    if boarding_value:
        update_data["boarding"] = boarding_value
        update_data["boardingPoint"] = boarding_value
    
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


@router.delete("/students/{roll_no}")
async def delete_student(
    roll_no: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Admin deletes a student
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    # Verify student exists
    student = await db.users.find_one({"roll_no": roll_no, "role": "student"})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Delete the student
    result = await db.users.delete_one({"roll_no": roll_no, "role": "student"})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return {
        "success": True,
        "message": f"Student {roll_no} deleted successfully",
        "rollNo": roll_no
    }


# ==================== PARENT MANAGEMENT ====================

@router.get("/parents")
async def get_all_parents(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get all parent accounts
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    cursor = db.users.find({"role": "parent"}, {"password": 0})
    parents = []
    
    async for parent in cursor:
        parent["_id"] = str(parent["_id"])
        parents.append(parent)
    
    return {
        "count": len(parents),
        "parents": parents
    }


@router.patch("/parents/{parent_id}")
async def update_parent(
    parent_id: str,
    payload: dict,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Admin updates parent details
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    # Verify parent exists
    try:
        parent = await db.users.find_one({"_id": ObjectId(parent_id), "role": "parent"})
    except:
        raise HTTPException(status_code=400, detail="Invalid parent ID")
    
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")
    
    update_data = {}
    
    if payload.get("name"):
        update_data["name"] = payload["name"]
    if payload.get("email"):
        # Check if email is unique
        existing = await db.users.find_one({
            "email": payload["email"],
            "_id": {"$ne": ObjectId(parent_id)}
        })
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        update_data["email"] = payload["email"]
    
    if "phone" in payload:
        update_data["phone"] = payload["phone"]
    
    if "child" in payload:
        update_data["child"] = payload["child"]
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    update_data["updatedAt"] = datetime.now()
    
    result = await db.users.update_one(
        {"_id": ObjectId(parent_id)},
        {"$set": update_data}
    )
    
    return {
        "success": True,
        "message": "Parent updated successfully",
        "parentId": parent_id,
        "updated": update_data
    }


@router.delete("/parents/{parent_id}")
async def delete_parent(
    parent_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Admin deletes a parent account
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    # Verify parent exists
    try:
        parent = await db.users.find_one({"_id": ObjectId(parent_id), "role": "parent"})
    except:
        raise HTTPException(status_code=400, detail="Invalid parent ID")
    
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")
    
    # Delete the parent
    result = await db.users.delete_one({"_id": ObjectId(parent_id), "role": "parent"})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Parent not found")
    
    return {
        "success": True,
        "message": f"Parent {parent.get('name')} deleted successfully",
        "parentId": parent_id
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


@router.post("/routes")
async def create_route(
    payload: RouteCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Admin creates a new route
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    # Check if route already exists
    existing = await db.routes.find_one({"name": payload.name})
    if existing:
        raise HTTPException(status_code=400, detail="Route name already exists")
    
    new_route = {
        "name": payload.name,
        "stops": payload.stops,
        "coverageAreas": payload.coverageAreas or [],
        "createdAt": datetime.now()
    }
    
    result = await db.routes.insert_one(new_route)
    
    return {
        "success": True,
        "message": "Route created successfully",
        "routeName": payload.name
    }


@router.patch("/routes/{route_name}")
async def update_route(
    route_name: str,
    payload: RouteUpdate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Admin updates route details
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    # Verify route exists
    route = await db.routes.find_one({"name": route_name})
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    update_data = {}
    
    if payload.stops is not None:
        update_data["stops"] = payload.stops
    
    if payload.coverageAreas is not None:
        update_data["coverageAreas"] = payload.coverageAreas
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    update_data["updatedAt"] = datetime.now()
    
    result = await db.routes.update_one(
        {"name": route_name},
        {"$set": update_data}
    )
    
    return {
        "success": True,
        "message": "Route updated successfully",
        "routeName": route_name
    }


@router.delete("/routes/{route_name}")
async def delete_route(
    route_name: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Admin deletes a route
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    # Verify route exists
    route = await db.routes.find_one({"name": route_name})
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    # Check if buses are assigned to this route
    bus_count = await db.buses.count_documents({"route": route_name})
    if bus_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete route. {bus_count} buses are assigned to this route"
        )
    
    # Check if students are assigned to this route
    student_count = await db.users.count_documents({
        "role": "student",
        "route": route_name
    })
    if student_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete route. {student_count} students are assigned to this route"
        )
    
    # Delete the route
    result = await db.routes.delete_one({"name": route_name})
    
    return {
        "success": True,
        "message": f"Route {route_name} deleted successfully"
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
