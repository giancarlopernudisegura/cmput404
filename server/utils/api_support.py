from server.models import Author
from server.exts import db
from firebase_admin import auth, credentials
import firebase_admin
from server.utils.create_credential_json import get_fbs_prv_key

# creates the json
fbs_private_key = get_fbs_prv_key()

cred = credentials.Certificate(fbs_private_key)
firebase_admin.initialize_app(cred)

def get_github_user_id(decoded_token):
    return decoded_token['firebase']['identities']['github.com'][0]

def get_displayName(auth, decoded_token):
    user = auth.get_user(decoded_token["user_id"])
    return user.display_name

def create_author(decoded_token, auth):
    # if author doesn't exists, create an entry
    displayName = get_displayName(auth, decoded_token)
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

def get_author(token):
    # create_session_cookie also verifies the token
    decoded_token = auth.verify_id_token(token)

    # check if user exists in the database
    github_id = utils.get_github_user_id(decoded_token)
    author = Author.query.filter_by(githubId=github_id).first()
    
    return author, decoded_token
