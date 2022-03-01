#!/usr/bin/env python3
from datetime import datetime
from http import HTTPStatus
from flask_migrate import Migrate
from flask import Flask, redirect, current_app
from server.routes import api, web
from server.exts import db, login_manager
from server.models import Author, Post
from server.enums import ContentType
import os
from dotenv import load_dotenv


load_dotenv()


dir = os.path.abspath(os.path.dirname(__file__))
FRONT_END_HOST = os.getenv("PREACT_HOST")

migrate = Migrate()


def create_app(config_filename=None):
    app = Flask(
        __name__, static_folder=os.path.join(dir, "../public"), static_url_path="/"
    )

    if not config_filename:
        config_filename = os.getenv(
            "APP_SETTINGS", "server.config.DevelopmentConfig")

    app.config.from_object(config_filename)
    app.url_map.strict_slashes = False

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    app.register_blueprint(api.bp)
    app.register_blueprint(web.bp)

    @app.route("/", methods=["GET"])
    def index():
        return redirect("/app")

    @app.route("/bundle.js")
    def bundle_js():
        if current_app.debug:
            return redirect(f'{os.environ["PREACT_HOST"]}/bundle.js')
        else:
            return app.send_static_file("bundle.js"), HTTPStatus.OK

    @app.route("/favicon.ico")
    def favicon():
        return app.send_static_file("assets/logo.svg"), HTTPStatus.OK

    @app.before_first_request
    def create_tables():
        db.create_all()  # must be run before interacting with database
        
    @login_manager.user_loader
    def load_user(user_id):
        return Author.query.get(user_id)

    # add CORS
    # TODO
    @app.after_request
    def after_request(response):
        response.headers.add(
            "Access-Control-Allow-Origin", f"{FRONT_END_HOST}")
        response.headers.add(
            "Access-Control-Allow-Headers", "Content-Type,Authorization,Set-Cookie"
        )
        response.headers.add(
            "Access-Control-Allow-Methods", "GET,PUT,POST,DELETE")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response

    return app


app = create_app()
app.app_context().push()


if __name__ == "__main__":
    app.run()
