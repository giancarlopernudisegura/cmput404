from flask import Blueprint, jsonify, make_response
from firebase_admin import auth, credentials
import firebase_admin
from flask import request


bp = Blueprint('api', __name__, url_prefix='/service')

cred = credentials.Certificate("./tiktaktoe-private-key.json")
firebase_admin.initialize_app(cred)

@bp.route('/hello_world')
def hello_world():
    return make_response(jsonify(message='Hello World')), 200

@bp.route('/signin')
def signin():
    # get token from authorization header
    authorization_header = request.headers['Authorization']
    token = authorization_header.replace("Bearer ", "")

    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        print("UID", uid)
    except Exception as e:
        print("Error", str(e))
        return make_response(jsonify(message='There was an error')), 500

    return make_response(jsonify(message='Success')), 200
