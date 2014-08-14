from backend.models import *
from dateutil.relativedelta import relativedelta

for row in Permit.query.all():
    fixed = False
    if row.min_filed != None and row.min_filed.year < 2000:
        row.min_filed += relativedelta(years=2000)
        fixed = True
    if row.max_action != None and row.max_action.year < 2000:
        row.max_action += relativedelta(years=2000)
        fixed = True
    if row.case_decision_date != None and row.case_decision_date.year < 2000:
        row.case_decision_date += relativedelta(years=2000)
        fixed = True
    if fixed:
        print row
    db.session.add(row)
db.session.commit()
