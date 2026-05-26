"""Add wallet auth tables

Revision ID: b7e3a1f9c2d5
Revises: a3f2c1d4e5b6
Create Date: 2026-05-26 00:01:00.000000

"""
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "b7e3a1f9c2d5"
down_revision = "a3f2c1d4e5b6"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "wallet_session",
        sa.Column("wallet_address", sqlmodel.sql.sqltypes.AutoString(length=42), nullable=False),
        sa.Column("nonce", sqlmodel.sql.sqltypes.AutoString(length=64), nullable=False),
        sa.Column("nonce_expired_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("wallet_address"),
    )

    op.create_table(
        "subscription",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("wallet_address", sqlmodel.sql.sqltypes.AutoString(length=42), nullable=False),
        sa.Column("camera_limit", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("plan", sqlmodel.sql.sqltypes.AutoString(length=16), nullable=False, server_default="free"),
        sa.Column("tx_hash", sqlmodel.sql.sqltypes.AutoString(length=66), nullable=True),
        sa.Column("amount_paid", sa.Float(), nullable=False, server_default="0"),
        sa.Column("chain_id", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expired_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_subscription_wallet_address", "subscription", ["wallet_address"])

    op.create_table(
        "usage_session",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("wallet_address", sqlmodel.sql.sqltypes.AutoString(length=42), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("used_minutes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_active", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_usage_session_wallet_address", "usage_session", ["wallet_address"])
    op.create_index("ix_usage_session_date", "usage_session", ["date"])


def downgrade():
    op.drop_index("ix_usage_session_date", table_name="usage_session")
    op.drop_index("ix_usage_session_wallet_address", table_name="usage_session")
    op.drop_table("usage_session")
    op.drop_index("ix_subscription_wallet_address", table_name="subscription")
    op.drop_table("subscription")
    op.drop_table("wallet_session")
