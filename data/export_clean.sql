select * from sfp_permit into outfile "~/clean.csv"
fields terminated by ","
enclosed by '"'
lines terminated by "\n"