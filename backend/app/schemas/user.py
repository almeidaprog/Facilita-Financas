from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


#cria o modelo da tabela usuário, isso é o que o usuário vai responder.
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

#
class UserLogin(BaseModel):
    email: EmailStr
    password: str

#o banco vai guardar isso.
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)