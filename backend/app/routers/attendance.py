from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from ..db import get_db
from .deps import get_current_user

router = APIRouter(prefix="/api", tags=["attendance"])

@router.post("/attendance/board")
async def board_bus(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Student marks attendance when boarding the bus"""
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Unauthorized - student only")
    
    timestamp = datetime.now()
    date_str = timestamp.strftime("%Y-%m-%d")
    bus_number = current_user.get("assignedBus")
    
    if not bus_number:
        raise HTTPException(status_code=400, detail="No bus assigned to student")
    
    bus = await db.buses.find_one({"number": bus_number})
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    loc = bus.get("currentLocation", {})
    
    # Check if already marked today
    existing = await db.attendance.find_one({
        "roll_no": current_user.get("roll_no"), 
        "date": date_str
    })
    if existing:
        raise HTTPException(status_code=400, detail="Attendance already marked today")
    
    record = {
        "name": current_user.get("name"),
        "roll_no": current_user.get("roll_no"),
        "route": current_user.get("route"),
        "boarding": current_user.get("boarding"),
        "busNumber": bus_number,
        "date": date_str,
        "time": timestamp.strftime("%H:%M:%S"),
        "status": "Boarded",
        "location": loc,
        "timestamp": timestamp
    }
    await db.attendance.insert_one(record)
    
    return {
        "message": f"Attendance marked! Boarded at {record['time']}",
        "record": {
            "name": record["name"],
            "roll_no": record["roll_no"],
            "busNumber": bus_number,
            "time": record["time"],
            "location": loc
        }
    }

@router.get("/attendance")
async def get_attendance(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
    date: Optional[str] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    roll_no: Optional[str] = Query(None, description="Filter by roll number"),
    busNumber: Optional[str] = Query(None, description="Filter by bus number")
):
    """Get attendance records with optional filters"""
    
    # Build query based on role and filters
    query = {}
    
    if current_user.get("role") == "student":
        # Students can only see their own attendance
        query["roll_no"] = current_user.get("roll_no")
    elif current_user.get("role") == "parent":
        # Parents can see their child's attendance
        child_name = current_user.get("child")
        if child_name:
            query["name"] = child_name
    elif current_user.get("role") in ["admin", "driver"]:
        # Admin and drivers can filter by various params
        if roll_no:
            query["roll_no"] = roll_no
        if busNumber:
            query["busNumber"] = busNumber
    else:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Add date filter if provided
    if date:
        query["date"] = date
    
    # Fetch records
    cursor = db.attendance.find(query, {"_id": 0}).sort("timestamp", -1)
    records = [doc async for doc in cursor]
    
    return {
        "count": len(records),
        "records": records
    }

# Keep old endpoint for backward compatibility
@router.post("/attendance/manual")
async def mark_attendance_manual(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Legacy endpoint - redirects to /board"""
    return await board_bus(current_user, db)
