from flask import Blueprint

bp = Blueprint('db', __name__)

@bp.cli.command('create')
@click.argument('model')
def create(model):

    if model == 'author':
        from server.models import Author
        # call make_authors()
    elif model == 'post':
        from server.models import Post
        # call make_posts()
    else:
        print('Model not found')



# app.register_blueprint(bp)