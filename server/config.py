import os
from dotenv import load_dotenv


load_dotenv()


class BaseConfig:
    DEBUG = False
    TESTING = False
    HOST = '0.0.0.0'
    #SECRET_KEY = os.environ['SECRET_KEY']
    SECRET_KEY = os.getenv("SECRET_KEY")


class DevelopmentConfig(BaseConfig):
    ENV = 'development'
    DEBUG = True
    DEVELOPMENT = True


class TestingConfig(BaseConfig):
    TESTING = True


class ProductionConfig(BaseConfig):
    ENV = 'production'
