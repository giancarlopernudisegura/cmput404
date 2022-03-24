import os
from dotenv import load_dotenv


load_dotenv()


DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)


class BaseConfig:
    DEBUG = False
    TESTING = False
    HOST = "0.0.0.0"
    SECRET_KEY = os.getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Custom server settings
    AUTOMATIC_VERIFICATION = True



class DevelopmentConfig(BaseConfig):
    ENV = "development"
    DEBUG = True
    DEVELOPMENT = True


class TestingConfig(BaseConfig):
    TESTING = True


class ProductionConfig(BaseConfig):
    ENV = "production"


RUNTIME_SETTINGS = ("AUTOMATIC_VERIFICATION",)
