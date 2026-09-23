import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getStudentReport } from "../api";
import { Icon } from "../components/Icons";
import {
  DecisionGauge,
  MarksChart,
  ReportNav,
} from "../components/ReportVisuals";
import { Banner, Empty, Pill } from "../components/Status";
import { PiLessThan } from "react-icons/pi";
import { FaTrophy } from "react-icons/fa6";

export default function Report() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    getStudentReport(id)
      .then((result) => {
        if (!cancelled) {
          setReport(result.report);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <Empty>Loading report…</Empty>;
  }

  if (error) {
    return <Banner>{error}</Banner>;
  }

  if (!report) {
    return <Empty>Report not found.</Empty>;
  }

  const pass = report.finalDecision?.status === "Pass";
  const predicted = report.currentPerformance.predictedResult;

  const updated = report.updatedAt
    ? new Date(report.updatedAt).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div>
      <Link
        className="mb-2.5 inline-flex items-center gap-1 text-[0.9rem] text-[#6b7a90] no-underline hover:text-[#12203a]"
        to="/students"
      >
        <PiLessThan size={16} />
        Student Records
      </Link>

      <div className="mb-4.5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="m-0 text-3xl font-bold tracking-[-0.03em] text-[#12203a]">
            {report.student.name}
          </h1>

          <p className="mt-1.5 text-[#6b7a90]">
            {report.student.rollNo} · {report.student.department} · Semester{" "}
            {report.student.semester}
          </p>
        </div>

        <ReportNav id={id} />
      </div>

      <div className="mb-4 grid gap-4 min-[901px]:grid-cols-[1.35fr_1fr]">
        <section
          className={`flex flex-col justify-between gap-4 rounded px-6 py-6 text-white sm:flex-row sm:items-center sm:px-7 ${
            pass ? "bg-[#059669]" : "bg-[#125887]"
          }`}
        >
          <div className="max-w-md">
            <div className="mb-2 flex items-center gap-2 text-[0.85rem] text-[#c7d7f5]">
              Final Prediction
            </div>

            <h2 className="mb-2 text-3xl font-bold tracking-[-0.03em]">
              {pass ? "Expected to pass" : "Expected to fail"}
            </h2>

            <p className="m-0 text-[#d5e0f2]">
              {report.finalDecision?.message}
            </p>
          </div>

          <DecisionGauge label={predicted} />
        </section>

        <section className="rounded border border-[#e4ebf4] bg-white px-5 py-4.5 shadow-[0_8px_28px_rgba(15,36,68,0.06)]">
          <h3 className="mb-3.5 flex items-center gap-2 text-lg font-bold tracking-[-0.03em] text-[#12203a]">
            Prediction Summary
          </h3>

          <div className="flex items-center justify-between gap-3 border-b border-[#e4ebf4] py-2.5">
            <span className="text-[#6b7a90]">Current Percentage</span>

            <Pill value={report.currentPerformance.overallGrade}>
              {report.currentPerformance.overallPercentage}% ·{" "}
              {report.currentPerformance.overallGrade}
            </Pill>
          </div>

          <div className="flex items-center justify-between gap-3 border-b border-[#e4ebf4] py-2.5">
            <span className="text-[#6b7a90]">Predicted Performance</span>

            <Pill value={predicted} />
          </div>

          <div className="flex items-center justify-between gap-3 border-b border-[#e4ebf4] py-2.5">
            <span className="text-[#6b7a90]">Risk Level</span>

            <Pill value={report.currentPerformance.riskLevel} />
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-[0.85rem] text-[#6b7a90]">
            <span className="inline-flex items-center gap-1.5">
              Confidence: {report.futurePrediction?.confidence}%
            </span>

            <span className="inline-flex items-center gap-1.5">
              Attendance: {report.currentPerformance.attendance}%
            </span>

            <span className="inline-flex items-center gap-1.5">
              Behaviour: {report.currentPerformance.behavior}
            </span>
          </div>
        </section>
      </div>

      <div className="mb-4 grid gap-4 min-[901px]:grid-cols-[1.15fr_1fr]">
        <section className="rounded border border-[#e4ebf4] bg-white px-5 py-4.5 shadow-[0_8px_28px_rgba(15,36,68,0.06)]">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-lg font-bold tracking-[-0.03em] text-[#12203a]">
              Subject wise performance
            </h3>

            <span className="text-sm text-[#6b7a90]">
              {report.subjects.length} subjects
            </span>
          </div>

          <div className="overflow-auto rounded bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-[#e4ebf4] bg-transparent px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]">
                    Subject
                  </th>

                  <th className="border-b border-[#e4ebf4] bg-transparent px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]">
                    Marks
                  </th>

                  <th className="border-b border-[#e4ebf4] bg-transparent px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]">
                    Grade
                  </th>

                  <th className="border-b border-[#e4ebf4] bg-transparent px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]">
                    Performance
                  </th>
                </tr>
              </thead>

              <tbody>
                {report.subjects.map((subject) => (
                  <tr key={subject.subjectName}>
                    <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                      <span className="inline-flex items-center gap-2.5 font-semibold">
                        {subject.subjectName}
                      </span>
                    </td>

                    <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                      {subject.percentage}
                    </td>

                    <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                      {subject.grade}
                    </td>

                    <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                      <Pill value={subject.prediction} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded border border-[#e4ebf4] bg-white px-5 py-4.5 shadow-[0_8px_28px_rgba(15,36,68,0.06)]">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold tracking-[-0.03em] text-[#12203a]">
              Performance Overview
            </h3>

            <span className="text-sm text-[#6b7a90]">Marks</span>
          </div>

          <MarksChart subjects={report.subjects} />
        </section>
      </div>

      {/* Bottom Grid */}
      <div className="mb-4 grid gap-4 min-[901px]:grid-cols-[1.15fr_1fr]">
        {/* Strengths */}
        <section className="rounded border border-[#e4ebf4] bg-white px-5 py-[18px] shadow-[0_8px_28px_rgba(15,36,68,0.06)]">
          <h3 className="mb-3.5 flex items-center gap-2 text-lg font-bold tracking-[-0.03em] text-[#059669]">
            Strengths
          </h3>

          <ul className="m-0 list-none p-0">
            {report.strengths.map((item) => (
              <li
                key={item}
                className="mb-2.5 flex items-center gap-2.5 rounded-[14px] bg-[#eafaf3] p-3"
              >
                {item}
              </li>
            ))}
          </ul>

          <div className="px-3 pb-2 pt-7 text-center text-[#6b7a90]">
            <span className="mx-auto mb-2.5 grid h-21 w-21 place-items-center rounded-full bg-[#eafaf3] text-[#059669]">
              <FaTrophy size={30} />
            </span>

            <h3 className="text-lg font-bold tracking-[-0.03em] text-[#12203a]">
              Good effort!
            </h3>

            <p className="mt-1.5">
              {pass
                ? "Keep this level of consistency through the rest of the semester."
                : "The student shows consistent participation in class, which is a positive sign."}
            </p>
          </div>
        </section>

        <section className="rounded border border-[#e4ebf4] bg-white px-5 py-[18px] shadow-[0_8px_28px_rgba(15,36,68,0.06)]">
          <h3 className="mb-3.5 flex items-center gap-2 text-lg font-bold tracking-[-0.03em] text-[#f43f7c]">
            Areas to Improve
          </h3>

          <div>
            {report.improvements.map((item) => (
              <article
                key={item.area}
                className="border-b border-[#e4ebf4] py-3 last:border-b-0"
              >
                <header className="mb-1.5 flex items-center justify-between gap-3 font-bold">
                  <span className="flex items-center gap-2.5">{item.area}</span>

                  {item.performance ? <Pill value={item.performance} /> : null}
                </header>

                <ul className="m-0 list-none p-0">
                  {item.suggestions.map((suggestion) => (
                    <li
                      key={suggestion}
                      className="relative mb-1 pl-4 text-[0.9rem] text-[#6b7a90] before:absolute before:left-1 before:top-[0.55em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-[#94a3b8] before:content-['']"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
