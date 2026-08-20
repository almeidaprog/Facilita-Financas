from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import engine


app = FastAPI(
    title="Facilita Finanças API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Facilita Finanças API funcionando"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.get("/database")
def database_check():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {
        "database": "PostgreSQL conectado"
    }