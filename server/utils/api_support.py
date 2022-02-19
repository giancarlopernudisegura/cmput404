from server.models import Author
from server.exts import db
from flask import Response
from server.utils import create_credential_json
import server.utils.api_support as utils
from firebase_admin import auth, credentials
import firebase_admin
import json

# creates the json
fbs_private_key = create_credential_json.get_fbs_prv_key()

#initialize firebase
cred = credentials.Certificate(fbs_private_key)
firebase_admin.initialize_app(cred)

def get_github_user_id(decoded_token):
    return decoded_token['firebase']['identities']['github.com'][0]

def get_displayName(decoded_token):
    user = auth.get_user(decoded_token["user_id"])
    return user.display_name

def create_author(decoded_token):
    # if author doesn't exists, create an entry
    displayName = get_displayName(decoded_token)
    githubId = get_github_user_id(decoded_token)
    profileImageId = decoded_token["picture"]
    isAdmin = False
    isVerified = False

    author = Author(githubId, profileImageId, displayName, isAdmin, isVerified)
    db.session.add(author)
    db.session.commit()

def json_response(status, body={}, headers={}) -> Response:
    res = Response(
        status=status, 
        headers=headers, 
        mimetype="application/json",
        response=json.dumps(body)
    )
    return res

def get_author(token, expires_in):
    # create_session_cookie also verifies the token
    session_cookie = auth.create_session_cookie(token, expires_in=expires_in)
    decoded_token = auth.verify_id_token(token)

    # check if user exists in the database
    github_id = utils.get_github_user_id(decoded_token)
    author = Author.query.filter_by(githubId=github_id).first()
    
    return author, session_cookie, decoded_token