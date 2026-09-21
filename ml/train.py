import json
import os
import pickle

import numpy as np
import pandas as pd
from decision_tree import DecisionTree

script_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(script_dir)
dataset_path = os.path.join(root_dir, "dataset.csv")

LABELS = ["Excellent", "Good", "Average", "Poor"]
DEPTH_OPTIONS = [6, 7, 8, 9, 10]


def stratified_train_test_split(X, y, test_size=0.2, random_state=42):
    np.random.seed(random_state)
    train_idx = []
    test_idx = []

    for label in LABELS:
        label_indices = np.where(y == label)[0]
        np.random.shuffle(label_indices)
        split = int(len(label_indices) * (1 - test_size))
        train_idx.extend(label_indices[:split])
        test_idx.extend(label_indices[split:])

    return X[train_idx], X[test_idx], y[train_idx], y[test_idx]


def confusion_matrix(y_true, y_pred, labels):
    size = len(labels)
    matrix = np.zeros((size, size), dtype=int)
    label_index = {label: index for index, label in enumerate(labels)}

    for true_label, pred_label in zip(y_true, y_pred):
        matrix[label_index[true_label], label_index[pred_label]] += 1

    return matrix


def evaluate_model(X, y, max_depth=8):
    X_train, X_test, y_train, y_test = stratified_train_test_split(X, y)

    eval_model = DecisionTree(max_depth=max_depth)
    eval_model.fit(X_train, y_train)

    raw_predictions = eval_model.predict(X_test)
    y_pred = np.array([prediction[0] for prediction in raw_predictions])

    correct = int(np.sum(y_pred == y_test))
    total_test = len(y_test)
    accuracy = correct / total_test if total_test else 0
    cm = confusion_matrix(y_test, y_pred, LABELS)

    return {
        "train_samples": int(len(y_train)),
        "test_samples": total_test,
        "correct_predictions": correct,
        "test_accuracy": round(float(accuracy), 4),
        "test_accuracy_percent": round(float(accuracy * 100), 2),
        "confusion_matrix": cm.tolist(),
        "labels": LABELS,
    }


def choose_best_depth(X, y):
    best_depth = DEPTH_OPTIONS[0]
    best_metrics = evaluate_model(X, y, max_depth=best_depth)

    print("Testing tree depths:")
    for depth in DEPTH_OPTIONS:
        metrics = evaluate_model(X, y, max_depth=depth)
        print(f"  depth={depth} -> {metrics['test_accuracy_percent']}%")

        if metrics["test_accuracy"] > best_metrics["test_accuracy"]:
            best_metrics = metrics
            best_depth = depth

    return best_depth, best_metrics


data = pd.read_csv(dataset_path)
X = data.iloc[:, :-1].values
y = data.iloc[:, -1].values

max_depth, metrics = choose_best_depth(X, y)

print("\n========== Model Accuracy Report ==========")
print(f"Best Max Depth: {max_depth}")
print(f"Test Accuracy Rate: {metrics['test_accuracy_percent']}%")
print(
    f"Correct Predictions: {metrics['correct_predictions']} / {metrics['test_samples']}"
)
print(f"Train samples: {metrics['train_samples']}")
print(f"Test samples: {metrics['test_samples']}")
print("\nConfusion Matrix (rows=actual, cols=predicted)")
print("Labels:", LABELS)
for row in metrics["confusion_matrix"]:
    print(" ", row)
print("===========================================\n")

accuracy_report = {
    "algorithm": "Decision Tree (from scratch)",
    "max_depth": max_depth,
    "dataset_path": dataset_path,
    "total_samples": int(len(y)),
    **metrics,
}

accuracy_report_path = os.path.join(script_dir, "accuracy_report.json")
with open(accuracy_report_path, "w", encoding="utf-8") as file:
    json.dump(accuracy_report, file, indent=4)

print(f"Accuracy report saved to: {accuracy_report_path}\n")

model = DecisionTree(max_depth=max_depth)
model.fit(X, y)

print("Model trained successfully")

model_path = os.path.join(script_dir, "model.pkl")
with open(model_path, "wb") as file:
    pickle.dump(model, file)

feature_names = data.columns[:-1].tolist()
importances = model.get_feature_importances()
importance_dict = {
    name: int(round(value * 100))
    for name, value in zip(feature_names, importances)
}

model_importance_path = os.path.join(script_dir, "model_importance.json")
with open(model_importance_path, "w") as file:
    json.dump(importance_dict, file, indent=4)

print("Model's learned feature importances saved to model_importance.json")

importance_path = os.path.join(script_dir, "importance.json")
if not os.path.exists(importance_path):
    with open(importance_path, "w") as file:
        json.dump(importance_dict, file, indent=4)
    print("Initial feature importances saved to importance.json")
else:
    print("Preserved existing user-configured weights in importance.json")
