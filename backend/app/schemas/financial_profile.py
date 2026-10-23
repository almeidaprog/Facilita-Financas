from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class FinancialProfileCreate(BaseModel):
    user_id: int
    monthly_income: Decimal = Field(ge=0, max_digits=12, decimal_places=2)


class FinancialProfileUpdate(BaseModel):
    monthly_income: Decimal = Field(ge=0, max_digits=12, decimal_places=2)


class FinancialProfileResponse(BaseModel):
    id: int
    user_id: int
    monthly_income: Decimal
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
