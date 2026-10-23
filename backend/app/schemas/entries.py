from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class EntryCreate(BaseModel):
    user_id: int
    category_id: int | None = None
    description: str | None = Field(default=None, max_length=255)
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    entry_type: Literal["income", "expense"]
    entry_date: date
    notes: str | None = None


class EntryUpdate(BaseModel):
    category_id: int | None = None
    description: str | None = Field(default=None, max_length=255)
    amount: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    entry_type: Literal["income", "expense"] | None = None
    entry_date: date | None = None
    notes: str | None = None


class EntryResponse(BaseModel):
    id: int
    user_id: int
    category_id: int | None
    description: str
    amount: Decimal
    entry_type: str
    entry_date: date
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
