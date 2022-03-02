from flask import Blueprint, jsonify, make_response, request, Response
from server.constants import res_msg
from flask_login import login_user, login_required, logout_user, current_user
from server.exts import db
from server.models import Author, Post, Comment, Requests
from server.enums import ContentType
from http import HTTPStatus as httpStatus
import os
from dotenv import load_dotenv

import server.utils.api_support as utils
from typing import Dict, Tuple

load_dotenv()

HOST = os.getenv("FLASK_HOST")

bp = Blueprint("api", __name__)

post_visibility_map = {"PUBLIC": False, "FRIENDS": True}


def pagination(
    arguments: Dict[str, str], default_page_size: int = 10, default_page_number: int = 1
) -> Tuple[int, int]:
    """Parse the pagination information from the url arguments.

    Arguments:
        arguments: The arguments to use for pagination.
        default_page_size: The default page size to use if none is provided.
        default_page_number: The default page number to use if none is provided.

    Returns:
        A tuple of (page, size) to use for pagination."""
    size = int(arguments.get("size", str(default_page_size)), base=10)
    page_number = int(arguments.get("page_number", str(default_page_number)), base=10)
    return page_number, size


@bp.route("/authors", methods=["GET"])
def multiple_authors() -> Response:
    """Get multiple author.

    Args:
        author_id (int): The id of the author to get.

    Returns:
        Response: Flask.Response object containing the json of the author.
    """
    page, size = pagination(request.args)
    authors = Author.query.paginate(page=page, per_page=size).items
    return (
        make_response(
            jsonify(
                type="authors",
                items=[a.json() for a in authors],
                page=page,
                size=len(authors),
            )
        ),
        httpStatus.OK,
    )


@bp.route("/authors/<int:author_id>", methods=["GET", "POST"])
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


@bp.route("/authors/<int:author_id>/posts/<int:post_id>", methods=["GET"])
def get_post(author_id: int, post_id: int) -> Response:
    post = Post.query.filter_by(id=post_id, private=False).first_or_404()
    return make_response(jsonify(post.json())), httpStatus.OK


@bp.route("/authors/<int:author_id>/posts/", methods=["GET", "POST"])
def post(author_id: int) -> Response:
    if request.method == "GET":
        page, size = pagination(request.args)
        posts = (
            Post.query.filter_by(author=author_id, private=False)
            .paginate(page=page, per_page=size)
            .items
        )
        return (
            make_response(
                jsonify(
                    type="posts",
                    items=[post.json() for post in posts],
                    size=len(posts),
                    page=page,
                )
            ),
            httpStatus.OK,
        )
    elif request.method == "POST":
        if current_user.is_anonymous or current_user.id != author_id:
            return (
                make_response(jsonify(error=res_msg.NO_PERMISSION)),
                httpStatus.UNAUTHORIZED,
            )
        author = author_id
        try:
            title = request.form["title"]
            category = request.form["category"]
            content = request.form["content"]
            unlisted = request.form.get("unlisted") or False
            contentType = ContentType(request.form["contentType"])
        except KeyError:
            return Response(status=httpStatus.BAD_REQUEST)
        except ValueError:
            return Response(status=httpStatus.BAD_REQUEST)

        if (
            not (visibility := request.form.get("visibility").upper())
            in post_visibility_map
        ):
            # bad visibility type or no visibility given
            return Response(status=httpStatus.BAD_REQUEST)
        private = post_visibility_map[visibility.upper()]

        post = Post(author, title, category, content, contentType, private, unlisted)
        db.session.add(post)
        db.session.commit()
        return Response(status=httpStatus.OK)


@bp.route(
    "/authors/<int:author_id>/posts/<int:post_id>", methods=["POST", "PUT", "DELETE"]
)
@login_required
def specific_post(author_id: int, post_id: int) -> Response:
    """Modify, create or delete a specific post."""
    if current_user.id != author_id:
        return (
            make_response(jsonify(error=res_msg.NO_PERMISSION)),
            httpStatus.UNAUTHORIZED,
        )
    if request.method != "PUT":
        post = Post.query.filter_by(id=post_id).first_or_404()
    if request.method != "DELETE":
        try:
            author = author_id
            title = request.form["title"]
            category = request.form["category"]
            content = request.form["content"]
            unlisted = request.form.get("unlisted") or False
            contentType = ContentType(request.form["contentType"])
        except KeyError:
            return Response(status=httpStatus.BAD_REQUEST)
        except ValueError:
            return Response(status=httpStatus.BAD_REQUEST)
        if request.method == "PUT" and (
            (visibility := request.form.get("visibility")) is None
            or not visibility.upper() in post_visibility_map
        ):
            return Response(status=httpStatus.BAD_REQUEST)
        elif request.method == "PUT":
            private = post_visibility_map[visibility]
    if request.method == "POST":
        post.author = author
        post.title = title
        post.category = category
        post.content = content
        post.contentType = contentType
        post.unlisted = unlisted
        db.session.commit()
        return make_response(jsonify(post.json())), httpStatus.OK
    elif request.method == "PUT":
        if Post.query.filter_by(id=post_id).first():
            return (
                make_response(jsonify(error=res_msg.CREATE_CONFLICT)),
                httpStatus.BAD_REQUEST,
            )
        post = Post(
            author, title, category, content, contentType, private, unlisted, post_id
        )
        db.session.add(post)
        db.session.commit()
        return Response(status=httpStatus.CREATED)
    elif request.method == "DELETE":
        db.session.delete(post)
        db.session.commit()
        return Response(status=httpStatus.NO_CONTENT)


@bp.route("/authors/<int:author_id>/posts/<int:post_id>/comments", methods=["GET"])
def get_comments(author_id: int, post_id: int) -> Response:
    page, size = pagination(request.args)
    comments = (
        Comment.query.filter_by(post=post_id).paginate(page=page, per_page=size).items
    )
    return (
        make_response(
            jsonify(
                type="comments",
                page=page,
                size=len(comments),
                post=f"{HOST}/authors/{author_id}/posts/{post_id}",
                id=f"{HOST}/authors/{author_id}/posts/{post_id}/comments",
                comments=[comment.json() for comment in comments],
            )
        ),
        httpStatus.OK,
    )


@bp.route(
    "/authors/<int:author_id>/posts/<int:post_id>/comments/<int:comment_id>",
    methods=["GET"],
)
def get_comment(author_id: int, post_id: int, comment_id: int) -> Response:
    comment = Comment.query.filter_by(id=comment_id).first_or_404()
    return make_response(jsonify(comment.json())), httpStatus.OK


@bp.route("/authors/<int:author_id>/posts/<int:post_id>/comments", methods=["POST"])
@login_required
def post_comment(author_id: int, post_id: int) -> Response:
    try:
        title = request.form["title"]
        content = request.form["content"]
        contentType = ContentType(request.form.get("contentType"))
    except KeyError:
        return Response(status=httpStatus.BAD_REQUEST)
    except ValueError:
        return Response(status=httpStatus.BAD_REQUEST)
    comment = Comment(current_user.id, post_id, title, contentType, content)
    db.session.add(comment)
    db.session.commit()
    return Response(status=httpStatus.OK)


@bp.route("/authors/<int:author_id>/followers", methods=["GET"])
def get_followers(author_id: int) -> Response:
    followers = Requests.query.filter_by(to=author_id).all()
    return (
        make_response(jsonify(type="followers", items=[f.json() for f in followers])),
        httpStatus.OK,
    )


@bp.route("/authors/<int:author_id>/followers/<int:follower_id>", methods=["GET"])
def is_follower(author_id: int, follower_id: int) -> Response:
    follower = Requests.query.filter_by(to=author_id, initiated=follower_id).first()
    return (
        make_response(
            jsonify(type="followers", items=([follower.json()] if follower else []))
        ),
        httpStatus.OK,
    )


@bp.route("/authors/<int:author_id>/followers/<int:follower_id>", methods=["DELETE"])
@login_required
def remove_follower(author_id: int, follower_id: int) -> Response:
    if current_user.id != follower_id:
        return (
            make_response(jsonify(error=res_msg.NO_PERMISSION)),
            httpStatus.UNAUTHORIZED,
        )
    follower = Requests.query.filter_by(to=author_id, initiated=follower_id).first()
    if not follower:
        return Response(status=httpStatus.NOT_FOUND)
    db.session.delete(follower)
    db.session.commit()
    return Response(status=httpStatus.NO_CONTENT)


@bp.route("/authors/<int:author_id>/followers/<int:follower_id>", methods=["PUT"])
@login_required
def add_follower(author_id: int, follower_id: int) -> Response:
    if current_user.id != follower_id:
        return (
            make_response(jsonify(error=res_msg.NO_PERMISSION)),
            httpStatus.FORBIDDEN,
        )
    follower = Requests.query.filter_by(to=author_id, initiated=current_user.id).first()
    if follower:
        return (
            make_response(jsonify(error=res_msg.CREATE_CONFLICT)),
            httpStatus.BAD_REQUEST,
        )
    follower = Requests(follower_id, author_id)
    db.session.add(follower)
    db.session.commit()
    return Response(status=httpStatus.OK)


@bp.route("/signup", methods=["POST"])
def signup() -> Response:
    # get token from authorization header
    token = request.form.get("token")

    if not token:
        return utils.json_response(
            httpStatus.UNAUTHORIZED, {"message": res_msg.TOKEN_MISSING}
        )

    try:
        author, decoded_token = utils.get_author(token)

        if not author:
            # create an author
            new_author = utils.create_author(decoded_token)
            return utils.json_response(
                httpStatus.OK,
                {"message": res_msg.SUCCESS_USER_CREATED, "data": new_author.json()},
            )
        else:
            return utils.json_response(
                httpStatus.BAD_REQUEST,
                {"message": res_msg.USER_ALREADY_EXISTS, "data": author.json()},
            )
    except Exception as e:
        return utils.json_response(
            httpStatus.INTERNAL_SERVER_ERROR,
            {"message": res_msg.GENERAL_ERROR + str(e)},
        )


@bp.route("/login", methods=["POST"])
def login() -> Response:
    # get token from authorization header
    token = request.form.get("token")

    if not token:
        return utils.json_response(
            httpStatus.UNAUTHORIZED, {"message": res_msg.TOKEN_MISSING}
        )

    try:
        author, decoded_token = utils.get_author(token)

        if not author:
            return utils.json_response(
                httpStatus.BAD_REQUEST, {"message": res_msg.USER_DOES_NOT_EXIST}
            )
        else:
            login_user(author)
            return utils.json_response(
                httpStatus.OK,
                {"message": res_msg.SUCCESS_VERIFY_USER, "data": author.json()},
            )
    except Exception as e:
        return utils.json_response(
            httpStatus.INTERNAL_SERVER_ERROR,
            {"message": res_msg.GENERAL_ERROR + str(e)},
        )


@bp.route("/logout")
@login_required
def logout() -> Response:
    try:
        logout_user()
        return utils.json_response(httpStatus.OK, {"message": res_msg.SUCCESS_LOGOUT})
    except Exception as e:
        return utils.json_response(
            httpStatus.INTERNAL_SERVER_ERROR, {"message": res_msg.LOGOUT_ERROR}
        )


@bp.route("/login_test", methods=["GET"])
@login_required
def login_test() -> Response:
    return make_response(jsonify(message="Successful log in")), httpStatus.OK
