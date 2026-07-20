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

# SAVE FEATURE IMPORTANCES
import json
feature_names = data.columns[:-1].tolist()
importances = model.get_feature_importances()
importance_dict = {name: int(round(imp * 100)) for name, imp in zip(feature_names, importances)}

# Save model's learned feature importances separately
model_importance_path = os.path.join(script_dir, "model_importance.json")
with open(model_importance_path, "w") as f:
    json.dump(importance_dict, f, indent=4)
print("Model's learned feature importances saved to model_importance.json")

# Only write default/computed importances to importance.json if it does not exist yet
importance_path = os.path.join(script_dir, "importance.json")
if not os.path.exists(importance_path):
    with open(importance_path, "w") as f:
        json.dump(importance_dict, f, indent=4)
    print("Initial feature importances saved to importance.json")
else:
    print("Preserved existing user-configured weights in importance.json")