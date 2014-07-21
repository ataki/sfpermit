from backend.core import db
from backend.models import *
from geopy.geocoders import GoogleV3

geolocator = GoogleV3()

errors = []
for record in Permit.query.filter(Permit.latitude == 0):
    try:
        address, (latitude, longitude) = geolocator.geocode(record.project_name)
        record.project_name = address
        record.latitude = latitude
        record.longitude = longitude
        print "%s --> %f %f" % (record.project_name, latitude, longitude)
    except Exception:
        errors.append(record.project_name)
db.session.commit()

f = open("./data/error_project_names.txt", "w")
f.write("\n".join(errors))
f.close()
