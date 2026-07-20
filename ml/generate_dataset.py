import pandas as pd
import numpy as np
import os
import json

# Set random seed for reproducibility
np.random.seed(42)

# Resolve importance.json path
script_dir = os.path.dirname(os.path.abspath(__file__))
importance_path = os.path.join(script_dir, "importance.json")

# Load weights from importance.json if available
weights = {}
if os.path.exists(importance_path):
    try:
        with open(importance_path, "r") as f:
            weights = json.load(f)
        print(f"Loaded custom weights from importance.json: {weights}")
    except Exception as e:
        print(f"Error loading importance.json: {e}. Using defaults.")

# Extract weights with default fallbacks
w_attendance = weights.get("attendance", 14)
w_gpa = weights.get("gpa", 26)
w_internal = weights.get("internal", 19)
w_assignment = weights.get("assignment", 29)
w_terminal = weights.get("terminal", 2)
w_behaviour = weights.get("behaviour", 11)

total_weight = w_attendance + w_gpa + w_internal + w_assignment + w_terminal + w_behaviour
if total_weight == 0:
    total_weight = 100
    w_attendance = 14
    w_gpa = 26
    w_internal = 19
    w_assignment = 29
    w_terminal = 2
    w_behaviour = 11

# Generate 1000 synthetic student records
n_samples = 1000

attendance = np.random.randint(20, 100, n_samples)
gpa = np.round(np.random.uniform(0.0, 4.0, n_samples), 2)
internal = np.random.randint(10, 100, n_samples)
assignment = np.random.randint(10, 100, n_samples)
terminal = np.random.randint(10, 100, n_samples)
behaviour = np.random.randint(20, 100, n_samples)

# Logic to determine target performance class based on custom weights
performance = []
for i in range(n_samples):
    # Calculate a composite score out of 100
    score = (
        attendance[i] * w_attendance +
        (gpa[i] / 4.0 * 100) * w_gpa +
        internal[i] * w_internal +
        assignment[i] * w_assignment +
        terminal[i] * w_terminal +
        behaviour[i] * w_behaviour
    ) / total_weight

    # Add minor noise
    score += np.random.normal(0, 3)
    
    if score >= 85:
        performance.append("Excellent")
    elif score >= 70:
        performance.append("Good")
    elif score >= 50:
        performance.append("Average")
    else:
        performance.append("Poor")

df = pd.DataFrame({
    'attendance': attendance,
    'gpa': gpa,
    'internal': internal,
    'assignment': assignment,
    'terminal': terminal,
    'behaviour': behaviour,
    'performance': performance
})

# Save to dataset.csv in root folder
root_dir = os.path.dirname(script_dir)
dataset_path = os.path.join(root_dir, "dataset.csv")
df.to_csv(dataset_path, index=False)
print(f"Synthetic dataset generated and saved to {dataset_path}")

