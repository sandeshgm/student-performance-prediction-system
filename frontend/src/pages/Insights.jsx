import { useEffect, useState } from "react";

import {
  getFeatureImportance,
  getModelAccuracy,
  getTopPerformers,
  updateFeatureImportance,
} from "../api";
import { Banner, Empty, Pill } from "../components/Status";

const WEIGHT_KEYS = [
  ["attendance", "Attendance"],
  ["gpa", "GPA"],
  ["internal", "Internal"],
  ["assignment", "Assignment"],
  ["terminal", "Terminal"],
  ["behaviour", "Behaviour"],
];

export default function Insights() {
  const [top, setTop] = useState([]);
  const [accuracy, setAccuracy] = useState(null);
  const [weights, setWeights] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);

  async function load() {
    setError("");
    const [topResult, accuracyResult, importance] = await Promise.all([
      getTopPerformers(8),
      getModelAccuracy(),
      getFeatureImportance(),
    ]);
    setTop(topResult.students || []);
    setAccuracy(accuracyResult.data);
    setWeights(importance.data || {});
  }

  useEffect(() => {
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function onRetrain(event) {
    event.preventDefault();
    setRetraining(true);
    setError("");
    setNotice("");
    try {
      const numeric = Object.fromEntries(
        WEIGHT_KEYS.map(([key]) => [key, Number(weights[key] || 0)]),
      );
      await updateFeatureImportance(numeric);
      await load();
      setNotice("Model retrained and student predictions recalculated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setRetraining(false);
    }
  }

  if (loading) {
    return <Empty>Loading insights…</Empty>;
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="eyebrow">Model</div>
          <h1>Insights</h1>
          <p>
            Top performers, held-out accuracy on synthetic data, and training
            weights.
          </p>
        </div>
      </div>

      <Banner>{error}</Banner>
      {notice ? <p className="muted">{notice}</p> : null}

      <section className="section">
        <h2>Top performers</h2>
        {top.length === 0 ? (
          <Empty>No students yet.</Empty>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Roll</th>
                  <th>Predicted</th>
                  <th>Average</th>
                </tr>
              </thead>
              <tbody>
                {top.map((student) => (
                  <tr key={student._id}>
                    <td>{student.rank}</td>
                    <td>{student.name}</td>
                    <td>{student.rollNo || student.studentId}</td>
                    <td>
                      <Pill value={student.predictedPerformance} />
                    </td>
                    <td>{Number(student.averageMarks || 0).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid two-col section">
        <div className="card">
          <h2>Model accuracy</h2>
          {accuracy ? (
            <>
              <div className="stat-value">{accuracy.modelAccuracy}</div>
              <p className="muted">
                Held-out test on a {accuracy.datasetType || "synthetic"} dataset
                {accuracy.labeling ? ` (${accuracy.labeling.replaceAll("_", " ")})` : ""}
                . Depth {accuracy.maxDepth}. {accuracy.correctPredictions}/
                {accuracy.testSamples} correct.
              </p>
              {accuracy.confusionMatrix ? (
                <table className="matrix">
                  <thead>
                    <tr>
                      <th></th>
                      {accuracy.labels.map((label) => (
                        <th key={label}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {accuracy.confusionMatrix.map((row, index) => (
                      <tr key={accuracy.labels[index]}>
                        <th>{accuracy.labels[index]}</th>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </>
          ) : (
            <Empty>Accuracy report not available. Train the model first.</Empty>
          )}
        </div>

        <form className="card" onSubmit={onRetrain}>
          <h2>Feature weights</h2>
          <p className="muted">
            Higher weight makes that feature more separable in the synthetic
            training set. Retrain can take a minute.
          </p>
          {WEIGHT_KEYS.map(([key, label]) => (
            <div className="slider-row" key={key}>
              <label>{label}</label>
              <input
                type="range"
                min="0"
                max="40"
                value={weights[key] ?? 0}
                onChange={(event) =>
                  setWeights((current) => ({
                    ...current,
                    [key]: Number(event.target.value),
                  }))
                }
              />
              <strong>{weights[key] ?? 0}</strong>
            </div>
          ))}
          <button className="btn" type="submit" disabled={retraining}>
            {retraining ? "Retraining…" : "Save weights and retrain"}
          </button>
        </form>
      </div>
    </div>
  );
}
