from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.financial_profile import FinancialProfile
from app.models.user import User
from app.schemas.financial_profile import (
    FinancialProfileCreate,
    FinancialProfileResponse,
    FinancialProfileUpdate,
)


router = APIRouter(
    prefix="/financial-profile",
    tags=["Financial Profile"],
)


@router.post("/", response_model=FinancialProfileResponse, status_code=201)
def create_financial_profile(
    data: FinancialProfileCreate,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    existing = (
        db.query(FinancialProfile)
        .filter(FinancialProfile.user_id == data.user_id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Este usuário já possui um perfil financeiro.",
        )

    profile = FinancialProfile(
        user_id=data.user_id,
        monthly_income=data.monthly_income,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/{user_id}", response_model=FinancialProfileResponse)
def get_financial_profile(
    user_id: int,
    db: Session = Depends(get_db),
):
    profile = (
        db.query(FinancialProfile)
        .filter(FinancialProfile.user_id == user_id)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil financeiro não encontrado.")
    return profile


@router.patch("/{user_id}", response_model=FinancialProfileResponse)
def update_financial_profile(
    user_id: int,
    data: FinancialProfileUpdate,
    db: Session = Depends(get_db),
):
    profile = (
        db.query(FinancialProfile)
        .filter(FinancialProfile.user_id == user_id)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil financeiro não encontrado.")

    profile.monthly_income = data.monthly_income
    db.commit()
    db.refresh(profile)
    return profile
