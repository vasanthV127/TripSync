import re
from typing import List, Dict, Any, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from math import radians, sin, cos, sqrt, atan2


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points in meters using Haversine formula"""
    R = 6371000  # Earth radius in meters
    
    lat1, lon1, lat2, lon2 = radians(lat1), radians(lon1), radians(lat2), radians(lon2)
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    return R * c


def calculate_current_stop_index(bus_location: Dict[str, Any], route: Dict[str, Any]) -> int:
    """Calculate currentStopIndex based on proximity to route stops"""
    if not route or not bus_location:
        return 0
    
    stops = route.get('stops', [])
    if not stops:
        return 0
    
    lat = bus_location.get('lat')
    lon = bus_location.get('long')
    if lat is None or lon is None:
        return 0
    
    # Find closest stop
    min_distance = float('inf')
    closest_index = 0
    
    for idx, stop in enumerate(stops):
        stop_lat = stop.get('lat')
        stop_lon = stop.get('long')
        if stop_lat is None or stop_lon is None:
            continue
        
        distance = haversine_distance(lat, lon, stop_lat, stop_lon)
        if distance < min_distance:
            min_distance = distance
            closest_index = idx
    
    # If within 500m of a stop, consider we're at that stop
    # Otherwise, use the last passed stop
    if min_distance < 500:
        return closest_index
    else:
        # Return the previous stop index (we're traveling between stops)
        return max(0, closest_index - 1) if closest_index > 0 else 0


def _normalize_name(name: Optional[str]) -> str:
    if not name:
        return ""
    s = re.sub(r"\(.*?\)", "", name)
    s = re.sub(r"[^0-9a-zA-Z ]", "", s)
    return s.strip().lower()


async def get_route(db: AsyncIOMotorDatabase, route_name: Optional[str]) -> Optional[Dict[str, Any]]:
    if not route_name:
        return None
    return await db.routes.find_one({"name": route_name})


def get_coverage_points_by_route(route: Dict[str, Any], current_stop_index: Optional[int] = None) -> List[Dict[str, Any]]:
    if not route:
        return []
    coverage = route.get("coverageAreas", []) or []
    stops = route.get("stops", []) or []
    points: List[Dict[str, Any]] = []

    for idx, cov in enumerate(coverage):
        norm_cov = _normalize_name(cov)
        matched = None

        # exact match
        for stop in stops:
            if _normalize_name(stop.get("name")) == norm_cov:
                matched = {
                    "name": stop.get("name"),
                    "lat": stop.get("lat"),
                    "long": stop.get("long"),
                    "order": idx,
                }
                break
        # contains match
        if not matched:
            for stop in stops:
                if norm_cov in _normalize_name(stop.get("name")):
                    matched = {
                        "name": stop.get("name"),
                        "lat": stop.get("lat"),
                        "long": stop.get("long"),
                        "order": idx,
                    }
                    break
        if not matched:
            matched = {"name": cov, "lat": None, "long": None, "order": idx}
        
        # Add status based on currentStopIndex
        if current_stop_index is not None:
            if idx < current_stop_index:
                matched["status"] = "passed"
            elif idx == current_stop_index:
                matched["status"] = "current"
            else:
                matched["status"] = "upcoming"
        
        points.append(matched)

    return points


async def get_coverage_points_for_bus(db: AsyncIOMotorDatabase, bus_number: Optional[str]) -> List[Dict[str, Any]]:
    if not bus_number:
        return []
    bus = await db.buses.find_one({"number": bus_number})
    if not bus:
        return []
    route = await get_route(db, bus.get("route"))
    if not route:
        return []
    current_stop_index = bus.get("currentStopIndex", 0)
    return get_coverage_points_by_route(route, current_stop_index)
