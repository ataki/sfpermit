db:
	@echo "Set up the database..."
	@python run.py create_db
	@python -m data.import
	python -m data.pull_geolocations
	@echo "Done creating db"

serve:
	@echo "Start test server..."
	@./run.py server

dev:
	@echo "Recompile CSS dynamically..."
	@node webapp/lesswatcher.js
