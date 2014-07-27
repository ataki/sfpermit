from backend.core import db
from backend.models import *

for record in Permit.query.all():
    record.project_name = record.project_name.split(",")[0]
db.session.commit()
