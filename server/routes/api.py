from flask import Blueprint, jsonify, make_response, request, Response
from firebase_admin import auth, credentials
import firebase_admin
from .create_credential_json import get_fbs_prv_key
from server.exts import db
from server.models import Author, Post
from server.enums import ContentType
import server.httpStatus as httpStatus
import server.utils.api_support as utils
from typing import Dict, Tuple

bp = Blueprint('api', __name__)

# creates the json
fbs_private_key = get_fbs_prv_key()

cred = credentials.Certificate(fbs_private_key)
firebase_admin.initialize_app(cred)

post_visibility_map = {
    "PUBLIC": False,
    "FRIENDS": True
}


def pagination(arguments: Dict[str, str], default_page_size: int = 10,
               default_page_number: int = 1) -> Tuple[int, int]:
    """Parse the pagination information from the url arguments.

    Arguments:
        arguments: The arguments to use for pagination.
        default_page_size: The default page size to use if none is provided.
        default_page_number: The default page number to use if none is provided.

    Returns:
        A tuple of (page, size) to use for pagination."""
    size = int(arguments.get('size', default_page_size), base=10)
    page_number = int(arguments.get(
        'page_number', default_page_number), base=10)
    return page_number, size


@bp.route('/authors', methods=['GET'])
def multiple_authors() -> Response:
    """Get multiple author.

    Args:
        author_id (int): The id of the author to get.

    Returns:
        Response: Flask.Response object containing the json of the author.
    """
    page, size = pagination(request.args)
    authors = Author.query.paginate(page=page, per_page=size).items
    return make_response(jsonify(
        type='authors',
        items=[a.json() for a in authors]), httpStatus.OK)


@bp.route("/authors/<int:author_id>", methods=['GET', 'POST'])
def single_author(author_id: int) -> Response:
    """Get or update a single author.

    Args:
        author_id (int): The id of the author to get and/or modify.

    Returns:
        Response: Flask.Response object containing the json of the author.
    """
    if request.method == "GET":
        author = Author.query.filter_by(id=author_id).first_or_404()
        return make_response(jsonify(author.json())), httpStatus.OK
    elif request.method == "POST":
        # request.form.get('displayName')
        pass


@bp.route("/authors/<int:author_id>/posts/<int:post_id>", methods=['GET'])
def get_post(author_id: int, post_id: int) -> Response:
    post = Post.query.filter_by(id=post_id).first_or_404()
    return make_response(jsonify(post.json())), httpStatus.OK


@bp.route("/authors/<int:author_id>/posts/", methods=['GET', 'POST'])
def post(author_id: int) -> Response:
    if request.method == "GET":
        page, size, start, end = pagination(request.args)
        posts = Post.query.filter_by(
            author=author_id, private=False).paginate(
                page=page, per_page=size).items
        posts = [post.json() for post in posts[start:end]]
        return make_response(jsonify(
            type='posts',
            items=posts,
            size=len(posts),
            page=page)), httpStatus.OK
    elif request.method == "POST":
        author = author_id
        title = request.form.get("title")
        category = request.form.get("category")
        content = request.form.get("content")
        unlisted = request.form.get("unlisted")
        # default to not unlisted
        if unlisted is None:
            unlisted = False

        try:
            contentType = ContentType(request.form.get("contentType"))
        except ValueError:
            # bad content type
            return Response(status=httpStatus.BAD_REQUEST)

        if not request.form.get("visibility") in post_visibility_map:
            # bad visibility type or no visibility given
            return Response(status=httpStatus.BAD_REQUEST)
        private = post_visibility_map[request.form.get("visibility")]

        post = Post(author, title, category, content, contentType, private)
        db.session.add(post)
        db.session.commit()
        return Response(status=httpStatus.OK)


@bp.route('/login', methods=['POST'])
def login() -> Response:
    # get token from authorization header
    authorization_header = request.headers['Authorization']
    token = authorization_header.replace("Bearer ", "")

    try:
        decoded_token = auth.verify_id_token(token)
    except Exception as e:
        print(e)
        print("Error", str(e))
        return make_response(jsonify(
            message=f'There was an error {str(e)}')), \
            httpStatus.INTERNAL_SERVER_ERROR

    # check if user exists in the database
    github_id = utils.get_github_user_id(decoded_token)
    author = Author.query.filter_by(githubId=github_id).first()

    if not author:
        # create an author
        utils.create_author(decoded_token, auth)
        return make_response(jsonify(message='User created')), httpStatus.OK
    else:
        return make_response(jsonify(
            message='Successful log in')), httpStatus.OK
