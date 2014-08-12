from backend.core import db
from backend.models import *
import csv

with open("data/observations.csv", "r") as csvfile:
    reader = csv.reader(csvfile, delimiter=",", quotechar='"')
    reader.next()
    for row in reader:
        id = int(row[0])
        model = Permit.query.get(id)
        if model is not None:
            model.project_name = row[3]
            db.session.add(model)
            print "Saving model name " + str(model.project_name)
    db.session.commit()
