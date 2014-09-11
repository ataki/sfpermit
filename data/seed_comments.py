"""
Inspects information from permits and auto-creates logs
"""

from datetime import datetime
from backend.models import *

for permit in Permit.query.all():
    comment = PermitComment(
        permit_id=permit.id,
        text="Test comment",
        timestamp=datetime.now())
    db.session.add(comment)
db.session.commit()
