import os
from logging.config import fileConfig

from alembic import context
from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool

from app.database import Base
from app import models


# Carrega o arquivo .env localizado na pasta backend
load_dotenv()

# Objeto de configuração do Alembic
config = context.config

# Lê a URL do PostgreSQL do .env
database_url = os.getenv("DATABASE_URL")

if not database_url:
    raise RuntimeError("DATABASE_URL não encontrada no arquivo .env")

# Sobrescreve a URL padrão do alembic.ini
config.set_main_option("sqlalchemy.url", database_url)

# Configuração de logs
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata dos models SQLAlchemy
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Executa migrations sem abrir conexão direta com o banco."""

    url = config.get_main_option("sqlalchemy.url")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Executa migrations conectando diretamente ao PostgreSQL."""

    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()