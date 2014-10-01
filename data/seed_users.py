from backend.models import *

u1 = User(
    username="bayesimpact", 
    email="admin@bayesimpact.org", 
    password="koala.bear.duo",
    active=True)
db.session.add(u1)
db.session.commit()