from server.models import Author
from server.exts import db
from flask import Response
from server.utils import create_credential_json
from firebase_admin import auth, credentials
from urllib.request import urlopen
from server.constants import custom_err
import server.utils.api_support as utils
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

    # create author in database
    db.session.add(author)
    db.session.commit()

    return author

def json_response(status, body={}, headers={}) -> Response:
    res = Response(
        status=status, 
        headers=headers, 
        mimetype="application/json",
        response=json.dumps(body)
    )
    return res

def get_author(token):
    # create_session_cookie also verifies the token
    decoded_token = auth.verify_id_token(token)

    # check if user exists in the database
    github_id = utils.get_github_user_id(decoded_token)
    author = Author.query.filter_by(githubId=github_id).first()
    
    return author, decoded_token

def get_github_id(gh_username):
    resp = urlopen(f'https://api.github.com/users/{gh_username}')
    data = json.loads(resp.read().decode('utf-8'))

    return data["id"]

def update_user_me(request, current_user):
    data = request.form

    fields = [
        "githubUsername",
        "displayName",
        "profileImageId"
    ]

    # verify that necessary values to update user were sent
    for field in fields:
        if field not in data:
            raise custom_err.MissingFieldError(fields)

    github_username = request.form.get("githubUsername")
    current_user.githubId = utils.get_github_id(github_username)
    current_user.displayName = request.form.get("displayName")
    current_user.profileImageId = request.form.get("profileImageId")

    db.session.merge(current_user)
    db.session.commit()

    return current_user
