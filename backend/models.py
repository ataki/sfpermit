from backend.core import db
from backend import app
from backend.core import Security, SQLAlchemyUserDatastore, \
    RoleMixin
import simplejson as json

# ----------- User -------------

roles_users = db.Table('sfp_roles_users',
    db.Column('user_id', db.Integer(), db.ForeignKey('sfp_user.id')),
    db.Column('role_id', db.Integer(), db.ForeignKey('sfp_role.id'))
)


class User(db.Model):
    __tablename__ = 'sfp_user'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True)
    email = db.Column(db.String(64), unique=True)
    password = db.Column(db.String(255))
    active = db.Column(db.Integer())
    confirmed_at = db.Column(db.DateTime())
    roles = db.relationship('Role', secondary=roles_users,
        backref=db.backref('users', lazy='dynamic'))

    # Custom methods to manage password auth

    # def hash_password(self, plaintext):
    #   self.password = encrypt_password(plaintext)

    # def check_password(self, challenge):
        # print 'checking password'
        # return verify_password(challenge, self.password)

    # Methods for login

    def is_authenticated(self):
        return True

    def is_active(self):
        return self.active

    def is_anonymous(self):
        return False

    def get_id(self):
        return unicode(self.id)

    def as_json(self):
        return json.dumps({
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'confirmed_at': self.confirmed_at
        })

    def __repr__(self):
        return '<User %r>' % self.username


class Role(db.Model, RoleMixin):
    __tablename__ = 'sfp_role'

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

# User security
user_datastore = SQLAlchemyUserDatastore(db, User, Role)
security = Security(app, user_datastore)


def validate_user_request(form):
    return "username" in form and "email" in form and "password" in form


# ------------ App Specific Models -----------------

class Permit(db.Model):
    __tablename__ = 'sfp_permit'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    case_number = db.Column(db.String(16))
    total_records_by_case = db.Column(db.Integer)
    project_name = db.Column(db.String(256))
    net_units = db.Column(db.Integer)
    block_lot = db.Column(db.Integer)
    min_filed = db.Column(db.DateTime)
    max_action = db.Column(db.DateTime)
    allowed_height = db.Column(db.Float)
    plan_area = db.Column(db.Integer)
    case_decision_date = db.Column(db.DateTime)
    case_decision = db.Column(db.String(16))
    q4_report_status = db.Column(db.String(64))
    last_planning_suffix = db.Column(db.String(16))
    last_planning_action = db.Column(db.String(16))
    days = db.Column(db.Integer)
    er_complete = db.Column(db.Integer)
    er_interim = db.Column(db.Integer)
    c = db.Column(db.Integer)
    v = db.Column(db.Integer)
    x = db.Column(db.Integer)
    d = db.Column(db.Integer)
    bp = db.Column(db.Integer)
    r = db.Column(db.Integer)
    total = db.Column(db.Integer)
    diff = db.Column(db.Integer)
    multiple = db.Column(db.Integer)
    cancelled_planning = db.Column(db.Integer)
    cancelled_bp = db.Column(db.Integer)
    in_current_planning = db.Column(db.Integer)
    bp_reinstated = db.Column(db.Integer)
    bp_issued = db.Column(db.Integer)
    occupancy_permit = db.Column(db.Integer)
    planning_approved = db.Column(db.Integer)
    case_in_q4_report = db.Column(db.Integer)
    blocklot_in_q4_report = db.Column(db.Integer)
    in_q4_report = db.Column(db.Integer)
    missing_data = db.Column(db.Integer)
    case_year = db.Column(db.Integer)
    filing_year = db.Column(db.Integer)
    action_year = db.Column(db.Integer)
    notes = db.Column(db.String(512))
    more = db.Column(db.String(512))
    manual_exclusion = db.Column(db.String(64))
    qc_check_against_quarterly = db.Column(db.Integer)
    possible_false_negative = db.Column(db.String(16))
    overridden_date = db.Column(db.Integer)
    unitgrp = db.Column(db.Integer)
    hgrp1 = db.Column(db.Integer)
    hgrp2 = db.Column(db.Integer)
    m = db.Column(db.Integer)
    ydiff = db.Column(db.Integer)
    unitgrp2 = db.Column(db.Integer)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    address = db.Column(db.String(256))
    final_status = db.Column(db.String(64))
    prediction = db.Column(db.Float)

    def __repr__(self):
        return "<Permit at %s>" % self.project_name


# ------------ API Declaration ---------------------

# models for which we want to create API endpoints
# each mapping consists of (name -> model_config)
# which corresponds to kwarg options to
# Flask-Restless's "create_api" method
# Some of the commonly included ones include:
#   "model_class" Python class to use as API endpoint
#   "methods" Allowed HTTP methods (GET/POST/PUT/DELETE)
#   "exclude_columns" Column names to exclude from DB


app.config['API_MODELS'] = {
    'user': {
        'model_class': User,
        'exclude_columns': ['password']
    },
    'permit': {
        'model_class': Permit,
        'methods': ['GET', 'POST', 'PUT'],
        'results_per_page': 200,
        'max_results_per_page': 300
    }
}
