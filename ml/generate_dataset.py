import json
import os

import numpy as np
import pandas as pd

np.random.seed(42)

script_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(script_dir)
importance_path = os.path.join(script_dir, "importance.json")
dataset_path = os.path.join(root_dir, "dataset.csv")

DEFAULT_WEIGHTS = {
    "attendance": 1,
    "gpa": 1,
    "internal": 1,
    "assignment": 1,
    "terminal": 1,
    "behaviour": 1,
}

weights = dict(DEFAULT_WEIGHTS)
if os.path.exists(importance_path):
    try:
        with open(importance_path, "r", encoding="utf-8") as file:
            loaded = json.load(file)
        for key in DEFAULT_WEIGHTS:
            if key in loaded and isinstance(loaded[key], (int, float)) and loaded[key] >= 0:
                weights[key] = float(loaded[key])
        print(f"Using feature weights from importance.json: {weights}")
    except Exception as error:
        print(f"Error loading importance.json: {error}. Using equal weights.")
else:
    print("No importance.json found. Using equal weights.")

if sum(weights.values()) <= 0:
    weights = dict(DEFAULT_WEIGHTS)

LABELS = ["Excellent", "Good", "Average", "Poor"]
SAMPLES_PER_CLASS = 750

# Class-conditional centers. High-weight features get a small std (separable);
# low-weight features get a large std (overlap), so the tree must follow the
# admin-configured weights instead of treating every column equally.
CLASS_CENTERS = {
    "Excellent": {
        "attendance": 88,
        "gpa": 3.52,
        "internal": 85,
        "assignment": 86,
        "terminal": 83,
        "behaviour": 86,
    },
    "Good": {
        "attendance": 74,
        "gpa": 2.95,
        "internal": 70,
        "assignment": 72,
        "terminal": 68,
        "behaviour": 72,
    },
    "Average": {
        "attendance": 60,
        "gpa": 2.28,
        "internal": 54,
        "assignment": 56,
        "terminal": 52,
        "behaviour": 58,
    },
    "Poor": {
        "attendance": 44,
        "gpa": 1.58,
        "internal": 36,
        "assignment": 38,
        "terminal": 36,
        "behaviour": 42,
    },
}

FEATURE_SCALE = {
    "attendance": (6.0, 16.0, 0, 100, True),
    "gpa": (0.20, 0.58, 0, 4, False),
    "internal": (6.0, 16.0, 0, 100, True),
    "assignment": (6.0, 16.0, 0, 100, True),
    "terminal": (6.0, 16.0, 0, 100, True),
    "behaviour": (6.0, 15.0, 0, 100, True),
}


def feature_std(name):
    min_std, max_std, *_rest = FEATURE_SCALE[name]
    peak = max(weights.values()) or 1
    relative = min(1.0, weights[name] / peak)
    return max_std - (max_std - min_std) * relative


def sample_value(name, center):
    _min_std, _max_std, low, high, as_int = FEATURE_SCALE[name]
    std = feature_std(name)
    value = np.clip(np.random.normal(center, std), low, high)
    return int(round(value)) if as_int else round(float(value), 2)


records = []

for label in LABELS:
    centers = CLASS_CENTERS[label]
    for _ in range(SAMPLES_PER_CLASS):
        records.append(
            {
                "attendance": sample_value("attendance", centers["attendance"]),
                "gpa": sample_value("gpa", centers["gpa"]),
                "internal": sample_value("internal", centers["internal"]),
                "assignment": sample_value("assignment", centers["assignment"]),
                "terminal": sample_value("terminal", centers["terminal"]),
                "behaviour": sample_value("behaviour", centers["behaviour"]),
                "performance": label,
            }
        )

df = pd.DataFrame(records)

adjacent = {
    "Excellent": ["Good"],
    "Good": ["Excellent", "Average"],
    "Average": ["Good", "Poor"],
    "Poor": ["Average"],
}

for index in df.index:
    if np.random.random() < 0.07:
        df.at[index, "performance"] = np.random.choice(adjacent[df.at[index, "performance"]])

df = df.sample(frac=1, random_state=42).reset_index(drop=True)
df.to_csv(dataset_path, index=False)

print(f"Synthetic dataset generated with weight-controlled overlap and saved to {dataset_path}")
print(f"Total rows: {len(df)}")
print("Class distribution:")
print(df["performance"].value_counts().to_string())
print("Per-feature sampling std (lower = more important):")
for name in DEFAULT_WEIGHTS:
    print(f"  {name}: weight={weights[name]:g}, std={feature_std(name):.2f}")
