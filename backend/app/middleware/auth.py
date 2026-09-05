from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from pydantic import ValidationError
from typing import List, Callable, Optional

from app.core.config import settings
from app.core.database import get_db
from app.schemas.auth import TokenPayload
from app.schemas.user import UserInDB
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(
    db: AsyncIOMotorDatabase = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> UserInDB:
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (jwt.PyJWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not token_data.sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_dict = await db.users.find_one({"_id": ObjectId(token_data.sub)})
    if not user_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user_dict["_id"] = str(user_dict["_id"])
    user = UserInDB(**user_dict)
    
    if user.status != "ACTIVE":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    
    return user

def require_permissions(required_permissions: List[str]) -> Callable:
    async def permission_checker(
        current_user: UserInDB = Depends(get_current_user),
        db: AsyncIOMotorDatabase = Depends(get_db)
    ):
        role_dict = await db.roles.find_one({"_id": current_user.role_id})
        if not role_dict:
            # If no role ID matches in DB, maybe they are super ADMIN or the role string itself was stored
            # For simplicity, if role_id is a string like "ADMIN", we check hardcoded or string-based mapping
            role_dict = await db.roles.find_one({"name": current_user.role_id})
            if not role_dict:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Role not found")
        
        user_permissions = set(role_dict.get("permissions", []))
        
        # Admin bypass or full match
        if "system.admin" in user_permissions:
            return current_user

        for perm in required_permissions:
            if perm not in user_permissions:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN, 
                    detail=f"Not enough permissions. Required: {perm}"
                )
        return current_user
    return permission_checker


async def get_current_user_ws(token: Optional[str], db: AsyncIOMotorDatabase) -> Optional[UserInDB]:
    """
    WebSocket authentication function.
    
    Similar to get_current_user but for WebSocket connections.
    """
    if not token:
        return None
    
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (jwt.PyJWTError, ValidationError):
        return None
    
    if not token_data.sub:
        return None

    user_dict = await db.users.find_one({"_id": ObjectId(token_data.sub)})
    if not user_dict:
        return None
    
    user_dict["_id"] = str(user_dict["_id"])
    user = UserInDB(**user_dict)
    
    if user.status != "ACTIVE":
        return None
    
    return user
