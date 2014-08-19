#!venv/bin/python

import os
import sys
from backend import app
from backend.core import db
import backend.engine as engine


def create():
    db.create_all()


def server():
    # engine.init()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='127.0.0.1', port=port, debug=app.config['DEBUG'])

if __name__ == "__main__":
    cmd = sys.argv[1]

    if cmd == "server":
        server()
    elif cmd == "create_db":
        create()
    else:
        print "Nothing to do"
