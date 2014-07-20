What
----------------

Bayes Impact SF Peromits Project.

Installation
----------------

Target: Mac OSX, 10.8+

You should have virtualenv installed. If not, do:

	(sudo) pip install virtualenv

Activate using

	source venv/bin/activate
  
Finally, to make sure you're up to date with project dependencies, do:

	pip install -r requirements.txt

and

	cd static && bower update

Getting Started
-------------------

Run

	make db

to create the test database from the dataset in /data.

Run

	make dev

in a separate shell to compile the main css file and run a watcher.

Then 
	
	make serve

to run the server. Go to ```http://localhost:5000``` to see the page.

/static contains js and less dependencies. Start there for the web app work.

server.py contains a prototpyed api endpoint for now.

/templates contains server-side templates (and may include client-side
in the future).

Overview
----------------

We use Flask to serve stuff. Check out its documentation here[http://flask.pocoo.org/docs/].

Bower is used to manage static assets. 

TODOs
-------------------

v0.1

  - Upload of data
  - Geo-visualization of permits
  - permit update form
  - permit creation form
