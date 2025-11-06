from fastapi import Depends, HTTPException, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..core.security import decode_jwt
from ..db import get_db
from bson import ObjectId

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db)
):
    token = credentials.credentials
    if not token:
        raise HTTPException(status_code=401, detail="Token missing")
    
    data = decode_jwt(token)
    if not data:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user = await db.users.find_one({"_id": ObjectId(data["user_id"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user
