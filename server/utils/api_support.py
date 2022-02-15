from server.models import Author
from server.exts import db

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