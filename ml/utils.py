import numpy as np


def entropy(y):
    values, counts = np.unique(y, return_counts=True)
    probs = counts / counts.sum()
    return -np.sum(probs * np.log2(probs))


def split_dataset(X, y, feature_index, threshold):
    left_mask = X[:, feature_index] <= threshold
    right_mask = X[:, feature_index] > threshold

    return X[left_mask], X[right_mask], y[left_mask], y[right_mask]


def information_gain(y, y_left, y_right):
    parent_entropy = entropy(y)

    n = len(y)
    n_l, n_r = len(y_left), len(y_right)

    if n_l == 0 or n_r == 0:
        return 0

    child_entropy = (n_l / n) * entropy(y_left) + (n_r / n) * entropy(y_right)

    return parent_entropy - child_entropy