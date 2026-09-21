import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getStudentReport } from "../api";
import { Icon } from "../components/Icons";
import {
  DecisionGauge,
  MarksChart,
  ReportNav,
  SubjectGlyph,
} from "../components/ReportVisuals";
import { Banner, Empty, Pill } from "../components/Status";

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
    <div className="report-page">
      <Link className="rp-back" to="/students">
        <Icon name="back" size={16} /> Student Performance
      </Link>

      <div className="rp-head">
        <div>
          <h1>{report.student.name}</h1>
          <p>
            {report.student.rollNo} · {report.student.department} · Semester{" "}
            {report.student.semester}
          </p>
        </div>
        <ReportNav id={id} />
      </div>

      <div className="rp-grid-top">
        <section className={`decision-card ${pass ? "pass" : "fail"}`}>
          <div className="decision-copy">
            <div className="decision-kicker">
              <span className="check-dot">
                <Icon name="check" size={12} />
              </span>
              Final Decision
            </div>
            <h2>{pass ? "Expected to pass" : "Expected to fail"}</h2>
            <p>{report.finalDecision?.message}</p>
          </div>
          <DecisionGauge label={predicted} />
        </section>

        <section className="card summary-card">
          <h3>
            <Icon name="insights" size={16} /> Prediction Summary
          </h3>
          <div className="summary-row">
            <span>Current standing</span>
            <Pill value={report.currentPerformance.overallGrade}>
              {report.currentPerformance.overallPercentage}% ·{" "}
              {report.currentPerformance.overallGrade}
            </Pill>
          </div>
          <div className="summary-row">
            <span>Predicted</span>
            <Pill value={predicted} />
          </div>
          <div className="summary-row">
            <span>Risk</span>
            <Pill value={report.currentPerformance.riskLevel} />
          </div>
          <div className="summary-meta">
            <span>
              <Icon name="shield" size={14} /> Confidence{" "}
              {report.futurePrediction?.confidence}%
            </span>
            <span>
              <Icon name="user" size={14} /> Attendance{" "}
              {report.currentPerformance.attendance}%
            </span>
            <span>
              <Icon name="alert" size={14} /> Behaviour{" "}
              {report.currentPerformance.behavior}
            </span>
          </div>
        </section>
      </div>

      <div className="rp-grid-mid">
        <section className="card">
          <div className="card-title">
            <h3>
              <Icon name="book" size={16} /> Subject Performance
            </h3>
            <span className="muted">{report.subjects.length} subjects</span>
          </div>
          <div className="table-wrap quiet">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Grade</th>
                  <th>Prediction</th>
                </tr>
              </thead>
              <tbody>
                {report.subjects.map((subject) => (
                  <tr key={subject.subjectName}>
                    <td>
                      <span className="subject-cell">
                        <SubjectGlyph name={subject.subjectName} />
                        {subject.subjectName}
                      </span>
                    </td>
                    <td>{subject.percentage}</td>
                    <td>{subject.grade}</td>
                    <td>
                      <Pill value={subject.prediction} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <div className="card-title">
            <h3>Performance Overview</h3>
            <span className="muted">Marks</span>
          </div>
          <MarksChart subjects={report.subjects} />
        </section>
      </div>

      <div className="rp-grid-bottom">
        <section className="card strengths-card">
          <h3 className="good">
            <Icon name="star" size={16} /> Strengths
          </h3>
          <ul className="strength-list">
            {report.strengths.map((item) => (
              <li key={item}>
                <SubjectGlyph name={item} />
                {item}
              </li>
            ))}
          </ul>
          <div className="trophy">
            <span className="trophy-icon">
              <Icon name="trophy" size={36} />
            </span>
            <h3>Good effort!</h3>
            <p>
              {pass
                ? "Keep this level of consistency through the rest of the semester."
                : "The student shows consistent participation in class, which is a positive sign."}
            </p>
          </div>
        </section>

        <section className="card improve-card">
          <h3 className="bad">
            <Icon name="target" size={16} /> Areas to Improve
          </h3>
          <div className="improve-list">
            {report.improvements.map((item) => (
              <article key={item.area}>
                <header>
                  <span className="improve-title">
                    <SubjectGlyph name={item.area} />
                    {item.area}
                  </span>
                  {item.performance ? <Pill value={item.performance} /> : null}
                </header>
                <ul>
                  {item.suggestions.map((suggestion) => (
                    <li key={suggestion}>{suggestion}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </div>

      {updated ? (
        <p className="rp-updated">
          <Icon name="calendar" size={14} /> Last updated: {updated}
        </p>
      ) : null}
    </div>
  );
}
