import json
import os

import numpy as np
import pandas as pd

np.random.seed(42)

script_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(script_dir)
importance_path = os.path.join(script_dir, "importance.json")
dataset_path = os.path.join(root_dir, "dataset.csv")

weights = {}
if os.path.exists(importance_path):
    try:
        with open(importance_path, "r") as file:
            weights = json.load(file)
        print(f"Loaded custom weights from importance.json: {weights}")
    except Exception as error:
        print(f"Error loading importance.json: {error}. Using defaults.")

LABELS = ["Excellent", "Good", "Average", "Poor"]
SAMPLES_PER_CLASS = 750

# Feature ranges per class so labels are learnable but still realistic.
CLASS_PROFILES = {
    "Excellent": {
        "attendance": (88, 100),
        "gpa": (3.2, 4.0),
        "internal": (78, 100),
        "assignment": (80, 100),
        "terminal": (75, 100),
        "behaviour": (82, 100),
    },
    "Good": {
        "attendance": (75, 95),
        "gpa": (2.8, 3.8),
        "internal": (65, 88),
        "assignment": (68, 90),
        "terminal": (60, 85),
        "behaviour": (70, 92),
    },
    "Average": {
        "attendance": (60, 82),
        "gpa": (2.0, 3.2),
        "internal": (45, 72),
        "assignment": (48, 75),
        "terminal": (40, 70),
        "behaviour": (50, 78),
    },
    "Poor": {
        "attendance": (20, 65),
        "gpa": (0.0, 2.4),
        "internal": (10, 55),
        "assignment": (10, 50),
        "terminal": (10, 45),
        "behaviour": (20, 55),
    },
}


def random_in_range(low, high, as_int=True):
    value = np.random.uniform(low, high)
    return int(round(value)) if as_int else round(float(value), 2)


records = []

for label in LABELS:
    profile = CLASS_PROFILES[label]

    for _ in range(SAMPLES_PER_CLASS):
        attendance = int(
            np.clip(random_in_range(*profile["attendance"]) + np.random.normal(0, 4), 0, 100)
        )
        gpa = round(
            float(np.clip(random_in_range(*profile["gpa"], as_int=False) + np.random.normal(0, 0.15), 0, 4)),
            2,
        )
        internal = int(
            np.clip(random_in_range(*profile["internal"]) + np.random.normal(0, 4), 0, 100)
        )
        assignment = int(
            np.clip(random_in_range(*profile["assignment"]) + np.random.normal(0, 4), 0, 100)
        )
        terminal = int(
            np.clip(random_in_range(*profile["terminal"]) + np.random.normal(0, 4), 0, 100)
        )
        behaviour = int(
            np.clip(random_in_range(*profile["behaviour"]) + np.random.normal(0, 4), 0, 100)
        )

        records.append(
            {
                "attendance": attendance,
                "gpa": gpa,
                "internal": internal,
                "assignment": assignment,
                "terminal": terminal,
                "behaviour": behaviour,
                "performance": label,
            }
        )

df = pd.DataFrame(records)
df = df.sample(frac=1, random_state=42).reset_index(drop=True)
df.to_csv(dataset_path, index=False)

print(f"Synthetic dataset generated and saved to {dataset_path}")
print(f"Total rows: {len(df)}")
print("Class distribution:")
print(df["performance"].value_counts().to_string())
