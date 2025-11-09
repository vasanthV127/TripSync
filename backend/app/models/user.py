from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str
    regNo: Optional[str] = None
    assignedRoute: Optional[str] = None
    assignedBus: Optional[str] = None
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    token: str
    role: str

class UserPublic(BaseModel):
    id: str = Field(alias="_id")
    email: EmailStr
    role: str
    name: Optional[str] = None

    class Config:
        populate_by_name = True
