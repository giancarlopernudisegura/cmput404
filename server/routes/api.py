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

        if not request.form.get("visibility") in post_visibility_map:
            pass#return bad
        private = post_visibility_map[request.form.get("visibility")]
        
