from backend.models import *
from flask_security.utils import encrypt_password

with app.app_context():
    u1 = user_datastore.create_user(
        username="bayesimpact", 
        email="admin@bayesimpact.org", 
        password=encrypt_password("koala.bear.duo"),
        active=1
    )
    db.session.commit()