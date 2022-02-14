from flask import Blueprint, jsonify, make_response
from firebase_admin import auth, credentials
import firebase_admin
from flask import request
from .create_credential_json import get_fbs_prv_key
from ast import expr_context
from re import L
from unicodedata import category
from flask import Blueprint, jsonify, make_response, request, Response
from server.exts import db
from server.models import *
from server.enums import *
import server.httpStatus as httpStatus

bp = Blueprint('api', __name__, url_prefix='/service')

# creates the json
fbs_private_key = get_fbs_prv_key()

cred = credentials.Certificate(fbs_private_key)
firebase_admin.initialize_app(cred)

post_visibility_map  = {
    "PUBLIC": False,
    "FRIENDS": True
}

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
        unlisted = request.form.get("unlisted")
        if unlisted == None:#default to not unlisted
            unlisted = False

        try:
            contentType= ContentType(request.form.get("contentType"))
        except:
            return Response(status=httpStatus.BAD_REQUEST)#bad content type

        if not request.form.get("visibility") in post_visibility_map:
            return Response(status=httpStatus.BAD_REQUEST)#bad visibility type or no visibility given
        private = post_visibility_map[request.form.get("visibility")]

        post = Post(author, title, category, content, contentType, private)
        db.session.add(post)
        db.session.commit()
        return Response(status=httpStatus.OK)
    
@bp.route('/hello_world')
def hello_world():
    return make_response(jsonify(message='Hello World')), 200

@bp.route('/verify_login')
def verify_login():
    # get token from authorization header
    authorization_header = request.headers['Authorization']
    token = authorization_header.replace("Bearer ", "")

    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        print("UID", uid)
    except Exception as e:
        print("Error", str(e))
        return make_response(jsonify(message='There was an error' + str(e))), 500

    return make_response(jsonify(message='Success')), 200