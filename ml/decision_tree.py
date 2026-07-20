import numpy as np
from node import Node
from utils import entropy, split_dataset, information_gain


class DecisionTree:

    def __init__(self, min_samples_split=2, max_depth=5):
        self.min_samples_split = min_samples_split
        self.max_depth = max_depth
        self.root = None

    def fit(self, X, y):
        self.n_features = X.shape[1]
        self.root = self._grow_tree(X, y, depth=0)


        

    def _grow_tree(self, X, y, depth):

        n_samples, n_features = X.shape
        n_labels = len(np.unique(y))

        # STOP CONDITIONS
        if (
            depth >= self.max_depth
            or n_labels == 1
            or n_samples < self.min_samples_split
        ):
            leaf_value, confidence = self._most_common_label_with_conf(y)
            return Node(value=leaf_value, confidence=confidence)

        best_feature, best_threshold, best_gain = None, None, -1
        best_splits = None

        # FIND BEST SPLIT
        for feature_index in range(n_features):
            thresholds = np.unique(X[:, feature_index])

            for threshold in thresholds:

                X_left, X_right, y_left, y_right = split_dataset(
                    X, y, feature_index, threshold
                )

                gain = information_gain(y, y_left, y_right)

                if gain > best_gain:
                    best_feature = feature_index
                    best_threshold = threshold
                    best_gain = gain
                    best_splits = (X_left, X_right, y_left, y_right)

        # IF NO GOOD SPLIT
        if best_gain == 0:
            leaf_value, confidence = self._most_common_label_with_conf(y)
            return Node(value=leaf_value, confidence=confidence)

        X_left, X_right, y_left, y_right = best_splits

        left = self._grow_tree(X_left, y_left, depth + 1)
        right = self._grow_tree(X_right, y_right, depth + 1)

        return Node(
            feature_index=best_feature,
            threshold=best_threshold,
            left=left,
            right=right,
            information_gain=best_gain
        )

    def predict(self, X):
        if self.root is None:
            raise ValueError("The DecisionTree model has not been trained yet. Please call fit() first.")
        return np.array([self._traverse_tree(x, self.root) for x in X], dtype=object)

    def _traverse_tree(self, x, node):

        if node.value is not None:
            return node.value, node.confidence

        if x[node.feature_index] <= node.threshold:
            return self._traverse_tree(x, node.left)

        return self._traverse_tree(x, node.right)

    def _most_common_label_with_conf(self, y):
        if len(y) == 0:
            return None, 1.0
        values, counts = np.unique(y, return_counts=True)
        idx = np.argmax(counts)
        return values[idx], float(counts[idx] / len(y))

    def print_tree(self, tree=None, indent="  "):

        if tree is None:
            tree = self.root

        # Leaf node
        if tree.value is not None:
            print(tree.value)
            return

        # Decision node
        print(
            f"Feature[{tree.feature_index}] <= {tree.threshold} "
            f"(Gain={tree.information_gain:.4f})"
        )

        print(indent + "Left:", end=" ")
        self.print_tree(tree.left, indent + "  ")

        print(indent + "Right:", end=" ")
        self.print_tree(tree.right, indent + "  ")

    def get_feature_importances(self):
        importances = np.zeros(self.n_features)

        def traverse(node):
            if node is None or node.value is not None:
                return
            if node.feature_index is not None and node.information_gain is not None:
                importances[node.feature_index] += node.information_gain
            traverse(node.left)
            traverse(node.right)

        traverse(self.root)

        total_importance = np.sum(importances)
        if total_importance > 0:
            importances = importances / total_importance

        return importances.tolist()