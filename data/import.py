import csv
from datetime import datetime
from backend.models import *

print "Deleting all users"
User.query.delete()

with open("data/data.csv") as csvfile:
    reader = csv.reader(csvfile, quotechar='"', delimiter=',')
    colNames = reader.next()
    for row in reader:
        permit = Permit(
            case_number=row[0],
            total_records_by_case=int(row[1]),
            project_name=row[2],
            net_units=int(row[3]),
            block_lot=row[4],
            min_filed=datetime.strptime(row[5], "%m/%d/%Y") if row[5] != '' else None,
            max_action=datetime.strptime(row[6], "%m/%d/%Y") if row[6] != '' else None,
            allowed_height=float(row[7]) if row[7] != '#N/A' else -1,
            plan_area=int(row[8]) if row[8] != '#N/A' else -1,
            case_decision_date=datetime.strptime(row[9], "%m/%d/%Y") if row[9] != '' else None,
            case_decision=row[10],
            q4_report_status=row[11],
            last_planning_suffix=row[12],
            last_planning_action=row[13],
            days=int(row[14]),
            er_complete=int(row[15]),
            er_interim=int(row[16]),
            er_open=int(row[17]),
            cat_ex_32=int(row[18]),
            cpe=int(row[19]),
            neg_dec=int(row[20]),
            eir=int(row[21]),
            e=int(row[22]),
            c=int(row[23]),
            v=int(row[24]),
            x=int(row[25]),
            d=int(row[26]),
            a=int(row[27]),
            r=int(row[28]),
            total=int(row[29]),
            diff=int(row[30]),
            multiple=int(row[31]),
            cancelled_planning=int(row[32]),
            cancelled_bp=int(row[33]),
            in_current_planning=int(row[34]),
            bp_reinstated=int(row[35]),
            bp_issued=int(row[36]),
            occupancy_permit=int(row[37]),
            planning_approved=int(row[38]),
            case_in_q4_report=int(row[39]),
            blocklot_in_q4_report=int(row[40]),
            in_q4_report=int(row[41]),
            missing_data=int(row[42]),
            final_status=row[43],
            case_year=int(row[44]),
            filing_year=int(row[45]),
            action_year=int(row[46]) if row[46] != '' else None,
            should_be=row[47],
            reason=row[48],
            project_size_class=row[49]
        )
        db.session.add(permit)
    db.session.commit()
