from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.schemas.user import UserCreate, UserResponse, UserInDB
from app.schemas.auth import Token
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    existing = await db.users.find_one({"email": user_in.email})
    if existing:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists.",
        )
    
    user_dict = user_in.model_dump()
    password = user_dict.pop("password")
    user_dict["password_hash"] = get_password_hash(password)
    user_dict["created_at"] = datetime.utcnow()
    user_dict["updated_at"] = datetime.utcnow()

    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = str(result.inserted_id)
    
    return user_dict

@router.post("/login", response_model=Token)
async def login(
    db: AsyncIOMotorDatabase = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = await db.users.find_one({"email": form_data.username})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if user.get("status") != "ACTIVE":
        raise HTTPException(status_code=400, detail="Inactive user")

    await db.users.update_one({"_id": user["_id"]}, {"$set": {"last_login": datetime.utcnow()}})

    access_token = create_access_token(subject=str(user["_id"]), role_id=user["role_id"])
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_current_user(current_user: UserInDB = Depends(get_current_user)):
    return current_user

@router.post("/logout")
async def logout(current_user: UserInDB = Depends(get_current_user)):
    return {"msg": "Successfully logged out"}
