from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.category import Category
from app.models.entries import Entry
from app.models.user import User
from app.schemas.entries import EntryCreate, EntryResponse, EntryUpdate


router = APIRouter(
    prefix="/entries",
    tags=["Entries"],
)


def validate_category(
    db: Session,
    user_id: int,
    category_id: int | None,
    entry_type: str,
) -> None:
    if category_id is None:
        return

    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoria não encontrada.")
    if category.user_id != user_id:
        raise HTTPException(status_code=400, detail="Categoria não pertence ao usuário.")
    if category.category_type != entry_type:
        raise HTTPException(
            status_code=400,
            detail="O tipo da categoria não corresponde ao tipo do lançamento.",
        )


@router.post("/", response_model=EntryResponse, status_code=201)
def create_entry(
    data: EntryCreate,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    validate_category(db, data.user_id, data.category_id, data.entry_type)

    entry = Entry(
        user_id=data.user_id,
        category_id=data.category_id,
        description=data.description or "Lançamento",
        amount=data.amount,
        entry_type=data.entry_type,
        entry_date=data.entry_date,
        notes=data.notes,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/{user_id}", response_model=list[EntryResponse])
def list_entries(
    user_id: int,
    db: Session = Depends(get_db),
):
    return (
        db.query(Entry)
        .filter(Entry.user_id == user_id)
        .order_by(Entry.entry_date.desc(), Entry.id.desc())
        .all()
    )


@router.patch("/{entry_id}", response_model=EntryResponse)
def update_entry(
    entry_id: int,
    data: EntryUpdate,
    db: Session = Depends(get_db),
):
    entry = db.query(Entry).filter(Entry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Lançamento não encontrado.")

    updates = data.model_dump(exclude_unset=True)
    new_entry_type = updates.get("entry_type", entry.entry_type)
    new_category_id = updates.get("category_id", entry.category_id)
    validate_category(db, entry.user_id, new_category_id, new_entry_type)

    if "description" in updates and updates["description"] is None:
        updates["description"] = "Lançamento"

    for field, value in updates.items():
        setattr(entry, field, value)

    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=204)
def delete_entry(
    entry_id: int,
    db: Session = Depends(get_db),
):
    entry = db.query(Entry).filter(Entry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Lançamento não encontrado.")

    db.delete(entry)
    db.commit()
    return None
