import pandas as pd
import numpy as np
import datetime as dt
from collections import defaultdict
from backend.models import *


def parse_points(points, features=None):
    if features is None:
        features = ['final_status',
                    'min_filed',
                    'net_units',
                    'project_name',
                    'planning_approved',
                    'Days',
                    'c',
                    'v',
                    'x',
                    'd',
                    'a',
                    'r']

    feature_map = defaultdict(list)
    index = []
    for point in points:
        index.append(point.id)
        for feat in features:
            feature_map[feat].append(x[feat])
    df = pd.DataFrame(feature_map, index=index)
    return df


def filter_data(data):
    data = data[pd.isnull(rawdata['final_status']) == False]
    data['min_filed'] = pd.to_datetime(data['min_filed'])
    data = data.groupby('project_name').filter(lambda x: len(x) == 1)
    data = data.dropna(axis=0)
    data = data[data['net_units'] < np.percentile(data['net_units'], 99.3)]
    data = data.reset_index()
    return data


def gen_response(data):
    response = np.logical_and(
        data['final_status'] == 'Approved',
        data['planning_approved'] == 1
    )
    return response


def _make_time_features(data):
    date = dt.date.today()
    diff = np.array([(date - dt.date(D.year, D.month, D.day)).days
                     for D in data['min_filed']])
    days = np.array(data['days'])
    open_idxs = np.array(data['final_status'] == 'Open')
    days[open_idxs] = diff[open_idxs]
    cats = {}
    for semiannual in [183*x for x in range(6)]:
        cat = np.array(map(lambda x: int(x > semiannual), days))
        cats['cum_days_' + str(semiannual)] = cat
    df = pd.DataFrame(cats).iloc[:, 1:]
    return df


def _make_units_feature(data):
    data['net_units_group'] = pd.cut(
        data['net_units'],
        [0, 1, 10, 40, 80, np.inf],
        labels=False)
    return data


CATEGORY_FEATURES = ['net_units_group', 'c', 'v', 'x', 'd', 'a', 'r']


def engineer_features(data):
    base = _make_time_features(data)
    data = _make_units_feature(data)
    for catfeature in CATEGORY_FEATURES:
        dummies = pd.get_dummies(data[catfeature], prefix=catfeature + '_')
        base = base.join(dummies.iloc[:, 1:])
    dm = pd.DataFrame(base)
    return dm


def open_closed_split(data):
    # Cases to be predicted for:
    train_idx = np.array(data['final_status'] != 'Open')
    open_idx = np.array(data['final_status'] == 'Open')
    return train_idx, open_idx
