# Facilita Finanças

Protótipo de controle financeiro pessoal com React, FastAPI e PostgreSQL.

## Estrutura principal

- `users`: usuários do sistema
- `financial_profiles`: renda mensal atual de cada usuário
- `categories`: categorias de receitas e despesas
- `entries`: lançamentos financeiros (`income` ou `expense`)

## Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Crie `backend/.env` a partir de `.env.example` e configure sua conexão PostgreSQL.

Depois aplique as migrations:

```powershell
alembic upgrade head
```

Inicie a API:

```powershell
uvicorn app.main:app --reload
```

Swagger:

`http://127.0.0.1:8000/docs`

## Frontend

Na raiz do projeto:

```powershell
npm install
npm run dev
```
