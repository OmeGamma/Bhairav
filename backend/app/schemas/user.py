from pydantic import BaseModel, EmailStr, Field, model_validator, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role_id: str = "officer"
    status: str = "ACTIVE"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role_id: Optional[str] = None
    status: Optional[str] = None
    password: Optional[str] = None

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    password_hash: str
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    model_config = ConfigDict(populate_by_name=True)

class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    model_config = ConfigDict(extra='ignore')

    @model_validator(mode='before')
    @classmethod
    def convert_id(cls, data):
        if isinstance(data, dict) and '_id' in data:
            data = data.copy()
            data['id'] = str(data.pop('_id'))
        return data
