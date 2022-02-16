from flask import Blueprint, jsonify, make_response
from firebase_admin import auth, credentials
import firebase_admin
from .create_credential_json import get_fbs_prv_key
from ast import expr_context
from re import L
from unicodedata import category
from flask import Blueprint, jsonify, make_response, request, Response
from server.exts import db
from server.models import *
from server.enums import *
import server.httpStatus as httpStatus
import server.utils.api_support as utils

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
        author = Author.query.filter_by(id=author_id).first()
        if author:
            return make_response(jsonify(author.json())), httpStatus.OK
        return make_response(jsonify({"error": "Author not found"})), httpStatus.NOT_FOUND
    elif request.method == "POST":
        pass
        #request.form.get('displayName')

@bp.route("authors/<author_id>/posts/<post_id>", methods=['GET'])
def get_post(author_id, post_id):
    post = Post.query.filter_by(id=post_id).first()
    if post:
        return make_response(jsonify(post.json())), httpStatus.OK
    return make_response(jsonify({"error": "Post not found"})), httpStatus.NOT_FOUND


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
    return make_response(jsonify(message='Hello World')), httpStatus.OK

@bp.route('/login', methods=['POST'])
def login():
    # get token from authorization header
    authorization_header = request.headers['Authorization']
    token = authorization_header.replace("Bearer ", "")

    try:
        decoded_token = auth.verify_id_token(token)
    except Exception as e:
        print(e)
        print("Error", str(e))
        return make_response(jsonify(message='There was an error' + str(e))), 500

    # check if user exists in the database
    github_id = utils.get_github_user_id(decoded_token)
    author = Author.query.filter_by(githubId=github_id).first()

    if not author:
        # create an author
        utils.create_author(decoded_token, auth)
        return make_response(jsonify(message='User created')), httpStatus.OK
    else: 
        return make_response(jsonify(message='Successful log in')), httpStatus.OK
