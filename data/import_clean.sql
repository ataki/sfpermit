use test;

load data local infile "./clean.csv"
into table sfp_permit
fields terminated by ","
optionally enclosed by '"'
lines terminated by "\n"
(
	id,
	case_number,
	total_records_by_case,
	project_name,
	net_units,
	block_lot,
	min_filed,
	max_action,
	allowed_height,
	plan_area,
	case_decision_date,
	case_decision,
	q4_report_status,
	last_planning_suffix,
	last_planning_action,
	days,
	er_complete,
	er_interim,
	c,
	v,
	x,
	d,
	bp,
	r,
	total,
	diff,
	multiple,
	cancelled_planning,
	cancelled_bp,
	in_current_planning,
	bp_reinstated,
	bp_issued,
	occupancy_permit,
	planning_approved,
	case_in_q4_report,
	blocklot_in_q4_report,
	in_q4_report,
	missing_data,
	case_year,
	filing_year,
	action_year,
	notes,
	more,
	manual_exclusion,
	qc_check_against_quarterly,
	possible_false_negative,
	overridden_date,
	unitgrp,
	hgrp1,
	hgrp2,
	m,
	ydiff,
	unitgrp2,
  longitude,
  latitude
);