# SFPermits

Authors: Jim Zheng, Michael Kneier

Bayes Impact SF Permits Project.

Visualizes permits and predicts their chances of being approved.
Project available at http://sfpermits.herokuapp.com/

## Installation

You should have virtualenv installed. If not, do:

	(sudo) pip install virtualenv

To create a virtual environment, run in project root:

	virtualenv venv

Activate using:

	source venv/bin/activate

Finally, to make sure you're up to date with project dependencies, do:

	pip install -r requirements.txt

and

	cd webapp

	npm install

	bower install

## Populating the database

This assumes you have mysql. Install, preferably through brew.

Run

	make db

to create the test database from the dataset in /data.

Run

	make dev

in a separate shell to compile the main css file and run a watcher.

Then

	make serve

to run the server. Go to ```http://localhost:5000``` to see the page.

Run

	node webapp/lesswatcher.js

to create the CSS files and watch for LESS changes.

## Deploying

When deploying to Heroku, check the following:

- necessary css assets are in webapp/dist
- necessary built js assets are in webapp/dist
- config.py is configured to use Heroku settings
