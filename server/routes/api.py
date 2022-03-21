import json
from urllib.request import urlopen
from flask import (
    Blueprint,
    jsonify,
    make_response,
    request,
    Response,
    send_file,
    current_app,
)
from re import L
import mimetypes
from telnetlib import STATUS
from urllib import response
from server.constants import res_msg
from flask_login import login_user, login_required, logout_user, current_user
from server.exts import db
from server.models import Author, Inbox, Post, Comment, Requests, Like
from server.enums import ContentType
from server.config import RUNTIME_SETTINGS
from http import HTTPStatus as httpStatus
import os, io, binascii
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
    page_number = int(arguments.get("page", str(default_page_number)), base=10)
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


@bp.route("/authors/<string:author_id>", methods=["GET", "POST"])
def single_author(author_id: str) -> Response:
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
        # request.json.get('displayName')
        pass


@bp.route("/authors/<string:author_id>/posts/<string:post_id>", methods=["GET"])
def get_post(author_id: str, post_id: str) -> Response:
    post = Post.query.filter_by(id=post_id, private=False).first_or_404()
    return make_response(jsonify(post.json())), httpStatus.OK


@bp.route("/authors/<string:author_id>/posts/", methods=["GET", "POST"])
def post(author_id: str) -> Response:
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
        if not current_user.is_authenticated or current_user.id != author_id:
            return (
                make_response(jsonify(error=res_msg.NO_PERMISSION)),
                httpStatus.UNAUTHORIZED,
            )
        author = author_id

        json_val = request.json
        try:
            title = json_val["title"]
            category = json_val["category"]
            content = json_val["content"]
            unlisted = json_val.get("unlisted", False)
            contentType = ContentType(json_val["contentType"])
            if (
                not (visibility := json_val["visibility"].upper())
                in post_visibility_map
            ):
                # bad visibility type or no visibility given
                return utils.json_response(httpStatus.BAD_REQUEST, { "message": "No visibility given for this post" })
        except KeyError:
            return Response(status=httpStatus.BAD_REQUEST)
        except ValueError:
            return Response(status=httpStatus.BAD_REQUEST)
        except TypeError:
            return Response(status=httpStatus.BAD_REQUEST)
        except Exception as e:
            return utils.json_response(httpStatus.BAD_REQUEST, { "message": str(e) })
        private = post_visibility_map[visibility.upper()]

        post = Post(author, title, category, content, contentType, private, unlisted)
        db.session.add(post)
        db.session.commit()
        post.push()
        return utils.json_response(httpStatus.OK, {"message": "Post was created", **post.json()} )


@bp.route(
    "/authors/<string:author_id>/posts/<string:post_id>", methods=["POST", "PUT", "DELETE"]
)
@login_required
def specific_post(author_id: str, post_id: str) -> Response:
    print(f"AUTHOR_ID {author_id}\nTYPE:{type(author_id)}")
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
            title = request.json["title"]
            category = request.json["category"]
            content = request.json["content"]
            unlisted = request.json.get("unlisted") or False
            contentType = ContentType(request.json["contentType"])
        except KeyError:
            return Response(status=httpStatus.BAD_REQUEST)
        except ValueError:
            return Response(status=httpStatus.BAD_REQUEST)
        except TypeError:
            return Response(status=httpStatus.BAD_REQUEST)
        if request.method == "PUT" and (
            (visibility := request.json.get("visibility").upper()) is None
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
        post.push()
        return Response(status=httpStatus.CREATED)
    elif request.method == "DELETE":
        db.session.delete(post)
        db.session.commit()
        return Response(status=httpStatus.NO_CONTENT)


@bp.route("/authors/<string:author_id>/posts/<string:post_id>/comments", methods=["GET"])
def get_comments(author_id: str, post_id: str) -> Response:
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
    "/authors/<string:author_id>/posts/<string:post_id>/comments/<string:comment_id>",
    methods=["GET"],
)
def get_comment(author_id: str, post_id: str, comment_id: str) -> Response:
    comment = Comment.query.filter_by(id=comment_id).first_or_404()
    return make_response(jsonify(comment.json())), httpStatus.OK


@bp.route("/authors/<string:author_id>/posts/<string:post_id>/comments", methods=["POST"])
@login_required
def post_comment(author_id: str, post_id: str) -> Response:
    try:
        title = request.json["title"]
        content = request.json["content"]
        contentType = ContentType(request.json.get("contentType"))
    except KeyError:
        return Response(status=httpStatus.BAD_REQUEST)
    except ValueError:
        return Response(status=httpStatus.BAD_REQUEST)
    except TypeError:
        return Response(status=httpStatus.BAD_REQUEST)
    comment = Comment(current_user.id, post_id, title, contentType, content)
    db.session.add(comment)
    db.session.commit()
    return Response(status=httpStatus.OK)


@bp.route("/authors/<string:author_id>/posts/<string:post_id>/image", methods=["GET"])
def serve_image(author_id: str, post_id: str):
    image_post = Post.query.filter_by(id=post_id).first()

    if image_post.contentType != ContentType.jpg and image_post.contentType != ContentType.png:
        return utils.json_response(
            httpStatus.BAD_REQUEST, {"message": res_msg.NOT_IMAGE}
        )
    image_Bytes = binascii.a2b_base64(image_post.content)
    return send_file(
        io.BytesIO(image_Bytes),
        mimetype=image_post.contentType.value,
        attachment_filename=f"{image_post.title}.{image_post.contentType.name}",
    )


@bp.route("/authors/<string:author_id>/followers", methods=["GET"])
def get_followers(author_id: str) -> Response:
    followers = Requests.query.filter_by(to=author_id).all()
    return (
        make_response(
            jsonify(type="followers", items=[f.get_follower_json() for f in followers])
        ),
        httpStatus.OK,
    )


@bp.route("/authors/<string:author_id>/followers/<string:follower_id>", methods=["GET"])
def is_follower(author_id: str, follower_id: str) -> Response:
    follower = Requests.query.filter_by(to=author_id, initiated=follower_id).first()
    return (
        make_response(
            jsonify(
                type="followers",
                items=([follower.get_follower_json()] if follower else []),
            )
        ),
        httpStatus.OK,
    )


@bp.route("/authors/<string:author_id>/followers/<string:follower_id>", methods=["DELETE"])
@login_required
def remove_follower(author_id: str, follower_id: str) -> Response:
    if current_user.id != follower_id:
        return (
            make_response(jsonify(error=res_msg.NO_PERMISSION)),
            httpStatus.UNAUTHORIZED,
        )
    follower = Requests.query.filter_by(to=author_id, initiated=follower_id).first()
    if not follower:
        #return Response(status=httpStatus.NOT_FOUND)
        return utils.json_response(
            httpStatus.NOT_FOUND,
            {"message": f"Follower {follower_id} is not following {author_id}."}
        )
    Inbox.query.filter_by(follow=follower_id).delete()
    db.session.delete(follower)
    db.session.commit()
    return Response(status=httpStatus.NO_CONTENT)


@bp.route("/authors/<string:author_id>/followers/<string:follower_id>", methods=["PUT"])
@login_required
def add_follower(author_id: str, follower_id: str) -> Response:
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
    inbox = Inbox(author_id, follow=follower_id)
    db.session.add(inbox)
    db.session.commit()
    return Response(status=httpStatus.OK)


@bp.route("/authors/<string:author_id>/inbox", methods=["GET"])
@login_required
def get_inbox(author_id: str) -> Response:
    if current_user.id != author_id:
        return (
            make_response(jsonify(error=res_msg.NO_PERMISSION)),
            httpStatus.UNAUTHORIZED,
        )
    page, size = pagination(request.args)
    inbox_items = (
        Inbox.query.filter_by(owner=author_id).paginate(page=page, per_page=size).items
    )
    return (
        make_response(
            jsonify(
                type="inbox",
                author=f"{HOST}/authors/{author_id}",
                items=[i.json() for i in inbox_items],
            )
        ),
        httpStatus.OK,
    )


@bp.route("/authors/<string:author_id>/inbox", methods=["POST"])
@login_required
def post_inbox(author_id: str) -> Response:
    try:
        req_type = request.json["type"]
        if req_type not in ("post", "follow", "like"):
            raise KeyError()
        req_id = request.json["id"]
        if req_type == "post":
            inbox = Inbox(author_id, post=req_id)
        elif req_type == "follow":
            inbox = Inbox(author_id, follow=req_id)
        elif req_type == "like":
            inbox = Inbox(author_id, like=req_id)
        db.session.add(inbox)
        db.session.commit()
    except KeyError:
        return Response(status=httpStatus.BAD_REQUEST)
    return (
        make_response(
            jsonify(
                type="inbox",
                author=f"{HOST}/authors/{author_id}",
            )
        ),
        httpStatus.OK,
    )


@bp.route("/authors/<string:author_id>/inbox", methods=["DELETE"])
@login_required
def clear_inbox(author_id: str) -> Response:
    if current_user.id != author_id:
        return (
            make_response(jsonify(error=res_msg.NO_PERMISSION)),
            httpStatus.UNAUTHORIZED,
        )
    Inbox.query.filter_by(owner=author_id).delete()
    db.session.commit()
    return Response(status=httpStatus.OK)

@bp.route("/authors/<string:author_id>/posts/<string:post_id>/likes", methods=["PUT", "GET", "DELETE"])
def post_like_methods(author_id: str, post_id: str) -> Response:
    post = Post.query.filter_by(id=post_id).first()
    if post is None:#post does not exist
        return utils.json_response(
            httpStatus.NOT_FOUND,
            {"message": f"post {post_id} does not exist."}
        )
    if post.author != author_id:#post not made by given author
        return (
            make_response(jsonify(error=res_msg.AUTHOR_URI_NOT_MATCH)),
            httpStatus.BAD_REQUEST)
    if (current_user.id == author_id) or (post.private == False):
        if request.method == "GET":#Get all likes for a given post
            post_likes = Like.query.filter_by(post=post_id).all()
            return (make_response(jsonify(
                likes=[like.json() for like in post_likes]
        )), httpStatus.OK)
        elif request.method == "PUT":#create a new like for a given post as a user
            if Like.query.filter_by(post=post_id, author=current_user.id).first() is not None:#user has already liked post
                return utils.json_response(
                    httpStatus.CONFLICT,
                    {"message": res_msg.AUTHOR_LIKE_CONFLICT}
                )
            author = current_user.id
            like = Like(author, post=post_id)
            db.session.add(like)
            db.session.commit()
            like.push()
            return Response(status=httpStatus.CREATED)
        elif request.method == "DELETE":#remove a like for a given post as a user
            like = Like.query.filter_by(post=post_id, author=current_user.id).first()
            if like is None:#user has not liked post
                return Response(status=httpStatus.NOT_FOUND)
            like.delete()
            return Response(status=httpStatus.NO_CONTENT)
    else:
        return (
            make_response(jsonify(error=res_msg.NO_PERMISSION)),
            httpStatus.UNAUTHORIZED)

@bp.route("/authors/<string:author_id>/posts/<string:post_id>/comments/<string:comment_id>/likes", methods=["PUT", "GET", "DELETE"])
def comment_like_methods(author_id: str, post_id: str, comment_id: str):
    comment = Comment.query.filter_by(id=comment_id).first()
    post = Post.query.filter_by(id=post_id).first()
    if post is None:#post does not exist
        return utils.json_response(
            httpStatus.NOT_FOUND,
            {"message": f"post {post_id} does not exist."}
        )
    if comment is None:#comment doesn't exist
        return utils.json_response(
            httpStatus.NOT_FOUND,
            {"message": f"comment {comment_id} does not exist."}
        )
    if (post.author != author_id) or (post.id != comment.post):#post author or comment post do not match
        return utils.json_response(
            httpStatus.NOT_FOUND,
            {"message": "Post author or comment post do not match"}
        )
    
    if (current_user.id == author_id) or (post.private == False):
        if request.method == "GET":#Get all likes for a given comment
            comment_likes = Like.query.filter_by(comment=comment_id).all()
            return (make_response(jsonify(
                likes=[like.json() for like in comment_likes]
                )), httpStatus.OK)        
        elif request.method == "PUT":#Get all likes for a given comment
            if Like.query.filter_by(comment=comment_id,author=current_user.id).first() is not None:#user has already liked comment
                return utils.json_response(
                    httpStatus.CONFLICT,
                    {"message": res_msg.AUTHOR_LIKE_CONFLICT}
                )
            author = current_user.id
            comment = comment_id
            like = Like(author, comment=comment)
            db.session.add(like)
            db.session.commit()
            like.push()
            return Response(status=httpStatus.CREATED)
        elif request.method == "DELETE":#Get all likes for a given comment
            like = Like.query.filter_by(comment=comment_id, author=current_user.id).first()
            if like is None:#user has not liked comment
                return utils.json_response(
                    httpStatus.NOT_FOUND,
                    {"message": res_msg.AUTHOR_LIKE_NOT_EXIST}
                )
            like.delete()
            return Response(status=httpStatus.NO_CONTENT)
    else:
        return (
            make_response(jsonify(error=res_msg.NO_PERMISSION)),
            httpStatus.UNAUTHORIZED)



@bp.route("/authors/<string:author_id>/liked", methods=["GET"])
def get_author_liked(author_id: str):
    if Author.query.filter_by(id=author_id).first() is None:#author doesn't exist
        return utils.json_response(
            httpStatus.NOT_FOUND, {"message": res_msg.AUTHOR_NOT_EXISTS}
        )
    author_post_likes = Like.query.filter_by(author=author_id).join(Post).filter_by(private=False).all()
    author_comment_likes = Like.query.filter_by(author=author_id).join(Comment).join(Post).filter_by(private=False).all()
    author_likes = author_comment_likes + author_post_likes
    return (make_response(jsonify(
        type="liked",
        items=[like.json() for like in author_likes]
    )), httpStatus.OK)

@bp.route("/signup", methods=["POST"])
def signup() -> Response:
    # get token from authorization header
    token = request.json.get("token")

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
                {"message": res_msg.USER_ALREADY_EXISTS },
            )
    except Exception as e:
        return utils.json_response(
            httpStatus.INTERNAL_SERVER_ERROR,
            {"message": res_msg.GENERAL_ERROR + str(e)},
        )


@bp.route("/login", methods=["POST"])
def login() -> Response:
    # get token from authorization header
    token = request.json.get("token")

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


@bp.route("/login/unit_test", methods=["POST"])
def login_unit_test() -> Response:
    if current_app.testing:
        author_id = request.json.get("author_id")
        author = Author.query.filter_by(id=author_id).first()
        login_user(author)
        return make_response(jsonify({"message": "login ok"})), httpStatus.OK
    return (
        make_response(
            jsonify(
                message="Server needs to run with testing mode enabled for this endpoint"
            )
        ),
        httpStatus.BAD_REQUEST,
    )


@bp.route("/logout", methods=["POST"])
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


@bp.route("/user_me")
@login_required
def get_user_me() -> Response:
    try:
        return utils.json_response(
            httpStatus.OK,
            {"message": res_msg.SUCCESS_VERIFY_USER, "data": current_user.json()},
        )
    except Exception as e:
        return utils.json_response(
            httpStatus.INTERNAL_SERVER_ERROR,
            {"message": res_msg.GENERAL_ERROR + str(e)},
        )


@bp.route("/admin/author/<string:author_id>", methods=["POST"])
@login_required
def modify_author(author_id: str) -> Response:
    if not current_user.isAdmin:
        return (
            make_response(jsonify(error=res_msg.NO_PERMISSION)),
            httpStatus.UNAUTHORIZED,
        )
    try:
        author = Author.query.filter_by(id=author_id).first_or_404()
        author.isAdmin = request.json.get("isAdmin", author.isAdmin)
        author.isVerified = request.json.get("isVerified", author.isVerified)
        db.session.commit()
        return utils.json_response(
            httpStatus.OK, {"message": res_msg.SUCCESS_USER_UPDATED}
        )
    except Exception as e:
        return utils.json_response(
            httpStatus.INTERNAL_SERVER_ERROR,
            {"message": res_msg.GENERAL_ERROR + str(e)},
        )


@bp.route("/admin/author", methods=["PUT"])
@login_required
def create_author() -> Response:
    if not current_user.isAdmin:
        return (
            make_response(jsonify(error=res_msg.NO_PERMISSION)),
            httpStatus.UNAUTHORIZED,
        )
    try:
        displayName = request.json["displayName"]
        github_username = request.json["github"]
        resp = urlopen(f"https://api.github.com/users/{github_username}")
        github_info = json.loads(resp.read().decode("utf-8"))
        githubId = github_info["id"]
        profileImageId = github_info["avatar_url"]
        isAdmin = False
        isVerified = current_app.config["AUTOMATIC_VERIFICATION"]

        if Author.query.filter_by(githubId=githubId).first():
            raise ValueError("User already exists.")
        author = Author(githubId, profileImageId, displayName, isAdmin, isVerified)

        # create author in database
        db.session.add(author)
        db.session.commit()
        return utils.json_response(
            httpStatus.OK,
            {"message": res_msg.SUCCESS_USER_CREATED, "data": author.json()},
        )
    except ValueError as e:
        return utils.json_response(
            httpStatus.BAD_REQUEST,
            {"message": res_msg.GENERAL_ERROR + str(e)},
        )
    except Exception as e:
        return utils.json_response(
            httpStatus.INTERNAL_SERVER_ERROR,
            {"message": res_msg.GENERAL_ERROR + str(e)},
        )


@bp.route("/admin/author/<string:author_id>", methods=["DELETE"])
@login_required
def delete_author(author_id: str) -> Response:
    if not current_user.isAdmin:
        return (
            make_response(jsonify(error=res_msg.NO_PERMISSION)),
            httpStatus.UNAUTHORIZED,
        )
    try:
        author = Author.query.filter_by(id=author_id).first_or_404()
        db.session.delete(author)
        db.session.commit()
        return utils.json_response(
            httpStatus.OK, {"message": res_msg.SUCCESS_USER_DELETED}
        )
    except Exception as e:
        return utils.json_response(
            httpStatus.INTERNAL_SERVER_ERROR,
            {"message": res_msg.GENERAL_ERROR + str(e)},
        )


@bp.route("/admin/settings", methods=["GET"])
@login_required
def get_settings() -> Response:
    if not current_user.isAdmin:
        return (
            make_response(jsonify(error=res_msg.NO_PERMISSION)),
            httpStatus.UNAUTHORIZED,
        )
    try:
        return utils.json_response(
            httpStatus.OK,
            {key: current_app.config[key] for key in RUNTIME_SETTINGS},
        )
    except Exception as e:
        return utils.json_response(
            httpStatus.INTERNAL_SERVER_ERROR,
            {"message": res_msg.GENERAL_ERROR + str(e)},
        )


@bp.route("/admin/settings", methods=["POST"])
@login_required
def set_settings() -> Response:
    if not current_user.isAdmin:
        return (
            make_response(jsonify(error=res_msg.NO_PERMISSION)),
            httpStatus.UNAUTHORIZED,
        )
    try:
        settings: Dict[str, str] = request.json
        for key, val in settings.items():
            if key in RUNTIME_SETTINGS:
                current_app.config[key] = val
                print(f"{key} set to {current_app.config[key]}")
        return utils.json_response(
            httpStatus.OK,
            {"message": res_msg.SUCCESS_SETTINGS},
        )
    except Exception as e:
        return utils.json_response(
            httpStatus.INTERNAL_SERVER_ERROR,
            {"message": res_msg.GENERAL_ERROR + str(e)},
        )
