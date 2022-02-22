from flask import Blueprint, jsonify, make_response, request, Response
from server.constants import res_msg
from flask_login import login_user, login_required, logout_user, current_user
from server.exts import db
from server.models import Author, Post
from server.enums import ContentType
from http import HTTPStatus as httpStatus

import server.utils.api_support as utils
from typing import Dict, Tuple

bp = Blueprint('api', __name__)

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
    size = int(arguments.get('size', str(default_page_size)), base=10)
    page_number = int(arguments.get(
        'page_number', str(default_page_number)), base=10)
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
        items=[a.json() for a in authors],
        page=page,
        size=len(authors))), httpStatus.OK


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
        page, size = pagination(request.args)
        posts = Post.query.filter_by(
            author=author_id, private=False).paginate(
                page=page, per_page=size).items
        return make_response(jsonify(
            type='posts',
            items=[post.json() for post in posts],
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
    token = request.form.get('token')

    if not token:
        return utils.json_response(httpStatus.UNAUTHORIZED, {"message": res_msg.TOKEN_MISSING})

    try:
        author, decoded_token = utils.get_author(token)

        if not author:
            # create an author
            new_author = utils.create_author(decoded_token)
            login_user(author)
            return utils.json_response(
                httpStatus.OK, 
                { 
                    "message": res_msg.SUCCESS_USER_CREATED,
                    "data": new_author.json()
                }
            )
        else:
            login_user(author)
            return utils.json_response(
                httpStatus.OK, 
                {
                    "message": res_msg.SUCCESS_VERIFY_USER,
                    "data": author.json()
                }
            )
    except Exception as e:
        return utils.json_response(
            httpStatus.INTERNAL_SERVER_ERROR, 
            {"message": res_msg.GENERAL_ERROR + str(e)}
        )

@bp.route('/logout')
@login_required
def logout() -> Response:
    try:
        logout_user()
        return utils.json_response(
            httpStatus.OK,
            {"message": res_msg.SUCCESS_LOGOUT}
        )
    except Exception as e:
        return utils.json_response(
            httpStatus.INTERNAL_SERVER_ERROR,
            {"message": res_msg.LOGOUT_ERROR}
        )

@bp.route('/user_me')
@login_required
def get_user_me() -> Response:
    try:
        print("TEST", current_user)
        return utils.json_response(
            httpStatus.OK,
            {
                "message": res_msg.SUCCESS_VERIFY_USER,
                "data": current_user.json()
            }
        )
    except Exception as e:
        return utils.json_response(
            httpStatus.INTERNAL_SERVER_ERROR, 
            {"message": res_msg.GENERAL_ERROR + str(e)}
        )

@bp.route('/update_me', methods=['POST'])
@login_required
def update_myself() -> Response:
    try:
        updated_user = utils.update_user_me(request, current_user)
        print("CURRENT", updated_user.is_authenticated)
        return utils.json_response(
            httpStatus.OK,
            {
                "message": res_msg.SUCCESS_USER_UPDATE,
                "data": updated_user.json()
            }
        )
    except Exception as e:
        return utils.json_response(
            httpStatus.INTERNAL_SERVER_ERROR, 
            {"message": res_msg.GENERAL_ERROR + str(e)}
        )

@bp.route('/login_test', methods=['GET'])
@login_required
def login_test() -> Response:
    return make_response(jsonify(message='Successful log in')), httpStatus.OK
