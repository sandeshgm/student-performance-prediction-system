import json
import os
import sys

import numpy as np
import pickle

script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, "model.pkl")

try:
    with open(model_path, "rb") as file:
        model = pickle.load(file)
except FileNotFoundError:
    print("Error: model.pkl not found. Please run ml/train.py first.", file=sys.stderr)
    sys.exit(1)


def parse_rows():
    if len(sys.argv) >= 7:
        try:
            values = [float(item) for item in sys.argv[1:]]
        except ValueError:
            print("Error: Invalid feature arguments. Must be numbers.", file=sys.stderr)
            sys.exit(1)

        if len(values) % 6 != 0:
            print("Error: Feature arguments must be groups of 6.", file=sys.stderr)
            sys.exit(1)

        return [values[index : index + 6] for index in range(0, len(values), 6)]

    raw = sys.stdin.read().strip()
    if raw:
        try:
            rows = json.loads(raw)
        except json.JSONDecodeError:
            print("Error: stdin must be a JSON array of feature rows.", file=sys.stderr)
            sys.exit(1)

        if not isinstance(rows, list) or not rows:
            print("Error: expected a non-empty JSON array of feature rows.", file=sys.stderr)
            sys.exit(1)

        return rows

    return [[85, 3.5, 80, 90, 88, 90]]


rows = parse_rows()
predictions = model.predict(np.array(rows, dtype=float))
payload = [
    [str(label), round(float(confidence), 4)] for label, confidence in predictions
]
print(json.dumps(payload))
