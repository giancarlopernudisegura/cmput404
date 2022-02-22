# /login endpoint
from http.client import CONFLICT


SUCCESS_USER_CREATED = "User was successfully created"
SUCCESS_VERIFY_USER = "User credentials are valid"

GENERAL_ERROR = "There was an error "

TOKEN_MISSING = "Token was not included in request."

NO_PERMISSION = "You do not have permission to perform this action."
CREATE_CONFLICT = "The resource you are trying to create is already exists."
