import os

from flask import send_from_directory, make_response, abort, request

from flask.ext.login import logout_user
from flask.ext.security.core import current_user
from flask.ext.security.decorators import login_required

from backend import app

# routing for API endpoints (generated from the models designated as API_MODELS)
from backend.core import api_manager
from backend.models import *

from geopy.geocoders import GoogleV3

geolocator = GoogleV3()
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


# -------- API -------------


# routing for basic pages (pass routing onto the Angular app)
@app.route('/')
def basic_pages(**kwargs):
    return make_response(open('backend/templates/index.html').read())


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

# @app.errorhandler(404)
# def page_not_found(e):
    # return render_template('404.html'), 404


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
