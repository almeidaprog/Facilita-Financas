from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post("/", response_model=UserResponse)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
):
    user = User(
        name=data.name,
        email=data.email,
        password_hash=data.password,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user