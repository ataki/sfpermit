db:
	@echo "Set up the database..."
	mysql test < import_clean.sql

serve:
	@echo "Start test server..."
	@./run.py server

dev:
	@echo "Recompile CSS dynamically..."
	@node webapp/lesswatcher.js
