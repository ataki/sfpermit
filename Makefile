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
	@cd webapp && r.js -o build.js
	@echo "##########################"
	@echo "Done. Output in webapp/dist/app.build.js"

dev:
	@echo "Recompile CSS dynamically..."
	@node webapp/lesswatcher.js

deploy:
	make assets
	cp webapp/index.css dist/index.css
	git add webapp/dist
	git commit -m "Update assets for deployment"
	git push heroku master
