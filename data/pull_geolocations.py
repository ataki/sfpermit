from backend.core import db
from backend.models import *
from geopy.geocoders import GoogleV3

geolocator = GoogleV3()

errors = []
for record in Permit.query.all():
    try:
        address, (lat, lng) = geolocator.geocode(record.project_name +
            " San Francisco")
        record.address = address
        record.latitude = lat
        record.longitude = lng
        print "%s --> %f %f" % (record.project_name, lat, lng)
    except Exception:
        errors.append(record.project_name)
db.session.commit()

f = open("./data/error_project_names.txt", "w")
f.write("\n".join(errors))
f.close()
