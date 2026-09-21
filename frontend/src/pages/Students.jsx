import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { deleteStudent, getStudents } from "../api";
import { Banner, Empty, Pill } from "../components/Status";

export default function Students() {
  const [filters, setFilters] = useState({
    department: "",
    semester: "",
    page: 1,
  });
  const [payload, setPayload] = useState({ data: [], total: 0, page: 1, limit: 50 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await getStudents({
        department: filters.department.trim() || undefined,
        semester: filters.semester || undefined,
        page: filters.page,
        limit: 20,
      });
      setPayload(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.department, filters.semester, filters.page]);

  async function onDelete(id, name) {
    if (!window.confirm(`Delete ${name}?`)) {
      return;
    }
    try {
      await deleteStudent(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const pages = Math.max(1, Math.ceil((payload.total || 0) / (payload.limit || 20)));

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="eyebrow">Records</div>
          <h1>Students</h1>
          <p>Filter, edit records, or open a prediction report.</p>
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
              setFilters((current) => ({
                ...current,
                department: event.target.value,
                page: 1,
              }))
            }
            placeholder="All"
          />
        </label>
        <label>
          Semester
          <select
            value={filters.semester}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                semester: event.target.value,
                page: 1,
              }))
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

      {loading ? (
        <Empty>Loading…</Empty>
      ) : payload.data?.length ? (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll</th>
                  <th>Dept</th>
                  <th>Sem</th>
                  <th>Avg</th>
                  <th>Current</th>
                  <th>Predicted</th>
                  <th>Risk</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {payload.data.map((student) => {
                  const name = `${student.firstName} ${student.lastName || ""}`.trim();
                  return (
                    <tr key={student._id}>
                      <td>{name}</td>
                      <td>{student.rollNo}</td>
                      <td>{student.department}</td>
                      <td>{student.semester}</td>
                      <td>{Number(student.averageMarks || 0).toFixed(1)}</td>
                      <td>
                        <Pill value={student.overallPerformance} />
                      </td>
                      <td>
                        <Pill value={student.predictedPerformance} />
                      </td>
                      <td>
                        <Pill value={student.riskLevel} />
                      </td>
                      <td className="actions">
                        <Link to={`/students/${student._id}/report`}>Report</Link>
                        <Link to={`/students/${student._id}/edit`}>Edit</Link>
                        <button
                          type="button"
                          className="btn ghost"
                          onClick={() => onDelete(student._id, name)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <span>
              {payload.total} students · page {payload.page} of {pages}
            </span>
            <div className="actions">
              <button
                className="btn ghost"
                type="button"
                disabled={filters.page <= 1}
                onClick={() =>
                  setFilters((current) => ({ ...current, page: current.page - 1 }))
                }
              >
                Previous
              </button>
              <button
                className="btn ghost"
                type="button"
                disabled={filters.page >= pages}
                onClick={() =>
                  setFilters((current) => ({ ...current, page: current.page + 1 }))
                }
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <Empty>No students match this filter.</Empty>
      )}
    </div>
  );
}
