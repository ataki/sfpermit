from backend.core import db
from backend.models import *
from geopy.geocoders import GoogleV3
import time

geolocator = GoogleV3()

errors = []
numRetries = 0

while Permit.query.filter(Permit.address == None).count() != 0:
    numRetries += 1
    print "Trying another round"
    for record in Permit.query.filter(Permit.address == None):
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

    # Retry if necessary
    time.sleep(3)
    if numRetries > 5:
        break

f = open("./data/error_project_names.txt", "w")
f.write("\n".join(errors))
f.close()
