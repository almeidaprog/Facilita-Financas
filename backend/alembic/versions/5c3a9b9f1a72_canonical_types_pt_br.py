"""canonical financial types in pt-BR

Revision ID: 5c3a9b9f1a72
Revises: 44d52d31c8a0
Create Date: 2026-11-11
"""

from typing import Sequence, Union

from alembic import op


revision: str = "5c3a9b9f1a72"
down_revision: Union[str, Sequence[str], None] = "44d52d31c8a0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("ck_entries_type", "entries", type_="check")
    op.drop_constraint("ck_categories_type", "categories", type_="check")

    op.execute(
        """
        UPDATE categories
        SET category_type = CASE
            WHEN LOWER(TRIM(category_type)) IN ('receita', 'entrada', 'income') THEN 'receita'
            WHEN LOWER(TRIM(category_type)) IN ('despesa', 'saida', 'saída', 'expense') THEN 'despesa'
            ELSE category_type
        END
        """
    )

    op.execute(
        """
        UPDATE entries
        SET entry_type = CASE
            WHEN LOWER(TRIM(entry_type)) IN ('receita', 'entrada', 'income') THEN 'receita'
            WHEN LOWER(TRIM(entry_type)) IN ('despesa', 'saida', 'saída', 'expense') THEN 'despesa'
            ELSE entry_type
        END
        """
    )

    op.create_check_constraint(
        "ck_categories_type",
        "categories",
        "category_type IN ('receita', 'despesa')",
    )
    op.create_check_constraint(
        "ck_entries_type",
        "entries",
        "entry_type IN ('receita', 'despesa')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_entries_type", "entries", type_="check")
    op.drop_constraint("ck_categories_type", "categories", type_="check")

    op.execute(
        """
        UPDATE categories
        SET category_type = CASE
            WHEN category_type = 'receita' THEN 'income'
            WHEN category_type = 'despesa' THEN 'expense'
            ELSE category_type
        END
        """
    )
    op.execute(
        """
        UPDATE entries
        SET entry_type = CASE
            WHEN entry_type = 'receita' THEN 'income'
            WHEN entry_type = 'despesa' THEN 'expense'
            ELSE entry_type
        END
        """
    )

    op.create_check_constraint(
        "ck_categories_type",
        "categories",
        "category_type IN ('income', 'expense')",
    )
    op.create_check_constraint(
        "ck_entries_type",
        "entries",
        "entry_type IN ('income', 'expense')",
    )
