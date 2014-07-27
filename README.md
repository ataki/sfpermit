README is a work in progress. 
Author: Jim Zheng

# What

Bayes Impact SF Permits Project.


# Prerequisite

    Macbook Pro

    Python 2.7+ (with pip)

    MySQL

    NodeJS

    Brew


# Installation

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


# Populating the database

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

If you want to compile to CSS, do

  node webapp/lesswatcher.js

This starts a watcher that recompiles as you save.


# Overview

/webapp contains js and less dependencies. Start there for the web app work.

routes.py contains a prototpyed api endpoint for now.

/templates contains server-side templates (and may include client-side
in the future).

We use Flask to serve stuff. Check out its documentation here[http://flask.pocoo.org/docs/].

Bower is used to manage static assets. 

LESS is used to style things; it gets compiled using CSS. You need to

Use virtualenv to keep things reusable. 