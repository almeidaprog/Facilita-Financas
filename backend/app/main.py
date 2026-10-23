from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import engine
from app.routes.categories import router as categories_router
from app.routes.entries import router as entries_router
from app.routes.financial_profile import router as financial_profile_router
from app.routes.users import router as users_router


app = FastAPI(
    title="Facilita Finanças API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Facilita Finanças API funcionando"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/database")
def database_check():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"database": "PostgreSQL conectado"}


app.include_router(users_router)
app.include_router(financial_profile_router)
app.include_router(categories_router)
app.include_router(entries_router)
