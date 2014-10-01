from flask import send_from_directory, make_response, \
    request, render_template, flash, redirect, abort, \
    jsonify, url_for

from flask.ext.login import logout_user
from flask.ext.security.core import current_user
from flask.ext.security.decorators import login_required
from flask.ext.wtf import Form

from wtforms.ext.sqlalchemy.orm import model_form

from backend import app
from backend.models import Permit

import os
import math
import calendar
import datetime

from geopy.geocoders import GoogleV3
geolocator = GoogleV3()

# routing for API endpoints (generated from the models designated as API_MODELS)
from backend.core import api_manager
from backend.models import *

from geopy.geocoders import GoogleV3
geolocator = GoogleV3()

# Api for models
default_model_config = {
    'url_prefix': app.config['API_ENDPOINT_PREFIX'],
    'methods': ['GET', 'POST']
}

for model_name in app.config['API_MODELS']:
    model_config = default_model_config.copy()
    model_config["collection_name"] = model_name
    model_config.update(app.config['API_MODELS'][model_name])
    model_class = model_config.pop('model_class')
    api_manager.create_api(model_class, **model_config)

session = api_manager.session

# Model forms for routes
PermitForm = model_form(Permit, Form, field_args={
    'min_filed': {'format': "%m/%d/%Y"},
    'max_action': {'format': "%m/%d/%Y"},
    'case_decision_date': {'format': "%m/%d/%Y"}
})
# StagedPermitForm = model_form(StagedPermit, Form)


def default(obj):
    """Default JSON serializer."""
    if isinstance(obj, datetime.datetime):
        if obj.utcoffset() is not None:
            obj = obj - obj.utcoffset()
            millis = int(
                calendar.timegm(obj.timetuple()) * 1000 +
                obj.microsecond / 1000
            )
            return millis


# - Routes -
@app.route('/logout')
def logout():
    logout_user()
    return redirect_url("/")


@app.route("/geocode")
def geocode_api():
    query = request.args.get("query")
    address, (latitude, longitude) = geolocator.geocode(query)
    return json.dumps({
        'address': address,
        'latitude': latitude,
        'longitude': longitude
    })


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/edit/<int:permit_id>', methods=['GET', 'POST'])
@login_required
def edit_permit(permit_id):
    model = Permit.query.get(permit_id)
    form = PermitForm(request.form, model)
    if request.method == "POST" and form.validate():
        form.populate_obj(model)
        db.session.add(model)
        db.session.commit()
        flash("Changes saved")
        return redirect(url_for("index"))
    return render_template("edit_permit.html", form=form, model=model)


@app.route("/upload", methods=['GET', 'POST'])
@login_required
def upload_permit():
    form = PermitForm(request.form)
    # form.min_filed.data = datetime.datetime.strptime(form.min_filed._value(), "%m/%d/%Y")
    # form.max_action.data = datetime.datetime.strptime(form.min_filed._value(), "%m/%d/%Y")
    # form.case_decision_date.data = datetime.datetime.strptime(form.min_filed._value(), "%m/%d/%Y")
    if request.method == "POST" and form.validate():
        permit = Permit()
        form.populate_obj(permit)
        # Usually this is manually assigned, however I'm guessing model_forms doesn't
        # support polymorphic types. sqlalchemy is also partly to blame as they don't 
        # assign this post-saving the model.
        permit.type = 'permit'

        if permit.address is None or len(permit.address) == 0:
            try:
                address, (lat, lng) = geolocator.geocode(permit.project_name + " San Francisco")
                permit.address = address
                permit.latitude = lat
                permit.longitude = lng
            except:
                flash("Permit created, but couldn't translate project name to an address")
                permit.latitude = None
                permit.longitude = None
                permit.address = None
        else:
            try:
                _un, (lat, lng) = geolocator.geocode(permit.address + " San Francisco")
                permit.latitude = lat
                permit.longitude = lng
            except:
                flash("Permit created, but address not found")
                permit.latitude = None
                permit.longitude = None

        db.session.add(permit)
        db.session.commit()
        flash("Permit created")
        return redirect(url_for("index"))

    return render_template("upload_permit.html", form=form, 
        required_fields=['case_number', 'project_name', 'final_status',
            'case_decision_date', 'net_units'],
        omit_fields=['e', 'c', 'v', 'x', 'd', 'a', 'r', 
            'longitude', 'latitude', 'prediction', 'type'])


@app.route("/manage", methods=['GET'])
@login_required
def manage_permits():
    return render_template("manage_permits.html")


def distanceGenerator(lat, lng):
    def fn(m):
        x = m.latitude
        y = m.longitude
        return math.sqrt((lat-x)**2 + (lng-y)**2)
    return fn


def byUnits(x):
    return -x.units


def byRisk(x):
    return -x.prediction


@app.route("/nearest/<string:metric>", methods=["GET", "POST"])
def nearest_permits(metric):
    limit = int(request.args.get("limit")) if "limit" in request.args \
        else 30
    if metric == "distance":
        lat = float(request.args.get("lat"))
        lng = float(request.args.get("lng"))
        fn = distanceGenerator(lat, lng)
    elif metric == "units":
        fn = byUnits
    elif metric == "risk":
        fn = byRisk
    permits = [x for x in Permit.query.all()]
    filtered = sorted(permits, key=lambda x: fn(x))
    models = [x.__dict__ for x in filtered[:limit]]
    for m in models:
        m.pop("_sa_instance_state")
    # return json.dumps(models, default=default)
    return jsonify({
        "num_results": len(models),
        "objects": models,
        "pages": 1,
        "total_pages": 1
    })


# gets current user data as json
@app.route('/me')
@login_required
def who_am_i():
    if current_user and \
        hasattr(current_user, 'username') and \
            not current_user.is_anonymous():
        return make_response(current_user.as_json())
    else:
        abort(404)


# special file handlers and error handlers
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'img/favicon.ico')


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


@app.route("/site-map")
def site_map():
    links = []
    for rule in app.url_map.iter_rules():
        # filter out rules we can't navigate to in a browser
        # and rules that require parameters
        if "get" in rule.methods:
            links.append(rule.endpoint)
    # links is now a list of url, endpoint tuples
    return json.dumps(links)
