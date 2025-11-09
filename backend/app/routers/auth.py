from fastapi import APIRouter, Depends, HTTPException
from fastapi import status
from ..db import get_db
from ..core.security import hash_password, verify_password, create_jwt
from ..models.user import UserCreate, UserLogin, TokenResponse
from pymongo.errors import PyMongoError
from bson import ObjectId

router = APIRouter(prefix="/api", tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, db = Depends(get_db)):
    try:
        existing = await db.users.find_one({"email": payload.email})
        if existing:
            raise HTTPException(status_code=400, detail="User already exists")
        hashed = hash_password(payload.password)
        doc = payload.dict()
        doc["password"] = hashed
        res = await db.users.insert_one(doc)
        return {"message": "Registered", "user_id": str(res.inserted_id)}
    except PyMongoError:
        raise HTTPException(status_code=500, detail="Database error")

@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db = Depends(get_db)):
    user = await db.users.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_jwt(str(user["_id"]))
    return TokenResponse(token=token, role=user.get("role", "user"))
