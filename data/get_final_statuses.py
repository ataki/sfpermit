"""
The file `observations.csv` ddoesn't contain the field
final_status. This script gathers and updates each
permit's final_status field by cross-referencing
project names from `past.performance.csv`
"""

import csv
from backend.models import *

with open("data/past.performance.csv", "r") as refFile:
    reader = csv.reader(refFile, delimiter=',')
    cols = reader.next()
    indexes = {
        "case_number": cols.index("Case Numbers"),
        "final_status": cols.index("Final Status")
    }
    for row in reader:
        case_number = row[indexes["case_number"]]
        final_status = row[indexes["final_status"]]
        permit = Permit.query.filter(Permit.case_number == case_number).first()

        # Check these case because for some reason in observations.csv,
        # case numbers were treated as floats and truncated
        # e.g. 2013.0200 -> 2013.02. This makes cross-referencing
        # by case_number more difficult

        if permit is None:
            permit = Permit.query \
                .filter(Permit.case_number == case_number[:-1]) \
                .first()
        if permit is None:
            permit = Permit.query \
                .filter(Permit.case_number == case_number[:-2]) \
                .first()

        if permit is not None:
            permit.final_status = final_status
            print "Updating permit " + str(permit)
            db.session.add(permit)
    db.session.commit()
