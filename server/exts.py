from functools import wraps
from flask import request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import PendingRollbackError
from flask_login import LoginManager, current_user
import os


db = SQLAlchemy()
login_manager = LoginManager()

LOCAL_AUTH_USER = os.getenv("LOCAL_AUTH_USER")
LOCAL_AUTH_PASSWORD = os.getenv("LOCAL_AUTH_PASSWORD")


def http_basic_authentication():
    """
    Basic HTTP authentication
    """
    if request.authorization and (
        request.authorization.username == LOCAL_AUTH_USER
        and request.authorization.password == LOCAL_AUTH_PASSWORD
    ):
        return True
    return False


def require_authentication(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not current_user.is_authenticated and not http_basic_authentication():
                return login_manager.unauthorized()
        try:
            return func(*args, **kwargs)
        except PendingRollbackError:
            db.session.rollback()
            return func(*args, **kwargs)

    return wrapper
