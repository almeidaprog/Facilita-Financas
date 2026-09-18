from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.security import hash_password, verify_password

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post("/", response_model=UserResponse, status_code=201)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
):
    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
    )

    db.add(user)

    try:
        db.commit()
        db.refresh(user)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Já existe um usuário com este e-mail."
        )

    return user


@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    #Procura no banco o usuário que possui o e-mail informado.
    user = db.query(User).filter(User.email == data.email).first()

    #Se o usuário não for encontrado, então dá erro no login
    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Email ou Senha incorreto"
        )
    #Verifica se a senha informada corresponde ao hash salvo no banco.
    if not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Email ou senha incorreto"
        )