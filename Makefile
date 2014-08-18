db:
	@echo "Set up the database..."
	@python run.py create_db
	mysql test < data/import.sql
	python -m data.pull_geolocations

serve:
	@echo "Start test server..."
	@./run.py server

dev:
	@echo "Recompile CSS dynamically..."
	@node webapp/lesswatcher.js
