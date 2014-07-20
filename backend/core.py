from backend import app

from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.restless import APIManager
from flask.ext.security import Security, SQLAlchemyUserDatastore, \
  UserMixin, RoleMixin, login_required
from flask.ext.security.utils import encrypt_password, verify_password
from flask.ext.login import LoginManager
from flask.ext.mail import Mail

# Exported vars. Represents a layer that
# covers sqlalchemy and exposes sets of
# functionality of SQLAlchemy to rest
# of files

db = SQLAlchemy(app)
db.create_all()

api_manager = APIManager(app, flask_sqlalchemy_db=db)

mail = Mail(app)

