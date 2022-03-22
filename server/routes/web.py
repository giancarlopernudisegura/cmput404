from flask import Blueprint, redirect, current_app, Response
from flask_login import current_user, login_required
from http import HTTPStatus as httpStatus
import os
from dotenv import load_dotenv

load_dotenv()

HOST = os.getenv("FLASK_HOST")

bp = Blueprint("webapp", __name__, url_prefix="/app")


def frontend_page(authenticated: bool) -> Response:
    if authenticated:
        return current_app.send_static_file("index.html"), httpStatus.OK
    else:
        return redirect("/app/login")


@bp.route("/", methods=["GET"])
@bp.route("/homepage", methods=["GET"])
@bp.route("/profile", methods=["GET"])
@bp.route("/notifications", methods=["GET"])
@bp.route("/user/<int:user_id>", methods=["GET"])
def index():
    return frontend_page(current_user.is_authenticated)


@bp.route("/login", methods=["GET"])
def login():
    if current_user.is_authenticated:
        return redirect("/app")
    else:
        return frontend_page(True)


@bp.route("/inbox", methods=["GET"])
def inbox():
    return frontend_page(True)

@bp.route('/user/<int:user_id>', methods=["GET"])
def user(user_id):
    return frontend_page(True)
    
@bp.route("/admin", methods=["GET"])
@login_required
def admin():
    if current_user.isAdmin:
        return frontend_page(True)
    else:
        return redirect("/app")
