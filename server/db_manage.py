#local migration
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate, MigrateCommand
# from flask_script import Manager
from server import app, db
import os



app.config.from_object(os.getenv("DATABASE_URL"))

migrate = Migrate(app, db)

# manager = Manager(app)
# manager.add_command("db", MigrateCommand)


if __name__ == '__main__':
    pass
    #manager.run()