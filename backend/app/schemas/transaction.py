from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class TransactionCreate(BaseModel):
    user_id: int
    account_id: int
    category_id: int | None = None
    description: str
    amount: Decimal
    transaction_type: str
    transaction_date: date
    notes: str | None = None


class TransactionResponse(BaseModel):
    id: int
    user_id: int
    account_id: int
    category_id: int | None
    description: str
    amount: Decimal
    transaction_type: str
    transaction_date: date
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)