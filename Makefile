db:
	@echo "Set up the database..."
	@python run.py create_db
	@python -m data.import
	python -m data.pull_geolocations
	@echo "##########################"
	@echo "Done creating db"

serve:
	@echo "Start test server..."
	@./run.py server

assets:
	@echo "Optimizing with r.js..."
	r.js -o webapp/build.js
	@echo "##########################"
	@echo "Done. Output in webapp/dist/app.build.js"

dev:
	@echo "Recompile CSS dynamically..."
	@node webapp/lesswatcher.js
