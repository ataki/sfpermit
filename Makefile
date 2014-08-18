db:
	@echo "Set up the database..."
	@python run.py create_db
	mysql test < data/import_observations.sql
	python -m data.pull_geolocations
	python -m data.get_final_statuses

serve:
	@echo "Start test server..."
	@./run.py server

dev:
	@echo "Recompile CSS dynamically..."
	@node webapp/lesswatcher.js
