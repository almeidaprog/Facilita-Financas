from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class CategoryCreate(BaseModel):
    user_id: int
    name: str = Field(min_length=1, max_length=100)
    category_type: Literal["income", "expense"]


class CategoryUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class CategoryResponse(BaseModel):
    id: int
    user_id: int
    name: str
    category_type: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
