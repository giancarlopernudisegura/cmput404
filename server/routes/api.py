from ast import expr_context
from unicodedata import category
from flask import Blueprint, jsonify, make_response, request
from server.exts import db
from server.models import *
from server.enums import *

bp = Blueprint('api', __name__, url_prefix='/service')

post_visibility_map  = {
    "PUBLIC": False,
    "FRIENDS": True
}

post_content_type_map = {#maps content type to class, assumes that both model classes take same args
   ContentType.markdown.value: TextPost,
   ContentType.plain.value: TextPost,
   ContentType.png.value: ImagePost,
   ContentType.jpeg.value: ImagePost
}

post_content_type_enum_map = {#maps content type to specific enum
   ContentType.markdown.value: TextContentType,
   ContentType.plain.value: TextContentType,
   ContentType.png.value: ImageContentType,
   ContentType.jpeg.value: ImageContentType
}



@bp.route('/hello_world')
def hello_world():
    return make_response(jsonify(message='Hello World')), 200

@bp.route("authors/<author_id>", methods=['GET', 'POST'])
def single_author(author_id):
    if request.method == "GET":
        pass
    elif request.method == "POST":
        pass
        #request.form.get('displayName')

@bp.route("authors/<author_id>/posts/", methods=['GET', 'POST'])
def create_post(author_id):
    if request.method == "GET":
        pass
    elif request.method == "POST":
        author = author_id
        title = request.form.get("title")
        category = request.form.get("category")
        content = request.form.get("content")
        unlisted = request.form.get("content")
        contentTypeString = request.form.get("contentType")

        #models classes MUST have same constructor args
        if contentTypeString not in post_content_type_map:
            pass#return bad contentType
        contentType = post_content_type_enum_map[contentTypeString](contentTypeString)
        post


        if not request.form.get("visibility") in post_visibility_map:
            pass#return bad
        private = post_visibility_map[request.form.get("visibility")]
        
