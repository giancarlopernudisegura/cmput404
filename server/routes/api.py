from ast import expr_context
from re import L
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
def post(author_id):
    if request.method == "GET":
        pass
    elif request.method == "POST":
        author = author_id
        title = request.form.get("title")
        category = request.form.get("category")
        content = request.form.get("content")
        unlisted = request.form.get("content")
        try:
            contentType= ContentType(request.form.get("contentType"))
        except:
            pass#return bad
            return "bad content type", 400

        if not request.form.get("visibility") in post_visibility_map:
            pass#return bad
            return "bad visibility", 400
        private = post_visibility_map[request.form.get("visibility")]
        post = Post(author, title, category, content, contentType)
        db.session.add(post)
        db.session.commit()
        return "post created", 201
