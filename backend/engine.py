import numpy as np
from scipy import *
from backend.models import *

"""
Starter sample file for how I'm
imagining training will go.

The init() method is called by the server
on start-up. Train the initial model,
or load a trained file from local
filesystem.

train() is called when a new sample
or some samples are added to the DB.
It's used to train/retrain the model.

predict() is used to classify an example.
It takes a Permit Model object and returns
the likelihood of approval.

"""


# Model used
model = None


def getExamples():
    return Permit.query.all()


def init():
    examples = [x for x in getExamples()]
    train(examples)
    return None


def train():
    global model
    pass


def predict(example):
    global model
    pass
