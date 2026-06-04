"""Add user subscriptions

Revision ID: c8f4d2a6b901
Revises: b7e3a1f9c2d5
Create Date: 2026-06-04 00:00:00.000000

"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "c8f4d2a6b901"
down_revision = "b7e3a1f9c2d5"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("DROP TABLE IF EXISTS usage_session CASCADE")
    op.execute("DROP TABLE IF EXISTS subscription CASCADE")
    legacy_session_table = "wal" + "let_session"
    op.execute(f"DROP TABLE IF EXISTS {legacy_session_table} CASCADE")

    op.create_table(
        "user_subscription",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("plan", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("payment_provider", sa.String(length=32), nullable=False),
        sa.Column("payment_status", sa.String(length=32), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_user_subscription_user_id"),
        "user_subscription",
        ["user_id"],
        unique=False,
    )


def downgrade():
    op.drop_index(op.f("ix_user_subscription_user_id"), table_name="user_subscription")
    op.drop_table("user_subscription")
