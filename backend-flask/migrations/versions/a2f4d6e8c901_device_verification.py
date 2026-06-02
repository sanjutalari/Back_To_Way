"""Add device verification fields

Revision ID: a2f4d6e8c901
Revises: 577d02d93307
Create Date: 2026-06-01 22:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'a2f4d6e8c901'
down_revision = '577d02d93307'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('item', schema=None) as batch_op:
        batch_op.add_column(sa.Column('brand', sa.String(length=120), nullable=True))
        batch_op.add_column(sa.Column('model_number', sa.String(length=120), nullable=True))
        batch_op.add_column(sa.Column('serial_number', sa.String(length=160), nullable=True))
        batch_op.add_column(sa.Column('imei', sa.String(length=80), nullable=True))
        batch_op.add_column(sa.Column('product_id', sa.String(length=120), nullable=True))
        batch_op.add_column(sa.Column('last_seen_location', sa.String(length=255), nullable=True))
        batch_op.create_index(batch_op.f('ix_item_imei'), ['imei'], unique=False)
        batch_op.create_index(batch_op.f('ix_item_model_number'), ['model_number'], unique=False)
        batch_op.create_index(batch_op.f('ix_item_product_id'), ['product_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_item_serial_number'), ['serial_number'], unique=False)

    op.create_table(
        'verification_search',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('imei', sa.String(length=80), nullable=True),
        sa.Column('serial_number', sa.String(length=160), nullable=True),
        sa.Column('model_number', sa.String(length=120), nullable=True),
        sa.Column('product_id', sa.String(length=120), nullable=True),
        sa.Column('result_status', sa.String(length=40), nullable=False),
        sa.Column('matched_item_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['matched_item_id'], ['item.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('verification_search', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_verification_search_imei'), ['imei'], unique=False)
        batch_op.create_index(batch_op.f('ix_verification_search_model_number'), ['model_number'], unique=False)
        batch_op.create_index(batch_op.f('ix_verification_search_product_id'), ['product_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_verification_search_serial_number'), ['serial_number'], unique=False)


def downgrade():
    with op.batch_alter_table('verification_search', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_verification_search_serial_number'))
        batch_op.drop_index(batch_op.f('ix_verification_search_product_id'))
        batch_op.drop_index(batch_op.f('ix_verification_search_model_number'))
        batch_op.drop_index(batch_op.f('ix_verification_search_imei'))
    op.drop_table('verification_search')

    with op.batch_alter_table('item', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_item_serial_number'))
        batch_op.drop_index(batch_op.f('ix_item_product_id'))
        batch_op.drop_index(batch_op.f('ix_item_model_number'))
        batch_op.drop_index(batch_op.f('ix_item_imei'))
        batch_op.drop_column('last_seen_location')
        batch_op.drop_column('product_id')
        batch_op.drop_column('imei')
        batch_op.drop_column('serial_number')
        batch_op.drop_column('model_number')
        batch_op.drop_column('brand')
