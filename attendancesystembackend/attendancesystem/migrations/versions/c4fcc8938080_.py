"""empty message

Revision ID: c4fcc8938080
Revises: 
Create Date: 2021-04-02 23:43:47.359425

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'c4fcc8938080'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('feedback',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('rating', sa.Integer(), nullable=True),
    sa.Column('comment', sa.String(length=40), nullable=True),
    sa.Column('course_code', sa.String(length=40), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('location',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('latitude', sa.Integer(), nullable=True),
    sa.Column('longitude', sa.Integer(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('schedule',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('day', sa.Integer(), nullable=True),
    sa.Column('period', sa.Integer(), nullable=True),
    sa.Column('start_time', mysql.TIME(), nullable=True),
    sa.Column('end_time', mysql.TIME(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('staff',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('staff_name', sa.String(length=40), nullable=True),
    sa.Column('staff_id_no', sa.Integer(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('user',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('ukey', sa.String(length=240), nullable=True),
    sa.Column('display_name', sa.String(length=100), nullable=True),
    sa.Column('pub_key', sa.String(length=540), nullable=True),
    sa.Column('sign_count', sa.Integer(), nullable=True),
    sa.Column('username', sa.String(length=50), nullable=True),
    sa.Column('emailid', sa.String(length=50), nullable=True),
    sa.Column('rollno', sa.Integer(), nullable=True),
    sa.Column('rp_id', sa.String(length=540), nullable=True),
    sa.Column('icon_url', sa.String(length=540), nullable=True),
    sa.Column('credential_id', sa.String(length=540), nullable=True),
    sa.Column('is_staff', sa.Boolean(), nullable=True),
    sa.Column('password', sa.String(length=50), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('attendance',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('staff_id', sa.Integer(), nullable=True),
    sa.Column('roll_no', sa.Integer(), nullable=True),
    sa.Column('period', sa.Integer(), nullable=True),
    sa.Column('is_present', sa.Boolean(), nullable=True),
    sa.Column('is_fingerprint', sa.Boolean(), nullable=True),
    sa.Column('logged_time', sa.DateTime(), nullable=True),
    sa.Column('course_code', sa.String(length=40), nullable=True),
    sa.Column('location_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['location_id'], ['location.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('location_id')
    )
    op.create_table('course',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('course_name', sa.String(length=40), nullable=True),
    sa.Column('course_code', sa.String(length=40), nullable=True),
    sa.Column('latitude', sa.Integer(), nullable=True),
    sa.Column('longitude', sa.Integer(), nullable=True),
    sa.Column('staff_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['staff_id'], ['staff.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('schedule_course',
    sa.Column('course_id', sa.Integer(), nullable=True),
    sa.Column('schedule_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['course_id'], ['course.id'], ),
    sa.ForeignKeyConstraint(['schedule_id'], ['schedule.id'], )
    )
    op.create_table('user_course',
    sa.Column('course_id', sa.Integer(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['course_id'], ['course.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], )
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('user_course')
    op.drop_table('schedule_course')
    op.drop_table('course')
    op.drop_table('attendance')
    op.drop_table('user')
    op.drop_table('staff')
    op.drop_table('schedule')
    op.drop_table('location')
    op.drop_table('feedback')
    # ### end Alembic commands ###
