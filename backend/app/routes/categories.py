from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate


router = APIRouter(
    prefix="/categories",
    tags=["Categories"],
)


@router.post("/", response_model=CategoryResponse, status_code=201)
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    duplicate = (
        db.query(Category)
        .filter(
            Category.user_id == data.user_id,
            Category.name == data.name,
            Category.category_type == data.category_type,
        )
        .first()
    )
    if duplicate:
        raise HTTPException(status_code=400, detail="Categoria já cadastrada.")

    category = Category(
        user_id=data.user_id,
        name=data.name,
        category_type=data.category_type,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get("/{user_id}", response_model=list[CategoryResponse])
def list_categories(
    user_id: int,
    category_type: str | None = Query(default=None, pattern="^(income|expense)$"),
    db: Session = Depends(get_db),
):
    query = db.query(Category).filter(Category.user_id == user_id)
    if category_type:
        query = query.filter(Category.category_type == category_type)
    return query.order_by(Category.name.asc()).all()


@router.patch("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoria não encontrada.")

    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoria não encontrada.")

    db.delete(category)
    db.commit()
    return None
