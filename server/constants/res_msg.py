# /login endpoint
from http.client import CONFLICT


SUCCESS_USER_CREATED = "User was successfully created"
USER_DOES_NOT_EXIST = "User does not exist. Please sign up first."
USER_ALREADY_EXISTS = "User already exists. Please sign in."
SUCCESS_VERIFY_USER = "User credentials are valid"

# Error message
GENERAL_ERROR = "There was an error "


# /logout endpoint
LOGOUT_ERROR = "Unable to log out user."
SUCCESS_LOGOUT = "Successful log out."

# /update_me endpoint
SUCCESS_USER_UPDATE = "User was succesfully updated"

MISSING_FIELD_ERROR = "A valid field is missing in POST request"

TOKEN_MISSING = "Token was not included in request."

NO_PERMISSION = "You do not have permission to perform this action."
CREATE_CONFLICT = "The resource you are trying to create is already exists."
