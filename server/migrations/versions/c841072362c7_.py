"""empty message

Revision ID: c841072362c7
Revises: 8de387788710
Create Date: 2022-02-11 18:20:27.183660

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c841072362c7'
down_revision = '8de387788710'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('imagePost')
    op.drop_table('comment')
    op.drop_table('author')
    op.drop_table('post')
    op.drop_table('inbox')
    op.drop_table('like')
    op.drop_table('requests')
    op.drop_table('textPost')
    op.drop_table('viewablePostRelation')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('viewablePostRelation',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('post', sa.INTEGER(), nullable=True),
    sa.Column('viewConsumer', sa.INTEGER(), nullable=True),
    sa.ForeignKeyConstraint(['post'], ['post.id'], ),
    sa.ForeignKeyConstraint(['viewConsumer'], ['author.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('textPost',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('title', sa.VARCHAR(), nullable=True),
    sa.Column('category', sa.VARCHAR(), nullable=True),
    sa.Column('content', sa.VARCHAR(), nullable=True),
    sa.Column('contentType', sa.VARCHAR(length=8), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('requests',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('initiated', sa.INTEGER(), nullable=True),
    sa.Column('to', sa.INTEGER(), nullable=True),
    sa.Column('timestamp', sa.DATETIME(), nullable=True),
    sa.ForeignKeyConstraint(['initiated'], ['author.id'], ),
    sa.ForeignKeyConstraint(['to'], ['author.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('like',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('author', sa.INTEGER(), nullable=True),
    sa.Column('post', sa.INTEGER(), nullable=True),
    sa.Column('comment', sa.INTEGER(), nullable=True),
    sa.Column('timestamp', sa.DATETIME(), nullable=True),
    sa.ForeignKeyConstraint(['author'], ['author.id'], ),
    sa.ForeignKeyConstraint(['comment'], ['comment.id'], ),
    sa.ForeignKeyConstraint(['post'], ['post.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('inbox',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('owner', sa.INTEGER(), nullable=True),
    sa.Column('post', sa.INTEGER(), nullable=True),
    sa.Column('like', sa.INTEGER(), nullable=True),
    sa.Column('follow', sa.INTEGER(), nullable=True),
    sa.ForeignKeyConstraint(['follow'], ['requests.id'], ),
    sa.ForeignKeyConstraint(['like'], ['like.id'], ),
    sa.ForeignKeyConstraint(['owner'], ['author.id'], ),
    sa.ForeignKeyConstraint(['post'], ['post.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('post',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('author', sa.INTEGER(), nullable=True),
    sa.Column('textPost', sa.INTEGER(), nullable=True),
    sa.Column('imagePost', sa.INTEGER(), nullable=True),
    sa.Column('timestamp', sa.DATETIME(), nullable=True),
    sa.Column('private', sa.BOOLEAN(), nullable=True),
    sa.ForeignKeyConstraint(['author'], ['author.id'], ),
    sa.ForeignKeyConstraint(['imagePost'], ['imagePost.id'], ),
    sa.ForeignKeyConstraint(['textPost'], ['textPost.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('author',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('displayName', sa.VARCHAR(), nullable=True),
    sa.Column('githubId', sa.VARCHAR(), nullable=True),
    sa.Column('profileImageId', sa.VARCHAR(), nullable=True),
    sa.Column('isAdmin', sa.BOOLEAN(), nullable=True),
    sa.Column('isVerified', sa.BOOLEAN(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('comment',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('author', sa.INTEGER(), nullable=True),
    sa.Column('content', sa.VARCHAR(), nullable=True),
    sa.Column('contentType', sa.VARCHAR(length=8), nullable=True),
    sa.Column('timestamp', sa.DATETIME(), nullable=True),
    sa.ForeignKeyConstraint(['author'], ['author.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('imagePost',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('title', sa.VARCHAR(), nullable=True),
    sa.Column('category', sa.VARCHAR(), nullable=True),
    sa.Column('content', sa.VARCHAR(), nullable=True),
    sa.Column('contentType', sa.VARCHAR(length=4), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###