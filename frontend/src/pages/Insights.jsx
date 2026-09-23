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
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mb-2 tracking-[0.12em] text-lg font-bold text-[#125587]">
            Insights
          </h1>

          <p className="mt-2 text-[#6b7a90]">
            View the top performers and model accuracy, and adjust feature weights used to train the model.
          </p>
        </div>
      </div>

      <Banner>{error}</Banner>

      {notice ? (
        <p className="mb-4 text-[#6b7a90]">
          {notice}
        </p>
      ) : null}

      <section className="mb-4">
        <h2 className="mb-3 text-xl font-bold tracking-[-0.03em] text-[#12203a]">
          Top performers
        </h2>

        {top.length === 0 ? (
          <Empty>No students yet.</Empty>
        ) : (
          <div className="overflow-auto rounded border border-[#e4ebf4] bg-white shadow-[0_8px_28px_rgba(15,36,68,0.06)]">
            <table className="w-full min-w-[650px] border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-[#e4ebf4] px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]">
                    Rank
                  </th>

                  <th className="border-b border-[#e4ebf4] px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]">
                    Name
                  </th>

                  <th className="border-b border-[#e4ebf4] px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]">
                    Roll
                  </th>

                  <th className="border-b border-[#e4ebf4] px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]">
                    Predicted
                  </th>

                  <th className="border-b border-[#e4ebf4] px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]">
                    Average
                  </th>
                </tr>
              </thead>

              <tbody>
                {top.map((student) => (
                  <tr key={student._id}>
                    <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                      {student.rank}
                    </td>

                    <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                      {student.name}
                    </td>

                    <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                      {student.rollNo || student.studentId}
                    </td>

                    <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                      <Pill value={student.predictedPerformance} />
                    </td>

                    <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                      {Number(student.averageMarks || 0).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-4 min-[901px]:grid-cols-2">
        <div className="rounded border border-[#e4ebf4] bg-white px-5 py-[18px] shadow-[0_8px_28px_rgba(15,36,68,0.06)]">
          <h2 className="mb-3 text-xl font-bold tracking-[-0.03em] text-[#12203a]">
            Model accuracy
          </h2>

          {accuracy ? (
            <>
              <div className="text-[1.8rem] font-bold tracking-[-0.03em] text-[#12203a]">
                {accuracy.modelAccuracy}
              </div>

              <p className="mt-1.5 text-[#6b7a90]">
                Held-out test on a {accuracy.datasetType || "synthetic"} dataset
                {accuracy.labeling
                  ? ` (${accuracy.labeling.replaceAll("_", " ")})`
                  : ""}
                . Depth {accuracy.maxDepth}. {accuracy.correctPredictions}/
                {accuracy.testSamples} correct.
              </p>

              {accuracy.confusionMatrix ? (
                <div className="mt-5 overflow-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border-b border-[#e4ebf4] px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]"></th>

                        {accuracy.labels.map((label) => (
                          <th
                            key={label}
                            className="border-b border-[#e4ebf4] px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]"
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {accuracy.confusionMatrix.map((row, index) => (
                        <tr key={accuracy.labels[index]}>
                          <th className="border-b border-[#e4ebf4] px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]">
                            {accuracy.labels[index]}
                          </th>

                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </>
          ) : (
            <Empty>
              Accuracy report not available. Train the model first.
            </Empty>
          )}
        </div>

        <form
          className="rounded border border-[#e4ebf4] bg-white px-5 py-[18px] shadow-[0_8px_28px_rgba(15,36,68,0.06)]"
          onSubmit={onRetrain}
        >
          <h2 className="mb-3 text-xl font-bold tracking-[-0.03em] text-[#12203a]">
            Feature weights
          </h2>

          <p className="mb-4 text-[#6b7a90]">
            {/* Higher weight makes that feature more separable in the synthetic
            training set.  */}
            {/* Retrain can take a minute. */}
            These are the features used to trrain the model
          </p>

          {WEIGHT_KEYS.map(([key, label]) => (
            <div
              className="grid grid-cols-[120px_1fr_32px] items-center gap-3 border-b border-[#e4ebf4] py-3 last:border-b-0"
              key={key}
            >
              <label className="text-[0.8rem] font-semibold text-[#6b7a90]">
                {label}
              </label>

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
                className="w-full accent-[#2f6bff]"
              />

              <strong className="text-center text-[#12203a]">
                {weights[key] ?? 0}
              </strong>
            </div>
          ))}

          {/* <button
            className="mt-5 rounded-[12px] border-0 bg-[#2f6bff] px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 hover:bg-[#2559d9]"
            type="submit"
            disabled={retraining}
          >
            {retraining ? "Retraining…" : "Save weights and retrain"}
          </button> */}
        </form>
      </div>
    </div>
  );
}