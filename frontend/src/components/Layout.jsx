import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { getStudents } from "../api";
import { useAuth } from "../auth";
import { Icon } from "./Icons";
import { MdAnalytics } from "react-icons/md";
import { CiSearch } from "react-icons/ci";

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getStudents({ limit: 200 })
      .then((result) => setStudents(result.data || []))
      .catch(() => setStudents([]));
  }, []);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) {
      return [];
    }

    return students
      .filter((student) => {
        const name = `${student.firstName} ${
          student.lastName || ""
        }`.toLowerCase();

        return (
          name.includes(needle) ||
          String(student.rollNo || "")
            .toLowerCase()
            .includes(needle)
        );
      })
      .slice(0, 6);
  }, [query, students]);

  return (
    <div className="min-h-screen bg-[#eef3f9]">
      <aside className="fixed left-0 top-0 z-40 flex h-auto w-full flex-row items-center gap-3 bg-[#125887] px-4 py-3 text-white lg:bottom-0 lg:h-auto lg:w-62 lg:flex-col lg:items-stretch lg:gap-7 lg:px-4 lg:py-6">
        <div className="flex shrink-0 items-center gap-2.5 px-2 py-1">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#0e476d]">
            <MdAnalytics className="h-5 w-5" />
          </span>

          <span className="hidden text-[1.02rem] font-bold leading-tight sm:block">
            StuPredict
          </span>
        </div>

        <nav className="flex flex-1 items-center gap-1.5 lg:flex-col lg:items-stretch">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center justify-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors lg:justify-start ${
                isActive
                  ? "bg-[#0e476d] text-white"
                  : "text-[#d5e5f2] hover:bg-[#0e476d] hover:text-white"
              }`
            }
          >
            <Icon name="dashboard" />
            <span className="hidden md:inline">Dashboard</span>
          </NavLink>

          <NavLink
            to="/students"
            className={({ isActive }) =>
              `flex items-center justify-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors lg:justify-start ${
                isActive
                  ? "bg-[#0e476d] text-white"
                  : "text-[#d5e5f2] hover:bg-[#0e476d] hover:text-white"
              }`
            }
          >
            <Icon name="students" />
            <span className="hidden md:inline">Students</span>
          </NavLink>

          <NavLink
            to="/insights"
            className={({ isActive }) =>
              `flex items-center justify-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors lg:justify-start ${
                isActive
                  ? "bg-[#0e476d] text-white"
                  : "text-[#d5e5f2] hover:bg-[#0e476d] hover:text-white"
              }`
            }
          >
            <Icon name="insights" />
            <span className="hidden md:inline">Insights</span>
          </NavLink>
        </nav>

        <div className="shrink-0 lg:mt-auto">
          <button
            type="button"
            onClick={logout}
            className="flex items-center justify-center gap-2.5 rounded-xl border-0 bg-transparent px-3.5 py-2.5 text-sm font-medium text-[#d5e5f2] transition-colors hover:bg-[#0e476d] hover:text-white lg:w-full lg:justify-start"
          >
            <Icon name="logout" />
            <span className="hidden md:inline">Log out</span>
          </button>
        </div>
      </aside>

      <div className="min-w-0 lg:ml-62 mt-16 lg:mt-0">
        <header className="flex items-center justify-between gap-4 px-4 pt-4 lg:px-7">
          <div className="relative flex min-w-0 max-w-140 flex-1 items-center gap-2 rounded border border-[#e4ebf4] bg-white p-1 text-[#6b7a90]">
            <CiSearch className="h-4 w-4 shrink-0" />

            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Search student..."
              className="w-full border-0 bg-transparent py-2.5 text-sm text-[#12203a] outline-none placeholder:text-[#6b7a90]"
            />

            {open && matches.length > 0 ? (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-[#e4ebf4] bg-white shadow-[0_8px_28px_rgba(15,36,68,0.06)]">
                {matches.map((student) => (
                  <button
                    type="button"
                    key={student._id}
                    onMouseDown={() => {
                      setQuery("");
                      navigate(`/students/${student._id}/report`);
                    }}
                    className="block w-full border-0 bg-white px-3.5 py-2.5 text-left text-sm text-[#12203a] transition-colors hover:bg-[#f4f8ff]"
                  >
                    {student.firstName} {student.lastName} · {student.rollNo}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

            <div className="flex items-center gap-2 rounded-full border border-[#e4ebf4] bg-white py-1 pl-1 pr-3 text-sm font-semibold text-[#12203a]">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0e476d] text-xs text-white">
                A
              </span>

              <span className="hidden sm:inline">Admin</span>
            </div>
        </header>

        <main className="px-4 pb-10 pt-5 lg:px-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
