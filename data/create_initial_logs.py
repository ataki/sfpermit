"""
Inspects information from permits and auto-creates logs
"""

from backend.models import *

for permit in Permit.query.all():
    created_log = PermitUpdateLog(
        permit_id=permit.id,
        text="Permit first filed for creation",
        timestamp=permit.min_filed,
        type="created")
    action_log = PermitUpdateLog(
        permit_id=permit.id,
        text="Final action taken on log",
        timestamp=permit.max_action,
        type="action")
    case_decision_log = PermitUpdateLog(
        permit_id=permit.id,
        text="Case decision made: %s" % permit.case_decision,
        timestamp=permit.case_decision_date,
        type="decision")

    db.session.add(created_log)
    db.session.add(action_log)
    db.session.add(case_decision_log)
db.session.commit()
