db:
	@echo "Dropping previous db"
	mysql test -e "drop table if exists sfp_permit";
	@echo "Set up the database..."
	@python run.py create_db
	mysql test < data/import.sql
	python -m data.pull_geolocations
	@echo "Done creating db"

serve:
	@echo "Start test server..."
	@./run.py server

dev:
	@echo "Recompile CSS dynamically..."
	@node webapp/lesswatcher.js
