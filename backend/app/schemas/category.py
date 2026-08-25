from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CategoryCreate(BaseModel):
    user_id: int
    name: str
    category_type: str


class CategoryResponse(BaseModel):
    id: int
    user_id: int
    name: str
    category_type: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)