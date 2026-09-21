import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getDashboard, getStudents } from "../api";
import { Banner, Empty, Pill } from "../components/Status";

const emptyStats = {
  totalStudents: 0,
  excellent: 0,
  good: 0,
  average: 0,
  poor: 0,
  atRisk: 0,
};

export default function Dashboard() {
  const [filters, setFilters] = useState({ department: "", semester: "" });
  const [stats, setStats] = useState(emptyStats);
  const [atRisk, setAtRisk] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = {
          department: filters.department.trim() || undefined,
          semester: filters.semester || undefined,
        };
        const [dashboard, students] = await Promise.all([
          getDashboard(params),
          getStudents({ ...params, limit: 200 }),
        ]);
        if (cancelled) {
          return;
        }
        setStats(dashboard.data || emptyStats);
        setAtRisk(
          (students.data || []).filter((student) => student.riskLevel === "High"),
        );
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [filters.department, filters.semester]);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="eyebrow">Overview</div>
          <h1>Dashboard</h1>
          <p>Current standing from marks, plus students the model flags as high risk.</p>
        </div>
        <Link className="btn" to="/students/new">
          Add student
        </Link>
      </div>

      <div className="filters">
        <label>
          Department
          <input
            value={filters.department}
            onChange={(event) =>
              setFilters((current) => ({ ...current, department: event.target.value }))
            }
            placeholder="All"
          />
        </label>
        <label>
          Semester
          <select
            value={filters.semester}
            onChange={(event) =>
              setFilters((current) => ({ ...current, semester: event.target.value }))
            }
          >
            <option value="">All</option>
            {Array.from({ length: 8 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Banner>{error}</Banner>

      <div className="grid stats">
        {[
          ["Total", stats.totalStudents],
          ["Excellent", stats.excellent],
          ["Good", stats.good],
          ["Average", stats.average],
          ["Poor", stats.poor],
          ["At risk", stats.atRisk],
        ].map(([label, value]) => (
          <div className="card" key={label}>
            <div className="stat-value">{loading ? "—" : value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <section className="section">
        <h2>High-risk students</h2>
        {loading ? (
          <Empty>Loading…</Empty>
        ) : atRisk.length === 0 ? (
          <Empty>No high-risk students for this filter.</Empty>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll</th>
                  <th>Predicted</th>
                  <th>Risk</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {atRisk.map((student) => (
                  <tr key={student._id}>
                    <td>
                      {student.firstName} {student.lastName}
                    </td>
                    <td>{student.rollNo}</td>
                    <td>
                      <Pill value={student.predictedPerformance} />
                    </td>
                    <td>
                      <Pill value={student.riskLevel} />
                    </td>
                    <td>
                      <Link to={`/students/${student._id}/report`}>Report</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
