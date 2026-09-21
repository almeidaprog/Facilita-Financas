from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


# Dados recebidos pela API durante o cadastro de um usuário.
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

# Dados recebidos pela API para o Login de um usuário já criado.
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Dados retornados pela API.
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)