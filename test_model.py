from backend import *
from backend.engine import *
import time as time
import backend.preprocess_data as process
import backend.model_params as params
import backend.eng as eng

def main():
    examples = [x for x in getExamples()]
    data = process.parse_points(examples)
    filtered_data = process.filter_data(data=data)
    scoring = params.get_scoring()
    cat_features = params.get_features()
    # Gen response field, open/closed case indices
    response = process.gen_response(data=data)
    train_idx, open_idx = process.open_closed_split(data)
    # Construct Design Matrix
    design_matrix = process.engineer_features(data=data, 
                                              cat_features = cat_features)
    # Split design matrix into currently open and training data
    train_data = design_matrix.loc[train_idx]
    train_response = response[train_idx]
    open_cases = design_matrix.loc[open_idx]
    # Train Model
    model, score = fit_model(train_data=train_data,
                      response=train_response,
                      pred_data=open_cases,
                      scoring = scoring)

    prediction = predict(model, open_cases)
    log = open("model_score.txt", "w")
    timestring = str(time.strftime("%m/%d/%Y %H:%M:%S"))
    string = 'Model {2} Score at {0} = {1}'.format(timestring,
                                                   score,
                                                   scoring)
    log.write(string)
    log.close()

def test_engine():
    eng.init()

if __name__ == '__main__':
	main()
