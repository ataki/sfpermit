db:
	@echo "Set up the database..."
	mysql test < import_clean.sql
	python -m data.pull_geolocations

serve:
	@echo "Start test server..."
	@./run.py server

dev:
	@echo "Recompile CSS dynamically..."
	@node webapp/lesswatcher.js
