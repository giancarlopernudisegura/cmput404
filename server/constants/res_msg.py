# /login endpoint
from http.client import CONFLICT


SUCCESS_USER_CREATED = "User was successfully created"
SUCCESS_USER_DELETED = "User was successfully deleted"
SUCCESS_USER_UPDATED = "User was successfully updated"
USER_DOES_NOT_EXIST = "User does not exist. Please sign up first."
USER_ALREADY_EXISTS = "User already exists. Please log in instead."
SUCCESS_VERIFY_USER = "User credentials are valid"

# Error message
GENERAL_ERROR = "There was an error: "


# /logout endpoint
LOGOUT_ERROR = "Unable to log out user."
SUCCESS_LOGOUT = "Successful log out."

# /update_me endpoint
SUCCESS_USER_UPDATE = "User was succesfully updated"

MISSING_FIELD_ERROR = "A valid field is missing in POST request"

TOKEN_MISSING = "Token was not included in request."

NO_PERMISSION = "You do not have permission to perform this action."
CREATE_CONFLICT = "The resource you are trying to create is already exists."

NOT_IMAGE = "The given post is not an image."

SUCCESS_SETTINGS = "Settings were successfully updated"

# likes
AUTHOR_LIKE_CONFLICT = "The current user has already liked the requested resource."
AUTHOR_LIKE_NOT_EXIST = "Current user has not liked the requested resource."
AUTHOR_NOT_EXISTS = "The given author does not exist."
POST_DOES_NOT_EXIST = "Given Post does not exist."
AUTHOR_URI_NOT_MATCH = "The given author does not match the given resource."
