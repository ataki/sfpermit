db:
	@echo "Set up the database..."
	@python run.py create_db
	@python -m data.import
	@echo "Pulling geolocations for permits"
	python -m data.pull_geolocations
	@echo "Creating initial logs"
	python -m data.create_initial_logs
	@echo "Seeding comments"
	python -m data.seed_comments
	@echo "Seeding superusers"
	python -m data.seed_users
	@echo "##########################"
	@echo "Done creating db"

server:
	@echo "Start test server..."
	@./run.py server

assets:
	@echo "Optimizing with r.js..."
	@cd webapp && r.js -o build.js
	@echo "##########################"
	@echo "Done. Output in webapp/dist/app.build.js"

devstack:
	@echo "Recompile CSS dynamically..."
	@node webapp/lesswatcher.js

deploy:
	make assets
	cp webapp/index.css webapp/dist/index.css
	git add webapp/dist
	git commit -m "Update assets for deployment"
	git push heroku master
