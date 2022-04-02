import json
import re
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
from server.exts import (
    db,
    LOCAL_AUTH_USER,
    LOCAL_AUTH_PASSWORD,
    http_basic_authentication,
    require_authentication,
)
from server.models import Author, Inbox, Post, Comment, Requests, Like, Remote_Node
from server.enums import ContentType
from server.config import RUNTIME_SETTINGS
from http import HTTPStatus as httpStatus
import os, io, binascii
from dotenv import load_dotenv
from server.remote_query import *

import server.utils.api_support as utils
from typing import Dict, Tuple

from server.utils.exts import get_github_by_id, is_local_node

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
@require_authentication
def multiple_authors() -> Response:
    """Get multiple author.

    Args:
        author_id (int): The id of the author to get.

    Returns:
        Response: Flask.Response object containing the json of the author.
    """
    page, size = pagination(request.args)
    authors = Author.query.paginate(page=page, per_page=size, error_out=False).items
    is_local = current_user.is_authenticated
    remote_authors = []
    if len(authors) < size:
        remote_size = size - len(authors) 
        remote_page = calculate_remote_page(Author, page, size)
        remote_authors = get_all_remote_authors(remote_size, page=remote_page)

    author_items = [a.json(is_local) for a in authors]
    author_items.extend(remote_authors)
    return (
        make_response(
            jsonify(
                type="authors",
                items=author_items,
                page=page,
                size=len(author_items),
            )
        ),
        httpStatus.OK,
    )


@bp.route("/authors/<path:author_id>", methods=["GET", "POST"])
@require_authentication
def single_author(author_id: str) -> Response:
    """Get or update a single author.

    Args:
        author_id (int): The id of the author to get and/or modify.

    Returns:
        Response: Flask.Response object containing the json of the author.
    """
    if request.method == "GET":
        author = Author.query.filter_by(id=author_id).first()
        is_local = current_user.is_authenticated
        if author != None:#local author
            return make_response(jsonify(author.json(is_local))), httpStatus.OK
        else:#try remote author
            regex = r"https?:\/\/.*\/authors\/(.+)"
            if (match := re.match(regex, author_id)):
                author_id = match.group(1)
            remote_author_dict = get_remote_author(author_id)
            if remote_author_dict != None:
                return make_response(jsonify(remote_author_dict)), httpStatus.OK
            else:
                return Response(status=httpStatus.NOT_FOUND)
    elif request.method == "POST":
        # request.json.get('displayName')
        pass


@bp.route("/authors/<path:author_id>/posts/<string:post_id>", methods=["GET"])
@require_authentication
def get_post(author_id: str, post_id: str) -> Response:
    post = Post.query.filter_by(id=post_id, private=False).first()
    is_local = current_user.is_authenticated
    if post == None:
        regex = r"https?:\/\/.*\/authors\/(.+)"
        if (match := re.match(regex, author_id)):
            author_id = match.group(1)
        post_dict = get_remote_post(author_id, post_id)
    else:
        post_dict = post.json(is_local)
    if post_dict == None:#not found in remotes
        return Response(status=httpStatus.NOT_FOUND)
    return make_response(jsonify(post_dict)), httpStatus.OK


@bp.route("/authors/<path:author_id>/posts/", methods=["GET", "POST"])
@require_authentication
def post(author_id: str) -> Response:
    regex = r"https?:\/\/.*\/authors\/(.+)"
    if (match := re.match(regex, author_id)):
        author_id = match.group(1)
    print(author_id)
    if not Author.query.filter_by(id=author_id).first() and not find_remote_author(author_id):
        return utils.json_response(
                    httpStatus.NOT_FOUND,
                    {"message": "Author not found"},
                )
    is_local = current_user.is_authenticated
    if request.method == "GET":
        page, size = pagination(request.args)
        posts = (
            Post.query.filter_by(author=author_id, private=False)
            .paginate(page=page, per_page=size, error_out=False)
            .items
        )
        remote_posts = []
        if len(posts) < size and not Author.query.filter_by(id=author_id).first():
            remote_size = size - len(posts) 
            remote_page = calculate_remote_page(Post, page, size)
            remote_posts = get_remote_author_posts(author_id, remote_size, page=remote_page)
        posts_items = [post.json(is_local) for post in posts]
        posts_items.extend(remote_posts)
        return (
            make_response(
                jsonify(
                    type="posts",
                    items=posts_items,
                    size=len(posts_items),
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
                return utils.json_response(
                    httpStatus.BAD_REQUEST,
                    {"message": "No visibility given for this post"},
                )
        except KeyError:
            return Response(status=httpStatus.BAD_REQUEST)
        except ValueError:
            return Response(status=httpStatus.BAD_REQUEST)
        except TypeError:
            return Response(status=httpStatus.BAD_REQUEST)
        except Exception as e:
            return utils.json_response(httpStatus.BAD_REQUEST, {"message": str(e)})
        private = post_visibility_map[visibility.upper()]

        post = Post(author, title, category, content, contentType, private, unlisted)
        db.session.add(post)
        db.session.commit()
        post.push()
        return utils.json_response(
            httpStatus.OK, {"message": "Post was created", **post.json(is_local)}
        )


@bp.route(
    "/authors/<string:author_id>/posts/<string:post_id>",
    methods=["POST", "PUT", "DELETE"],
)
@require_authentication
def specific_post(author_id: str, post_id: str) -> Response:
    print(f"AUTHOR_ID {author_id}\nTYPE:{type(author_id)}")
    is_local = current_user.is_authenticated
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
        return make_response(jsonify(post.json(is_local))), httpStatus.OK
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
        # TODO: update documentation for this
        return (
            make_response(jsonify(post.json(is_local))),
            httpStatus.CREATED,
        )
        # return Response(status=httpStatus.OK)
    elif request.method == "DELETE":
        db.session.delete(post)
        db.session.commit()
        return Response(status=httpStatus.NO_CONTENT)


@bp.route(
    "/authors/<path:author_id>/posts/<string:post_id>/comments", methods=["GET"]
)
@require_authentication
def get_comments(author_id: str, post_id: str) -> Response:
    host_name = HOST
    regex = r"https?:\/\/.*\/authors\/(.+)"
    if (match := re.match(regex, author_id)):
        author_id = match.group(1)
    remote_comment_host = find_remote_post(author_id, post_id)
    if not Post.query.filter_by(id=post_id).first() and not remote_comment_host:
        return utils.json_response(
                    httpStatus.NOT_FOUND,
                    {"message": f"Parent post {post_id} not found"},
                )
    if remote_comment_host:
        host_name = remote_comment_host
    page, size = pagination(request.args)
    comments = (
        Comment.query.filter_by(post=post_id).paginate(page=page, per_page=size, error_out=False).items
    )
    remote_comments = []
    if len(comments) < size:
        remote_size = size - len(comments) 
        remote_page = calculate_remote_page(Comment, page, size)
        remote_comments = get_remote_comments(author_id, post_id, size=remote_size, page=remote_page)
    is_local = current_user.is_authenticated
    comments_items = [comment.json(is_local) for comment in comments]
    comments_items.extend(remote_comments)
    return (
        make_response(
            jsonify(
                type="comments",
                page=page,
                size=len(comments_items),
                post=f"{host_name}/authors/{author_id}/posts/{post_id}",
                id=f"{host_name}/authors/{author_id}/posts/{post_id}/comments",
                comments=comments_items,
            )
        ),
        httpStatus.OK,
    )


@bp.route(
    "/authors/<string:author_id>/posts/<string:post_id>/comments/<string:comment_id>",
    methods=["GET"],
)
def get_comment(author_id: str, post_id: str, comment_id: str) -> Response:
    comment = Comment.query.filter_by(id=comment_id).first()
    if comment != None:#is local comment
        is_local = current_user.is_authenticated
        return make_response(jsonify(comment.json(is_local))), httpStatus.OK
    else:#look in remotes
        remote_comment_dict = get_remote_comment(author_id, post_id, comment_id)
        if remote_comment_dict != None or len(remote_comment_dict) != 0:
            return make_response(jsonify(remote_comment_dict)), httpStatus.OK
        else:#not found in remotes
            return Response(status=httpStatus.NOT_FOUND)





@bp.route(
    "/authors/<string:author_id>/posts/<string:post_id>/comments", methods=["POST"]
)
@require_authentication
def post_comment(author_id: str, post_id: str) -> Response:
    try:
        content = request.json["content"]
        contentType = ContentType(request.json.get("contentType"))
    except KeyError:
        return Response(status=httpStatus.BAD_REQUEST)
    except ValueError:
        return Response(status=httpStatus.BAD_REQUEST)
    except TypeError:
        return Response(status=httpStatus.BAD_REQUEST)
    comment = Comment(current_user.id, post_id, contentType, content)
    db.session.add(comment)
    db.session.commit()
    return Response(status=httpStatus.OK)


@bp.route("/authors/<string:author_id>/posts/<string:post_id>/image", methods=["GET"])
@require_authentication
def serve_image(author_id: str, post_id: str):
    image_post = Post.query.filter_by(id=post_id).first()

    if (
        image_post.contentType != ContentType.jpg
        and image_post.contentType != ContentType.png
    ):
        return utils.json_response(
            httpStatus.BAD_REQUEST, {"message": res_msg.NOT_IMAGE}
        )
    image_Bytes = binascii.a2b_base64(image_post.content)
    return send_file(
        io.BytesIO(image_Bytes),
        mimetype=image_post.contentType.value,
        attachment_filename=f"{image_post.title}.{image_post.contentType.name}",
    )


@bp.route("/authors/<path:author_id>/followers", methods=["GET"])
@require_authentication
def get_followers(author_id: str) -> Response:
    ##remote
    if not Author.query.filter_by(id=author_id).first():
        regex = r"https?:\/\/.*\/authors\/(.+)"
        if (match := re.match(regex, author_id)):
            author_id = match.group(1)
        follower_items = get_remote_followers(author_id)
    else:##local
        followers = Requests.query.filter_by(to=author_id).all()
        is_local = current_user.is_authenticated
        follower_items = [f.get_follower_json(is_local) for f in followers]
    return (
        make_response(
            jsonify(type="followers", items=follower_items)
        ),
        httpStatus.OK,
    )


@bp.route("/authors/<path:author_id>/followers/<path:follower_id>", methods=["GET"])
@require_authentication
def is_follower(author_id: str, follower_id: str) -> Response:
    if not Author.query.filter_by(id=author_id).first():#remote
        regex = r"https?:\/\/.*\/authors\/(.+)"
        if (match := re.match(regex, author_id)):
            author_id = match.group(1)
        regex = r"https?:\/\/.*\/authors\/(.+)"
        if (match := re.match(regex, follower_id)):
            follower_id = match.group(1)
        follower_items = get_remote_followers(author_id)
        all_followers = get_remote_followers(author_id)#the remote endpoints for checking a follow are very different inbetween the 3 node
        follower_items = []
        for item in all_followers:
            if str(item["url"]).split("/")[-1] == follower_id:
                follower_items.append(item)
        
    else:#local
        follower = Requests.query.filter_by(to=author_id, initiated=follower_id).first()
        is_local = current_user.is_authenticated
        follower_items = ([follower.get_follower_json(is_local)] if follower else [])

    return (
        make_response(
            jsonify(
                type="followers",
                items=follower_items,
            )
        ),
        httpStatus.OK,
    )


@bp.route(
    "/authors/<string:author_id>/followers/<string:follower_id>", methods=["DELETE"]
)
@require_authentication
def remove_follower(author_id: str, follower_id: str) -> Response:
    if current_user.id != follower_id:
        return (
            make_response(jsonify(error=res_msg.NO_PERMISSION)),
            httpStatus.UNAUTHORIZED,
        )
    follower = Requests.query.filter_by(to=author_id, initiated=follower_id).first()
    if not follower:
        # return Response(status=httpStatus.NOT_FOUND)
        return utils.json_response(
            httpStatus.NOT_FOUND,
            {"message": f"Follower {follower_id} is not following {author_id}."},
        )
    inbox = Inbox.query.filter_by(id=author_id).all()
    for i in inbox:
        if i.data:
            data = i.data.json()
            if str(data["type"]).lower() == "follow" and data["object"]["id"] == follower_id:
                db.session.delete(i)
                db.session.commit()
    db.session.delete(follower)
    db.session.commit()
    return Response(status=httpStatus.NO_CONTENT)


@bp.route("/authors/<string:author_id>/followers/<path:follower_id>", methods=["PUT"])
@require_authentication
def add_follower(author_id: str, follower_id: str) -> Response:
    is_local = current_user.is_authenticated
    if current_user.is_authenticated:
        if current_user.id != follower_id:
            return (
                make_response(jsonify(error=res_msg.NO_PERMISSION)),
                httpStatus.FORBIDDEN,
            )
    regex = r"https?:\/\/.*\/authors\/(.+)"
    if (match := re.match(regex, follower_id)):
        follower_id = match.group(1)
    ##remote
    if find_remote_author(author_id):
        response = submit_remote_follow_request(author_id, follower_id)
        if response:
            return Response(status=httpStatus.OK)
        else:#This should never happen but keep it just in case
            return utils.json_response(
                httpStatus.NOT_FOUND, {"message": f"author {author_id} does not exist and was specifically not found remotely."}
            )
    ##local
    follower = Requests.query.filter_by(to=author_id, initiated=follower_id).first()
    if follower:
        return (
            make_response(jsonify(error=res_msg.CREATE_CONFLICT)),
            httpStatus.BAD_REQUEST,
        )
    follower = Requests(follower_id, author_id)
    db.session.add(follower)
    jsonString = json.dumps(follower.json(is_local))
    inbox = Inbox(author_id, jsonString)
    db.session.add(inbox)
    db.session.commit()
    return Response(status=httpStatus.OK)


@bp.route("/authors/<string:author_id>/inbox", methods=["GET"])
@require_authentication
def get_inbox(author_id: str) -> Response:
    is_local = current_user.is_authenticated
    if is_local:
        if current_user.id != author_id:
            return (
                make_response(jsonify(error=res_msg.NO_PERMISSION)),
                httpStatus.UNAUTHORIZED,
            )
    page, size = pagination(request.args)
    inbox_items = (
        Inbox.query.filter_by(owner=author_id).paginate(page=page, per_page=size, error_out=False).items
    )
    is_local = current_user.is_authenticated
    return (
        make_response(
            jsonify(
                type="inbox",
                author=f"{HOST}/authors/{author_id}",
                items=[i.json(is_local) for i in inbox_items],
            )
        ),
        httpStatus.OK,
    )


@bp.route("/authors/<string:author_id>/inbox", methods=["POST"])
@require_authentication
def post_inbox(author_id: str) -> Response:
    is_local = current_user.is_authenticated
    if find_remote_author(author_id):
        post_remote_inbox(author_id, request.json)
    try:
        inbox = Inbox(author_id, json.dumps(request.json))
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
@require_authentication
def clear_inbox(author_id: str) -> Response:
    if current_user.id != author_id:
        return (
            make_response(jsonify(error=res_msg.NO_PERMISSION)),
            httpStatus.UNAUTHORIZED,
        )
    Inbox.query.filter_by(owner=author_id).delete()
    db.session.commit()
    return Response(status=httpStatus.OK)


@bp.route(
    "/authors/<path:author_id>/posts/<string:post_id>/likes",
    methods=["PUT", "GET", "DELETE"],
)
@require_authentication
def post_like_methods(author_id: str, post_id: str) -> Response:
    post = Post.query.filter_by(id=post_id).first()
    ##remote
    regex = r"https?:\/\/.*\/authors\/(.+)"
    if (match := re.match(regex, author_id)):
        author_id = match.group(1)
    remote_likes = get_remote_post_likes(author_id, post_id)
    if len(remote_likes) != 0 and request.method == "GET":
        if len(remote_likes) == 0:#not found in remote
            return utils.json_response(
                httpStatus.NOT_FOUND, {"message": f"post {post_id} does not exist."}
            )
        return (
            make_response(jsonify(likes=[like for like in remote_likes])),
            httpStatus.OK,
            )
    ##local
    if post is None:  # post does not exist
        return utils.json_response(
            httpStatus.NOT_FOUND, {"message": f"post {post_id} does not exist."}
        )
    if post.author != author_id:  # post not made by given author
        return (
            make_response(jsonify(error=res_msg.AUTHOR_URI_NOT_MATCH)),
            httpStatus.BAD_REQUEST,
        )
    if (current_user.id == author_id) or (post.private == False):
        if request.method == "GET":  # Get all likes for a given post
            post_likes = Like.query.filter_by(post=post_id).all()
            is_local = current_user.is_authenticated
            return (
                make_response(jsonify(likes=[like.json(is_local) for like in post_likes])),
                httpStatus.OK,
            )
        elif request.method == "PUT":  # create a new like for a given post as a user
            if (
                Like.query.filter_by(post=post_id, author=current_user.id).first()
                is not None
            ):  # user has already liked post
                return utils.json_response(
                    httpStatus.CONFLICT, {"message": res_msg.AUTHOR_LIKE_CONFLICT}
                )
            author = current_user.id
            like = Like(author, post=post_id)
            db.session.add(like)
            db.session.commit()
            like.push()
            return Response(status=httpStatus.CREATED)
        elif request.method == "DELETE":  # remove a like for a given post as a user
            like = Like.query.filter_by(post=post_id, author=current_user.id).first()
            if like is None:  # user has not liked post
                return Response(status=httpStatus.NOT_FOUND)
            like.delete()
            return Response(status=httpStatus.NO_CONTENT)
    else:
        return (
            make_response(jsonify(error=res_msg.NO_PERMISSION)),
            httpStatus.UNAUTHORIZED,
        )


@bp.route(
    "/authors/<path:author_id>/posts/<string:post_id>/comments/<string:comment_id>/likes",
    methods=["PUT", "GET", "DELETE"],
)
@require_authentication
def comment_like_methods(author_id: str, post_id: str, comment_id: str):
    comment = Comment.query.filter_by(id=comment_id).first()
    post = Post.query.filter_by(id=post_id).first()
    regex = r"https?:\/\/.*\/authors\/(.+)"
    if (match := re.match(regex, author_id)):
        author_id = match.group(1)
    ##remote
    remote_likes = get_remote_comment_likes(author_id, post_id, comment_id)
    if len(remote_likes) != 0 and request.method == "GET":
        if len(remote_likes) == 0:#not found in remote
            return utils.json_response(
                httpStatus.NOT_FOUND, {"message": f"comment {post_id} does not exist."}
            )
        return (
            make_response(jsonify(likes=[like for like in remote_likes])),
            httpStatus.OK,
            )    
    ##local
    if post is None:  # post does not exist
        return utils.json_response(
            httpStatus.NOT_FOUND, {"message": f"post {post_id} does not exist."}
        )
    if comment is None:  # comment doesn't exist
        return utils.json_response(
            httpStatus.NOT_FOUND, {"message": f"comment {comment_id} does not exist."}
        )
    if (post.author != author_id) or (
        post.id != comment.post
    ):  # post author or comment post do not match
        return utils.json_response(
            httpStatus.NOT_FOUND,
            {"message": "Post author or comment post do not match"},
        )

    if (current_user.id == author_id) or (post.private == False):
        if request.method == "GET":  # Get all likes for a given comment
            comment_likes = Like.query.filter_by(comment=comment_id).all()
            is_local = current_user.is_authenticated
            return (
                make_response(jsonify(likes=[like.json(is_local) for like in comment_likes])),
                httpStatus.OK,
            )
        elif request.method == "PUT":  # Get all likes for a given comment
            if (
                Like.query.filter_by(comment=comment_id, author=current_user.id).first()
                is not None
            ):  # user has already liked comment
                return utils.json_response(
                    httpStatus.CONFLICT, {"message": res_msg.AUTHOR_LIKE_CONFLICT}
                )
            author = current_user.id
            comment = comment_id
            like = Like(author, comment=comment)
            db.session.add(like)
            db.session.commit()
            like.push()
            return Response(status=httpStatus.CREATED)
        elif request.method == "DELETE":  # Get all likes for a given comment
            like = Like.query.filter_by(
                comment=comment_id, author=current_user.id
            ).first()
            if like is None:  # user has not liked comment
                return utils.json_response(
                    httpStatus.NOT_FOUND, {"message": res_msg.AUTHOR_LIKE_NOT_EXIST}
                )
            like.delete()
            return Response(status=httpStatus.NO_CONTENT)
    else:
        return (
            make_response(jsonify(error=res_msg.NO_PERMISSION)),
            httpStatus.UNAUTHORIZED,
        )


@bp.route("/authors/<path:author_id>/liked", methods=["GET"])
@require_authentication
def get_author_liked(author_id: str):
    ##remote
    regex = r"https?:\/\/.*\/authors\/(.+)"
    if (match := re.match(regex, author_id)):
        author_id = match.group(1)
    if find_remote_author(author_id):
        remote_liked = get_remote_author_liked(author_id)
        return (
            make_response(
                jsonify(type="liked", items=remote_liked)
            ),
            httpStatus.OK,
        )

    ##local
    if Author.query.filter_by(id=author_id).first() is None:  # author doesn't exist
        return utils.json_response(
            httpStatus.NOT_FOUND, {"message": res_msg.AUTHOR_NOT_EXISTS}
        )
    author_post_likes = (
        Like.query.filter_by(author=author_id).join(Post).filter_by(private=False).all()
    )
    author_comment_likes = (
        Like.query.filter_by(author=author_id)
        .join(Comment)
        .join(Post)
        .filter_by(private=False)
        .all()
    )
    author_likes = author_comment_likes + author_post_likes
    is_local = current_user.is_authenticated
    return (
        make_response(
            jsonify(type="liked", items=[like.json(is_local) for like in author_likes])
        ),
        httpStatus.OK,
    )


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
            login_user(new_author)
            return utils.json_response(
                httpStatus.OK,
                {"message": res_msg.SUCCESS_USER_CREATED, "data": new_author.json()},
            )
        else:
            return utils.json_response(
                httpStatus.BAD_REQUEST,
                {"message": res_msg.USER_ALREADY_EXISTS},
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
        if author == None:
            raise Exception(
                f"Requested unit test author {author_id} is empty on query return!"
            )
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
@require_authentication
def logout() -> Response:
    try:
        logout_user()
        return utils.json_response(httpStatus.OK, {"message": res_msg.SUCCESS_LOGOUT})
    except Exception as e:
        return utils.json_response(
            httpStatus.INTERNAL_SERVER_ERROR, {"message": res_msg.LOGOUT_ERROR}
        )


@bp.route("/login_test", methods=["GET"])
@require_authentication
def login_test() -> Response:
    return make_response(jsonify(message="Successful log in")), httpStatus.OK

@bp.route("/admin/author/<string:author_id>", methods=["POST"])
@require_authentication
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
@require_authentication
def create_author() -> Response:
    is_local = current_user.is_authenticated
    if not current_user.isAdmin:
        return (
            make_response(jsonify(error=res_msg.NO_PERMISSION)),
            httpStatus.UNAUTHORIZED,
        )
    try:
        displayName = request.json["displayName"]
        github_username = request.json["github"]
        github_info = get_github_by_id(github_username)
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
            {"message": res_msg.SUCCESS_USER_CREATED, "data": author.json(is_local)},
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
@require_authentication
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
@require_authentication
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
@require_authentication
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


@bp.route("/remotes", methods=["GET"])
def get_remote() -> Response:
    if not http_basic_authentication():
        return utils.json_response(
            httpStatus.UNAUTHORIZED,
            {
                "message": "Basic auth failed. Give the correct user/password combination"
            },
        )
    remotes = Remote_Node.query.all()
    remote_list = [remote.json() for remote in remotes]
    return (
        make_response(
            jsonify(
                type="remotes",
                items=remote_list,
            )
        ),
        httpStatus.OK,
    )


@bp.route("/remotes", methods=["PUT"])
def add_remote() -> Response:
    if not http_basic_authentication():
        return utils.json_response(
            httpStatus.UNAUTHORIZED,
            {
                "message": "Basic auth failed. Give the correct user/password combination"
            },
        )
    try:
        remote_id = request.json.get("url")
        remote_username = request.json.get("username")
        remote_password = request.json.get("password")
    except Exception as e:
        return utils.json_response(
            httpStatus.BAD_REQUEST,
            {"message": res_msg.GENERAL_ERROR + str(e)},
        )
    remote_node = Remote_Node.query.filter_by(id=remote_id).first()
    if remote_node:
        return utils.json_response(
            httpStatus.BAD_REQUEST,
            {"message": "Remote node already exists."},
        )
    remote_node = Remote_Node(remote_id, remote_username, remote_password)
    db.session.add(remote_node)
    db.session.commit()
    return utils.json_response(
        httpStatus.OK,
        {"message": "Remote node added"},
    )


@bp.route("/remotes/<path:remote_id>", methods=["DELETE"])
def delete_remote(remote_id: str) -> Response:
    if remote_id[-1] != "/":
        remote_id += "/"
    if not http_basic_authentication():
        print(request.authorization.username, request.authorization.password)
        return utils.json_response(
            httpStatus.UNAUTHORIZED,
            {
                "message": "Basic auth failed. Give the correct user/password combination"
            },
        )
    remote_node = Remote_Node.query.filter_by(id=remote_id).first_or_404()
    db.session.delete(remote_node)
    db.session.commit()
    return utils.json_response(
        httpStatus.OK,
        {"message": "Remote node deleted"},
    )


@bp.route("/remotes_debug/<string:author_id>", methods=["GET"])#debug
def remote_debug(author_id) -> Response:
    p = get_remote_author_posts(author_id,5)
    return utils.json_response(
        httpStatus.OK,
        {"message": f"returned: {p}"},
    )
