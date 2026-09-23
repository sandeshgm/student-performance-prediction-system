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
          (students.data || []).filter(
            (student) => student.riskLevel === "High"
          )
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
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mb-2 tracking-[0.12em] text-lg font-bold text-[#125587]">
            Dashboard
          </h1>

          <p className="mt-2 text-[#6b7a90]">
            View every students from every department and semester, and see
            which students are at risk of failing.
          </p>
        </div>

        <Link
          className="rounded bg-[#125887] px-4 py-2.5 font-semibold text-white no-underline transition-colors hover:bg-[#0e476d]"
          to="/students/new"
        >
          Add student
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2.5">
        <label className="flex flex-col gap-1.5 text-[0.8rem] font-semibold text-[#6b7a90]">
          Department
          <input
            value={filters.department}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                department: event.target.value,
              }))
            }
            placeholder="All"
            className="min-w-40 rounded-[10px] border border-[#e4ebf4] bg-white px-2.5 py-[9px] text-[#12203a] outline-none focus:border-[#2f6bff]"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-[0.8rem] font-semibold text-[#6b7a90]">
          Semester
          <select
            value={filters.semester}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                semester: event.target.value,
              }))
            }
            className="min-w-40 rounded-[10px] border border-[#e4ebf4] bg-white px-2.5 py-[9px] text-[#12203a] outline-none focus:border-[#2f6bff]"
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

      <div className="grid grid-cols-1 gap-4 min-[901px]:grid-cols-6">
        {[
          ["Total", stats.totalStudents],
          ["Excellent", stats.excellent],
          ["Good", stats.good],
          ["Average", stats.average],
          ["Poor", stats.poor],
          ["At risk", stats.atRisk],
        ].map(([label, value]) => (
          <div
            className="rounded border border-[#e4ebf4] bg-white px-5 py-4.5 shadow-[0_8px_28px_rgba(15,36,68,0.06)]"
            key={label}
          >
            <div className="text-[1.8rem] font-bold text-[#12203a]">
              {loading ? "—" : value}
            </div>

            <div className="mt-1 text-[0.85rem] text-[#6b7a90] not-first-of-type:">
              {label}
            </div>
          </div>
        ))}
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-xl font-semibold tracking-[-0.03em] text-[#12203a]">
          High-risk students
        </h2>

        {loading ? (
          <Empty>Loading…</Empty>
        ) : atRisk.length === 0 ? (
          <Empty>No high-risk students for this filter.</Empty>
        ) : (
          <div className="overflow-auto rounded border border-[#e4ebf4] bg-none shadow-[0_8px_28px_rgba(15,36,68,0.06)]">
            <table className="w-full border-collapse">
              <thead>
                <tr>
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
                    Risk
                  </th>

                  <th className="border-b border-[#e4ebf4] px-2.5 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]"></th>
                </tr>
              </thead>

              <tbody>
                {atRisk.map((student) => (
                  <tr key={student._id}>
                    <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                      {student.firstName} {student.lastName}
                    </td>

                    <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                      {student.rollNo}
                    </td>

                    <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                      <Pill value={student.predictedPerformance} />
                    </td>

                    <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                      <Pill value={student.riskLevel} />
                    </td>

                    <td className="border-b border-[#e4ebf4] px-2.5 py-3 text-[0.95rem] text-[#12203a]">
                      <Link
                        to={`/students/${student._id}/report`}
                        className="font-semibold text-[#2f6bff] no-underline hover:underline"
                      >
                        Report
                      </Link>
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
