import { Link, useParams } from "react-router-dom";

import { shortLabel } from "./Icons";
import { Pill } from "./Status";
import { FaEdit } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";

const GAUGE = {
  Excellent: 0.12,
  Good: 0.35,
  Average: 0.58,
  Poor: 0.88,
};

export function DecisionGauge({ label }) {
  const t = GAUGE[label] ?? 0.45;
  const start = Math.PI;
  const angle = start + Math.PI * t;
  const cx = 80;
  const cy = 78;
  const r = 56;
  const x = cx + r * Math.cos(angle);
  const y = cy + r * Math.sin(angle);

  return (
    <div className="gauge">
      <svg viewBox="0 0 160 110" width="160" height="110">
        <defs>
          <linearGradient id="gaugeArc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="55%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f43f7c" />
          </linearGradient>
        </defs>
        <path
          d="M24 78 A56 56 0 0 1 136 78"
          fill="none"
          stroke="#dbe7f5"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M24 78 A56 56 0 0 1 136 78"
          fill="none"
          stroke="url(#gaugeArc)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <line x1={cx} y1={cy} x2={x} y2={y} stroke="#0b1b34" strokeWidth="3" />
        <circle cx={cx} cy={cy} r="5" fill="#0b1b34" />
      </svg>
      <Pill value={label} />
    </div>
  );
}

export function MarksChart({ subjects }) {
  const width = 350;
  const height = 200;
  const pad = { l: 32, r: 12, t: 24, b: 36 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const max = 100;
  const barW = Math.min(36, innerW / Math.max(subjects.length, 1) / 1.7);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="marks-chart" role="img">
      <title>Subject marks versus passing mark of 50</title>
      {[0, 20, 40, 60, 80, 100].map((tick) => {
        const y = pad.t + innerH - (tick / max) * innerH;
        return (
          <g key={tick}>
            <line
              x1={pad.l}
              x2={width - pad.r}
              y1={y}
              y2={y}
              stroke="#edf2f8"
            />
            <text x={pad.l - 4} y={y + 4} textAnchor="end" className="text-sm">
              {tick}
            </text>
          </g>
        );
      })}
      {(() => {
        const y = pad.t + innerH - (50 / max) * innerH;
        return (
          <>
            <line
              x1={pad.l}
              x2={width - pad.r}
              y1={y}
              y2={y}
              stroke="#94a3b8"
              strokeDasharray="4 4"
            />
            <text x={width - pad.r} y={y - 6} textAnchor="end" className="text-sm">
              Passing mark(50)
            </text>
          </>
        );
      })()}
      {subjects.map((subject, index) => {
        const slot = innerW / subjects.length;
        const x = pad.l + slot * index + slot / 2 - barW / 2;
        const value = Number(subject.percentage || 0);
        const h = (value / max) * innerH;
        const y = pad.t + innerH - h;
        return (
          <g key={subject.subjectName}>
            <rect x={x} y={y} width={barW} height={h} rx="6" fill="#3b82f6" />
            <text x={x + barW / 2} y={y - 6} textAnchor="middle" className="chart-value">
              {value}
            </text>
            <text
              x={x + barW / 2}
              y={height - 10}
              textAnchor="middle"
              className="text-sm"
            >
              {shortLabel(subject.subjectName)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function ReportNav({ id }) {
  return (
    <div className="flex flex-col gap-3">
      <Link className="flex items-center gap-2" to={`/students/${id}/edit`}>
        <FaEdit name="edit" size={20} /> Edit student
      </Link>
      <Link className="flex items-center gap-2" to="/students">
        <FaUsers size={20} /> All students
      </Link>
    </div>
  );
}
