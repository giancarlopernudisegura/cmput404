from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
import os


db = SQLAlchemy()
login_manager = LoginManager()

LOCAL_AUTH_USER = os.getenv("LOCAL_AUTH_USER")
LOCAL_AUTH_PASSWORD = os.getenv("LOCAL_AUTH_PASSWORD")