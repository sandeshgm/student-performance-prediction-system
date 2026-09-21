import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { getStudents } from "../api";
import { useAuth } from "../auth";
import { Icon } from "./Icons";

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
        const name = `${student.firstName} ${student.lastName || ""}`.toLowerCase();
        return name.includes(needle) || String(student.rollNo || "").toLowerCase().includes(needle);
      })
      .slice(0, 6);
  }, [query, students]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">
            <Icon name="logo" size={22} />
          </span>
          <span className="brand-mark">Student Performance</span>
        </div>
        <nav className="nav-links">
          <NavLink to="/" end>
            <Icon name="dashboard" /> Dashboard
          </NavLink>
          <NavLink to="/students">
            <Icon name="students" /> Students
          </NavLink>
          <NavLink to="/insights">
            <Icon name="insights" /> Insights
          </NavLink>
        </nav>
        <div className="sidebar-foot">
          <button type="button" onClick={logout}>
            <Icon name="logout" /> Log out
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="search">
            <Icon name="search" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Search student..."
            />
            {open && matches.length > 0 ? (
              <div className="search-menu">
                {matches.map((student) => (
                  <button
                    type="button"
                    key={student._id}
                    onMouseDown={() => {
                      setQuery("");
                      navigate(`/students/${student._id}/report`);
                    }}
                  >
                    {student.firstName} {student.lastName} · {student.rollNo}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="topbar-end">
            <button type="button" className="icon-btn" aria-label="Notifications">
              <Icon name="bell" />
            </button>
            <div className="admin-chip">
              <span className="avatar">A</span>
              Admin
            </div>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
