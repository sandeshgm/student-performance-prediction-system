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


def evaluate_model(X_train, y_train, X_eval, y_eval, max_depth=8):
    eval_model = DecisionTree(max_depth=max_depth)
    eval_model.fit(X_train, y_train)

    raw_predictions = eval_model.predict(X_eval)
    y_pred = np.array([prediction[0] for prediction in raw_predictions])

    correct = int(np.sum(y_pred == y_eval))
    total_eval = len(y_eval)
    accuracy = correct / total_eval if total_eval else 0
    cm = confusion_matrix(y_eval, y_pred, LABELS)

    return {
        "eval_samples": total_eval,
        "correct_predictions": correct,
        "accuracy": round(float(accuracy), 4),
        "accuracy_percent": round(float(accuracy * 100), 2),
        "confusion_matrix": cm.tolist(),
        "labels": LABELS,
    }


def choose_best_depth(X, y):
    X_train, X_val, y_train, y_val = stratified_train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    best_depth = DEPTH_OPTIONS[0]
    best_metrics = evaluate_model(X_train, y_train, X_val, y_val, max_depth=best_depth)

    print("Selecting tree depth on a validation split:")
    for depth in DEPTH_OPTIONS:
        metrics = evaluate_model(X_train, y_train, X_val, y_val, max_depth=depth)
        print(f"  depth={depth} -> {metrics['accuracy_percent']}%")

        if metrics["accuracy"] > best_metrics["accuracy"]:
            best_metrics = metrics
            best_depth = depth

    return best_depth, best_metrics


data = pd.read_csv(dataset_path)
X = data.iloc[:, :-1].values
y = data.iloc[:, -1].values

X_trainval, X_test, y_trainval, y_test = stratified_train_test_split(
    X, y, test_size=0.2, random_state=0
)
max_depth, val_metrics = choose_best_depth(X_trainval, y_trainval)
test_metrics = evaluate_model(
    X_trainval, y_trainval, X_test, y_test, max_depth=max_depth
)

print("\n========== Model Accuracy Report ==========")
print("Dataset: synthetic, labels with weight-controlled feature overlap")
print(f"Best Max Depth (chosen on validation): {max_depth}")
print(f"Validation accuracy: {val_metrics['accuracy_percent']}%")
print(f"Held-out test accuracy: {test_metrics['accuracy_percent']}%")
print(
    f"Correct Predictions: {test_metrics['correct_predictions']} / {test_metrics['eval_samples']}"
)
print(f"Train+val samples: {len(y_trainval)}")
print(f"Test samples: {test_metrics['eval_samples']}")
print("\nConfusion Matrix (rows=actual, cols=predicted)")
print("Labels:", LABELS)
for row in test_metrics["confusion_matrix"]:
    print(" ", row)
print("===========================================\n")

accuracy_report = {
    "algorithm": "Decision Tree (from scratch)",
    "dataset_type": "synthetic",
    "labeling": "class_conditional_with_weight_controlled_overlap",
    "max_depth": max_depth,
    "dataset_path": "dataset.csv",
    "total_samples": int(len(y)),
    "train_samples": int(len(y_trainval) - val_metrics["eval_samples"]),
    "validation_samples": int(val_metrics["eval_samples"]),
    "test_samples": int(test_metrics["eval_samples"]),
    "validation_accuracy_percent": val_metrics["accuracy_percent"],
    "test_accuracy": test_metrics["accuracy"],
    "test_accuracy_percent": test_metrics["accuracy_percent"],
    "correct_predictions": test_metrics["correct_predictions"],
    "confusion_matrix": test_metrics["confusion_matrix"],
    "labels": LABELS,
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
with open(model_importance_path, "w", encoding="utf-8") as file:
    json.dump(importance_dict, file, indent=4)

print("Model's learned feature importances saved to model_importance.json")

importance_path = os.path.join(script_dir, "importance.json")
if not os.path.exists(importance_path):
    with open(importance_path, "w", encoding="utf-8") as file:
        json.dump(importance_dict, file, indent=4)
    print("Initial feature importances saved to importance.json")
else:
    print("Preserved existing user-configured weights in importance.json")
