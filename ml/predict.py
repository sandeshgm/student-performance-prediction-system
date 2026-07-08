import os
import sys
import numpy as np
import pickle

# Resolve model path relative to this script's directory
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, "model.pkl")

# LOAD MODEL
try:
    with open(model_path, "rb") as f:
        model = pickle.load(f)
except FileNotFoundError:
    print("Error: model.pkl not found. Please run ml/train.py first.", file=sys.stderr)
    sys.exit(1)

# Check if arguments are passed from Node/CLI
if len(sys.argv) >= 7:
    try:
        # Features: attendance, gpa, internal, assignment, terminal, behaviour
        features = [float(x) for x in sys.argv[1:7]]
        student = np.array([features])
    except ValueError:
        print("Error: Invalid feature arguments. Must be numbers.", file=sys.stderr)
        sys.exit(1)
else:
    # SAMPLE STUDENT (fallback)
    student = np.array([[85, 3.5, 80, 90, 88, 90]])

prediction = model.predict(student)

# Print prediction class and confidence to stdout in Prediction,Confidence format
pred_val, pred_conf = prediction[0]
print(f"{pred_val},{pred_conf:.2f}")