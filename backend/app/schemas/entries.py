from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.financial_types import FinancialType, normalize_financial_type


class EntryCreate(BaseModel):
    user_id: int
    category_id: int | None = None
    description: str | None = Field(default=None, max_length=255)
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    entry_type: FinancialType
    entry_date: date
    notes: str | None = None

    @field_validator("entry_type", mode="before")
    @classmethod
    def normalize_entry_type(cls, value: str) -> FinancialType:
        return normalize_financial_type(value)


class EntryUpdate(BaseModel):
    category_id: int | None = None
    description: str | None = Field(default=None, max_length=255)
    amount: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    entry_type: FinancialType | None = None
    entry_date: date | None = None
    notes: str | None = None

    @field_validator("entry_type", mode="before")
    @classmethod
    def normalize_entry_type(cls, value: str | None) -> FinancialType | None:
        if value is None:
            return None
        return normalize_financial_type(value)


class EntryResponse(BaseModel):
    id: int
    user_id: int
    category_id: int | None
    description: str
    amount: Decimal
    entry_type: FinancialType
    entry_date: date
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
