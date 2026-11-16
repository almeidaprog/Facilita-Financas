"""normalize financial types

Revision ID: 44d52d31c8a0
Revises: 2a6d2b7f9c11
Create Date: 2026-10-26
"""

from typing import Sequence, Union

from alembic import op


revision: str = "44d52d31c8a0"
down_revision: Union[str, Sequence[str], None] = "2a6d2b7f9c11"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Corrige valores legados em português antes de restringir o domínio.
    op.execute(
        """
        UPDATE categories
        SET category_type = CASE
            WHEN LOWER(TRIM(category_type)) IN ('receita', 'entrada', 'income') THEN 'income'
            WHEN LOWER(TRIM(category_type)) IN ('despesa', 'saida', 'saída', 'expense') THEN 'expense'
            ELSE category_type
        END
        """
    )

    op.execute(
        """
        UPDATE entries
        SET entry_type = CASE
            WHEN LOWER(TRIM(entry_type)) IN ('receita', 'entrada', 'income') THEN 'income'
            WHEN LOWER(TRIM(entry_type)) IN ('despesa', 'saida', 'saída', 'expense') THEN 'expense'
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
    op.create_check_constraint(
        "ck_entries_amount_positive",
        "entries",
        "amount > 0",
    )


def downgrade() -> None:
    op.drop_constraint("ck_entries_amount_positive", "entries", type_="check")
    op.drop_constraint("ck_entries_type", "entries", type_="check")
    op.drop_constraint("ck_categories_type", "categories", type_="check")
