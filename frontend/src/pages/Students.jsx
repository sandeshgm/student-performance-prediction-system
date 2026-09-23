import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { deleteStudent, getStudents } from "../api";
import { Banner, Empty, Pill } from "../components/Status";
import { HiDocumentReport } from "react-icons/hi";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";

export default function Students() {
  const [filters, setFilters] = useState({
    department: "",
    semester: "",
    page: 1,
  });

  const [payload, setPayload] = useState({
    data: [],
    total: 0,
    page: 1,
    limit: 50,
  });

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

  const pages = Math.max(
    1,
    Math.ceil((payload.total || 0) / (payload.limit || 20))
  );

  return (
    <div>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 tracking-[0.12em] text-lg font-bold text-[#125587]">
            Student Records
          </div>

          <p className="mt-2 text-[#6b7a90]">
            Filter, edit records, or view the prediction report of students.
          </p>
        </div>

        <Link
          className="inline-flex items-center justify-center rounded border-0 bg-[#125887] px-4 py-2.5 font-semibold text-white no-underline hover:bg-[#0e476d]"
          to="/students/new"
        >
          Add student
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-2.5">
        <label className="flex min-w-40 flex-col gap-1.5 text-[0.8rem] font-semibold text-[#6b7a90]">
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
            className="w-full rounded-[10px] border border-[#e4ebf4] bg-white px-2.5 py-2.25 text-[0.95rem] font-normal text-[#12203a] outline-none focus:border-[#2f6bff] focus:ring-2 focus:ring-[#2f6bff]/10"
          />
        </label>

        <label className="flex min-w-40 flex-col gap-1.5 text-[0.8rem] font-semibold text-[#6b7a90]">
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
            className="w-full rounded-[10px] border border-[#e4ebf4] bg-white px-2.5 py-2.25 text-[0.95rem] font-normal text-[#12203a] outline-none focus:border-[#2f6bff] focus:ring-2 focus:ring-[#2f6bff]/10"
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
          <div className="overflow-auto rounded border border-[#e4ebf4] bg-white shadow-[0_8px_28px_rgba(15,36,68,0.06)]">
            <table className="w-full min-w-225 border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-[#e4ebf4] px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]">
                    Name
                  </th>

                  <th className="border-b border-[#e4ebf4] px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]">
                    Roll
                  </th>

                  <th className="border-b border-[#e4ebf4] px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]">
                    Department
                  </th>

                  <th className="border-b border-[#e4ebf4] px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]">
                    Semester
                  </th>

                  <th className="border-b border-[#e4ebf4] px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]">
                    Avg Marks
                  </th>

                  <th className="border-b border-[#e4ebf4] px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]">
                    Current
                  </th>

                  <th className="border-b border-[#e4ebf4] px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]">
                    Predicted
                  </th>

                  <th className="border-b border-[#e4ebf4] px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]">
                    Risk
                  </th>

                  <th className="border-b border-[#e4ebf4] px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {payload.data.map((student) => {
                  const name = `${student.firstName} ${
                    student.lastName || ""
                  }`.trim();

                  return (
                    <tr key={student._id}>
                      <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                        {name}
                      </td>

                      <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                        {student.rollNo}
                      </td>

                      <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                        {student.department}
                      </td>

                      <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                        {student.semester}
                      </td>

                      <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                        {Number(student.averageMarks || 0).toFixed(1)}
                      </td>

                      <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                        <Pill value={student.overallPerformance} />
                      </td>

                      <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                        <Pill value={student.predictedPerformance} />
                      </td>

                      <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                        <Pill value={student.riskLevel} />
                      </td>

                      <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                        <div className="flex items-center gap-3 whitespace-nowrap">
                          <Link
                            className="font-semibold text-[#2f6bff] no-underline hover:underline inline-flex items-center gap-1"
                            to={`/students/${student._id}/report`}
                          >
                            <HiDocumentReport className="text-2xl" />
                          </Link>

                          <Link
                            className="font-semibold text-[#2f6bff] no-underline hover:underline inline-flex items-center gap-1"
                            to={`/students/${student._id}/edit`}
                          >
                            <FaEdit className="text-xl" />
                          </Link>

                          <button
                            type="button"
                            className="border-0 bg-transparent px-0 py-1 font-semibold text-[#f43f7c] hover:underline inline-flex items-center gap-1"
                            onClick={() => onDelete(student._id, name)}
                          >
                            <MdDelete className="text-xl" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <span className="text-[0.9rem] text-[#6b7a90]">
              {payload.total} students · page {payload.page} of {pages}
            </span>

            <div className="flex items-center gap-2">
              <button
                className="inline-flex items-center justify-center rounded-xl border border-[#e4ebf4] bg-white px-3 py-2 font-semibold text-[#12203a] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#f7f9fc]"
                type="button"
                disabled={filters.page <= 1}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: current.page - 1,
                  }))
                }
              >
                Previous
              </button>

              <button
                className="inline-flex items-center justify-center rounded-xl border border-[#e4ebf4] bg-white px-3 py-2 font-semibold text-[#12203a] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#f7f9fc]"
                type="button"
                disabled={filters.page >= pages}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: current.page + 1,
                  }))
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
