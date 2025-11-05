from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from ..db import get_db
from .deps import get_current_user
from ..utils.coverage import get_coverage_points_for_bus

router = APIRouter(prefix="/api", tags=["buses"])

class BusLocationUpdate(BaseModel):
    busNumber: str
    lat: float
    long: float

@router.get("/buses")
async def get_buses(current_user=Depends(get_current_user), db=Depends(get_db)):
    cursor = db.buses.find({}, {"_id": 0})
    buses = [doc async for doc in cursor]
    # enrich with coverage points for timeline
    enriched = []
    for b in buses:
        cov = await get_coverage_points_for_bus(db, b.get("number"))
        b_copy = {**b, "coveragePoints": cov}
        enriched.append(b_copy)
    return enriched

@router.post("/buses/location")
async def update_bus_location(
    payload: BusLocationUpdate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Manually update bus GPS location (admin/driver only)"""
    if current_user.get("role") not in ["admin", "driver"]:
        raise HTTPException(status_code=403, detail="Unauthorized - admin or driver required")
    
    bus_location = {
        "lat": payload.lat,
        "long": payload.long,
        "timestamp": datetime.now()
    }
    
    # Calculate new currentStopIndex based on location
    bus = await db.buses.find_one({"number": payload.busNumber})
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    from ..utils.coverage import get_route, calculate_current_stop_index
    route = await get_route(db, bus.get("route"))
    
    update_data = {"currentLocation": bus_location}
    if route:
        new_stop_index = calculate_current_stop_index(bus_location, route)
        update_data["currentStopIndex"] = new_stop_index
    
    result = await db.buses.update_one(
        {"number": payload.busNumber},
        {"$set": update_data}
    )
    
    # include coverage points in response for UI timeline
    coverage = await get_coverage_points_for_bus(db, payload.busNumber)
    
    return {
        "message": "Bus location updated",
        "busNumber": payload.busNumber,
        "location": bus_location,
        "currentStopIndex": update_data.get("currentStopIndex"),
        "coveragePoints": coverage
    }
