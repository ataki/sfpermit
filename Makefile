db:
	@echo "Set up the database..."
	python process.py

serve:
	@echo "Start test server..."
	python server.py

dev:
	@echo "Recompile CSS dynamically..."
	node static/watcher.js
