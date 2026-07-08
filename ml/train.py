import numpy as np
import pandas as pd
from decision_tree import DecisionTree

# LOAD DATA
data = pd.read_csv("dataset.csv")

# Example dataset columns:
# attendance, gpa, internal, assignment, terminal, behaviour, performance

X = data.iloc[:, :-1].values
y = data.iloc[:, -1].values

# TRAIN MODEL
model = DecisionTree(max_depth=5)
model.fit(X, y)

print("Model trained successfully")

import os
import pickle

script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, "model.pkl")

with open(model_path, "wb") as f:
    pickle.dump(model, f)