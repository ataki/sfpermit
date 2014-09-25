####################
# Dev Configuration
####################
import os

DEBUG = True
SECRET_KEY = '1234' # make sure to change this

SQLALCHEMY_DATABASE_URI = 'mysql+mysqldb://localhost:''@localhost/bayesimpact'
# SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']

LESS_CONFIG = {
  "SRC": "static/less",
  "DST": "static/css",
  "SRC_FILE": "static/less/stash.less",
  "DST_FILE": "static/css/stash.css"
}

# ------- Flask Security ----------
SECURITY_PASSWORD_HASH = 'pbkdf2_sha512'
SECURITY_PASSWORD_SALT = '123'
SECURITY_REGISTERABLE = True
DEFAULT_MAIL_SENDER = "jim32990@gmail.com"
SECURITY_CONFIRMABLE = False
SECURITY_RECOVERABLE = True
SECURITY_REGISTERABLE = False

# ------- Flask Email ----------
MAIL_SERVER = 'smtp.gmail.com'
MAIL_PORT = 465
MAIL_USE_TLS = False
MAIL_USE_SSL = True
MAIL_USERNAME = 'jim32990'
MAIL_PASSWORD = ''

# ------- Flask Restless --------
API_ENDPOINT_PREFIX = '/api/v1'

# ------- Static assets --------
STATIC_PATH = ''
