#!/usr/bin/env python3

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from routes import hello_world
import os
from dotenv import load_dotenv


load_dotenv()


dir = os.path.abspath(os.path.dirname(__file__))


def create_app(config_filename=None):

    app = Flask(__name__,
                static_folder=os.path.join(dir, '../public'),
                static_url_path='/')

    if not config_filename:
        #config_filename = os.environ['APP_SETTINGS']
        config_filename = os.getenv("APP_SETTINGS", "config.DevelopmentConfig")

    app.config.from_object(config_filename)

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db = SQLAlchemy(app)

    app.register_blueprint(hello_world.bp)

    @app.route('/')
    def index():
        return app.send_static_file('index.html'), 200

    @app.route('/hello')#for testing heroku, remove once heroku setup is completely finished
    def hello():
        return 'Hello, World! ... but with more!'

    return app


app = create_app()


if __name__ == '__main__':
    app.run()
