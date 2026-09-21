export function Icon({ name, size = 18 }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    logo: (
      <>
        <path d="M3 10.5 12 5l9 5.5-9 5.5-9-5.5Z" />
        <path d="M7 13v4.2c0 .4 2.2 2.3 5 2.3s5-1.9 5-2.3V13" />
      </>
    ),
    dashboard: (
      <>
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="5" rx="1.5" />
        <rect x="13" y="10" width="8" height="11" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
      </>
    ),
    students: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M4 19a5 5 0 0 1 10 0" />
        <circle cx="17" cy="9" r="2.2" />
        <path d="M20.5 19a4 4 0 0 0-5-3.7" />
      </>
    ),
    insights: (
      <>
        <path d="M4 19V9" />
        <path d="M10 19V5" />
        <path d="M16 19v-7" />
        <path d="M20 19V8" />
      </>
    ),
    logout: (
      <>
        <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
        <path d="M15 12H8" />
        <path d="m17 8 5 4-5 4" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    eyeOff: (
      <>
        <path d="M3 3l18 18" />
        <path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.4" />
        <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6 0 10 7 10 7a18.4 18.4 0 0 1-3.2 3.8" />
        <path d="M6.1 6.1C3.8 7.8 2 12 2 12s4 7 10 7a10.4 10.4 0 0 0 4.2-.9" />
      </>
    ),
    bell: (
      <>
        <path d="M6 9a6 6 0 1 1 12 0c0 7 2 7 2 9H4c0-2 2-2 2-9" />
        <path d="M10 21h4" />
      </>
    ),
    edit: (
      <>
        <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
        <path d="m13 7 4 4" />
      </>
    ),
    back: <path d="M15 5 8 12l7 7" />,
    check: <path d="M5 13.5 9.5 18 19 7" />,
    alert: (
      <>
        <path d="M12 4 3 20h18L12 4Z" />
        <path d="M12 10v4" />
        <path d="M12 17h.01" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5 19a7 7 0 0 1 14 0" />
      </>
    ),
    calendar: (
      <>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </>
    ),
    book: (
      <>
        <path d="M5 5h10a3 3 0 0 1 3 3v12H8a3 3 0 0 0-3 3V5Z" />
        <path d="M5 5v15" />
      </>
    ),
    calc: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8 7h8M8 12h2M12 12h2M16 12h1M8 16h2M12 16h2M16 16h1" />
      </>
    ),
    code: (
      <>
        <path d="m8 8-4 4 4 4" />
        <path d="m16 8 4 4-4 4" />
        <path d="m14 7-4 10" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="6" rx="7" ry="3" />
        <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
        <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
      </>
    ),
    gear: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v2M12 19v2M4.9 6.5l1.5 1.5M17.6 16l1.5 1.5M3 12h2M19 12h2M4.9 17.5l1.5-1.5M17.6 8l1.5-1.5" />
      </>
    ),
    network: (
      <>
        <circle cx="12" cy="6" r="2.2" />
        <circle cx="6" cy="18" r="2.2" />
        <circle cx="18" cy="18" r="2.2" />
        <path d="M12 8v4M10.2 12 7.4 16.3M13.8 12l2.8 4.3" />
      </>
    ),
    star: (
      <path d="m12 3 2.4 6.4H21l-5.2 4 2 6.6L12 16.6 6.2 20l2-6.6L3 9.4h6.6L12 3Z" />
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </>
    ),
    trophy: (
      <>
        <path d="M8 5h8v5a4 4 0 0 1-8 0V5Z" />
        <path d="M8 7H5a3 3 0 0 0 3 3" />
        <path d="M16 7h3a3 3 0 0 1-3 3" />
        <path d="M12 14v3" />
        <path d="M9 20h6" />
      </>
    ),
  };

  return <svg {...props}>{paths[name] || paths.book}</svg>;
}

export function subjectIcon(name = "") {
  const value = name.toLowerCase();
  if (value.includes("math")) return "calc";
  if (value.includes("java") || value.includes("program") || value.includes("code")) {
    return "code";
  }
  if (value.includes("data") || value.includes("dbms")) return "database";
  if (value.includes("software") || value.includes("engineer")) return "gear";
  if (value.includes("network")) return "network";
  if (value.includes("attend")) return "calendar";
  if (value.includes("behaviour") || value.includes("behavior")) return "user";
  return "book";
}

export function shortLabel(name = "") {
  const value = name.toLowerCase();
  if (value.includes("math")) return "Math";
  if (value.includes("java")) return "Java";
  if (value.includes("database") || value.includes("dbms")) return "DBMS";
  if (value.includes("software")) return "SE";
  if (value.includes("network")) return "CN";
  if (value.includes("program")) return "Prog";
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 1) return name.slice(0, 8);
  return words.map((word) => word[0]).join("").slice(0, 4).toUpperCase();
}
