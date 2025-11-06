from fastapi import APIRouter, Depends
from ..db import get_db
from .deps import get_current_user

router = APIRouter(prefix="/api", tags=["routes"])

@router.get("/routes")
async def get_routes(current_user=Depends(get_current_user), db=Depends(get_db)):
    cursor = db.routes.find({}, {"_id": 0})
    return [doc async for doc in cursor]
