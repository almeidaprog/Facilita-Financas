"""rename transactions to entries

Revision ID: 2a6d2b7f9c11
Revises: 158a94d8f405
Create Date: 2026-10-23
"""

from typing import Sequence, Union

from alembic import op


revision: str = "2a6d2b7f9c11"
down_revision: Union[str, Sequence[str], None] = "158a94d8f405"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.rename_table("transactions", "entries")
    op.alter_column("entries", "transaction_type", new_column_name="entry_type")
    op.alter_column("entries", "transaction_date", new_column_name="entry_date")
    op.execute("ALTER INDEX IF EXISTS ix_transactions_id RENAME TO ix_entries_id")


def downgrade() -> None:
    op.execute("ALTER INDEX IF EXISTS ix_entries_id RENAME TO ix_transactions_id")
    op.alter_column("entries", "entry_date", new_column_name="transaction_date")
    op.alter_column("entries", "entry_type", new_column_name="transaction_type")
    op.rename_table("entries", "transactions")
