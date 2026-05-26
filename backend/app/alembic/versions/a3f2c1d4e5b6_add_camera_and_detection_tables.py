"""Add camera and detection tables

Revision ID: a3f2c1d4e5b6
Revises: 1a31ce608336
Create Date: 2026-05-26 00:00:00.000000

"""
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "a3f2c1d4e5b6"
down_revision = "fe56fa70289e"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "camera",
        sa.Column("name", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column("location", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column("stream_url", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("camera_type", sqlmodel.sql.sqltypes.AutoString(), nullable=False, server_default="traffic"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "detection",
        sa.Column("plate_number", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("vehicle_type", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("location", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("status", sqlmodel.sql.sqltypes.AutoString(), nullable=False, server_default="detected"),
        sa.Column("image_path", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("cropped_plate_path", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("violation_type", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("speed", sa.Float(), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("camera_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(["camera_id"], ["camera.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_detection_plate_number", "detection", ["plate_number"])
    op.create_index("ix_detection_created_at", "detection", ["created_at"])


def downgrade():
    op.drop_index("ix_detection_created_at", table_name="detection")
    op.drop_index("ix_detection_plate_number", table_name="detection")
    op.drop_table("detection")
    op.drop_table("camera")
