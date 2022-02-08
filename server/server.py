#!/usr/bin/env python3

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import re
from flask import Flask, redirect, current_app
from routes import hello_world
import os
from dotenv import load_dotenv


load_dotenv()


dir = os.path.abspath(os.path.dirname(__file__))

db = SQLAlchemy()
migrate = Migrate()


def create_app(config_filename=None):
    app = Flask(__name__,
                static_folder=os.path.join(dir, '../public'),
                static_url_path='/')

    if not config_filename:
        config_filename = os.getenv("APP_SETTINGS", "config.DevelopmentConfig")

    app.config.from_object(config_filename)

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)
    migrate.init_app(app, db)

    app.register_blueprint(hello_world.bp)

    @app.route('/')
    def index():
        return app.send_static_file('index.html'), 200

    @app.route('/hello')#for local testing 
    def hello():
        return f'Hello, World! ... but with more!\n'

    @app.route('/bundle.js')
    def bundle_js():
        if current_app.debug:
            return redirect('//localhost:3000/bundle.js')
        else:
            return app.send_static_file('bundle.js'), 200

    return app


app = create_app()
app.app_context().push()


if __name__ == '__main__':
    app.run()
