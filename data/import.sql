use test;

load data local infile "data/data.csv"
into table sfp_permit 
fields terminated by ","
optionally enclosed by '"'
lines terminated by "\n"
ignore 1 lines
(
	case_number,
	total_records_by_case,
	project_name,
	net_units,
	block_lot,
	@min_filed,
	@max_action,
	allowed_height,
	plan_area,
	@case_decision_date,
	case_decision,
	q4_report_status,
	last_planning_suffix,
	last_planning_action,
	days,
	er_complete,
	er_interim,
	er_open,
	cat_ex_32,
	cpe,
	neg_dec,
	eir,
	e,
	c,
	v,
	x,
	d,
	a,
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
	final_status,
	case_year,
	filing_year,
	action_year,
	should_be,
	reason,
	project_size_class
)
set 
	min_filed = STR_TO_DATE(@min_filed, "%m/%d/%Y %H:%M"),
	max_action = STR_TO_DATE(@max_action, "%m/%d/%Y %H:%M"),
	case_decision_date = STR_TO_DATE(@case_decision_date, "%m/%d/%Y %H:%M");
