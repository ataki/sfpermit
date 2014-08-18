import preprocess_data as process
from scipy import *
from backend.models import *
from sklearn.linear_model import LogisticRegression
from sklearn.grid_search import GridSearchCV


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


def getExamples():
    return Permit.query.all()


def fit_model(train_data, response, pred_data):
    param_grid = {'C': [x * .1 for x in range(1, 100)],
                  'penalty': ['l1', 'l2']}
    logit = LogisticRegression(fit_intercept=True)
    opt_model = GridSearchCV(logit, param_grid,
                             scoring='precision', cv=10, n_jobs=-1)
    # Hack: drop nan rows for now.
    train_data = train_data.drop(0)
    response = response.drop(1)
    opt_model.fit(X=train_data, y=response)
    return opt_model


def predict(model, newdata):
    return model.predict_proba(X=newdata)[:, 1]


def insert_pred(prediction, id):
    permit = Permit.query.get(id)
    print "predicting " + str(permit)
    permit.prediction = prediction
    db.session.add(permit)
    db.session.commit()


def train(data):
    # Gen response field, open/closed case indices
    response = process.gen_response(data=data)
    train_idx, open_idx = process.open_closed_split(data)
    # Construct Design Matrix
    design_matrix = process.engineer_features(data=data)
    # Split design matrix into currently open and training data
    train_data = design_matrix.loc[train_idx]
    train_response = response[train_idx]
    open_cases = design_matrix.loc[open_idx]
    # Train Model
    model = fit_model(train_data=train_data,
                      response=train_response,
                      pred_data=open_cases)
    prediction = predict(model, open_cases)
    # Insert predicted probabiliesies
    for pred, idx in zip(prediction, open_cases.index):
        insert_pred(pred, idx)


def init():
    examples = [x for x in getExamples()]
    data = process.parse_points(examples)
    # filtered_data = process.filter_data(data=data)
    train(data)
