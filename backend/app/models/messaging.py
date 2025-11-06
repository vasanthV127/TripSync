"""
Pydantic models for messaging system
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MessageCreate(BaseModel):
    """Base message creation model"""
    content: str


class BroadcastMessage(BaseModel):
    """Broadcast message to all students"""
    content: str


class RouteMessage(BaseModel):
    """Send message to route-specific users"""
    routeName: str
    content: str
    recipientType: str  # "students", "drivers", "parents", "all"


class DriverMessage(BaseModel):
    """Driver sends message to assigned students"""
    content: str


class ComplaintCreate(BaseModel):
    """Student complaint submission"""
    category: str  # "rash_driving", "lost_found", "bus_issue", "other"
    description: str
    busNumber: Optional[str] = None


class ComplaintUpdate(BaseModel):
    """Admin updates complaint status"""
    status: str  # "pending", "in_progress", "resolved"
    adminResponse: Optional[str] = None


class LeaveRequest(BaseModel):
    """Driver leave request"""
    date: str  # YYYY-MM-DD
    reason: str


class LeaveApproval(BaseModel):
    """Admin approves/rejects leave"""
    approved: bool
    substituteDriverId: Optional[str] = None
    adminNotes: Optional[str] = None


class StudentUpdate(BaseModel):
    """Admin updates student details"""
    name: Optional[str] = None
    email: Optional[str] = None
    route: Optional[str] = None
    boarding: Optional[str] = None
    assignedBus: Optional[str] = None


class BusUpdate(BaseModel):
    """Admin updates bus details"""
    driverId: Optional[str] = None
    route: Optional[str] = None


class DriverUpdate(BaseModel):
    """Admin updates driver details"""
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    assignedBus: Optional[str] = None
