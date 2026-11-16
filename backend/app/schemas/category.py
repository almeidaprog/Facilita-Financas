from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.financial_types import FinancialType, normalize_financial_type


class CategoryCreate(BaseModel):
    user_id: int
    name: str = Field(min_length=1, max_length=100)
    category_type: FinancialType

    @field_validator("category_type", mode="before")
    @classmethod
    def normalize_category_type(cls, value: str) -> FinancialType:
        return normalize_financial_type(value)


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    category_type: FinancialType | None = None

    @field_validator("category_type", mode="before")
    @classmethod
    def normalize_category_type(cls, value: str | None) -> FinancialType | None:
        if value is None:
            return None
        return normalize_financial_type(value)


class CategoryResponse(BaseModel):
    id: int
    user_id: int
    name: str
    category_type: FinancialType
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
