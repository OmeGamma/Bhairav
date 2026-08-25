from pydantic import BaseModel, Field
from typing import List

class RoleBase(BaseModel):
    name: str
    permissions: List[str]

class RoleCreate(RoleBase):
    pass

class RoleInDB(RoleBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
