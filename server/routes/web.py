from flask import Blueprint, redirect, current_app, Response
from flask_login import current_user
from http import HTTPStatus as httpStatus
import os
from dotenv import load_dotenv

load_dotenv()

HOST = os.getenv("FLASK_HOST")

bp = Blueprint("webapp", __name__, url_prefix="/app")


def frontend_page() -> Response:
    return current_app.send_static_file("index.html"), httpStatus.OK


@bp.route("/", methods=["GET"])
def index():
    if current_user.is_authenticated:
        return frontend_page()
    else:
        return redirect("/app/login")


@bp.route("/login", methods=["GET"])
def login():
    if current_user.is_authenticated:
        return redirect('/app')
    else:
        return frontend_page()

@bp.route("/homepage", methods=["GET"])
def homepage():
    return frontend_page()

@bp.route("/profile", methods=["GET"])
def profile():
    return frontend_page()

@bp.route("/inbox", methods=["GET"])
def inbox():
    return frontend_page()

@bp.route('/user/<int:user_id>', methods=["GET"])
def user(user_id):
    return frontend_page()