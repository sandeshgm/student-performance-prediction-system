import pandas as pd
import numpy as np

# Set random seed for reproducibility
np.random.seed(42)

# Generate 1000 synthetic student records
n_samples = 1000

attendance = np.random.randint(20, 100, n_samples)
gpa = np.round(np.random.uniform(0.0, 4.0, n_samples), 2)
internal = np.random.randint(10, 100, n_samples)
assignment = np.random.randint(10, 100, n_samples)
terminal = np.random.randint(10, 100, n_samples)
behaviour = np.random.randint(20, 100, n_samples)

# Simple custom logic to determine target performance class
# based on features with some noise
performance = []
for i in range(n_samples):
    # Calculate a composite score out of 100
    score = (internal[i] + assignment[i] + terminal[i]) / 3 * 0.6 + attendance[i] * 0.2 + behaviour[i] * 0.1 + (gpa[i] / 4.0 * 100) * 0.1
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

df.to_csv("dataset.csv", index=False)
print("Synthetic dataset generated and saved to dataset.csv")
