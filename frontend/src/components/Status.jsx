export function Pill({ children, value }) {
  return <span className={`pill ${value || ""}`}>{children || value}</span>;
}

export function Banner({ children }) {
  if (!children) {
    return null;
  }
  return <div className="banner">{children}</div>;
}

export function Empty({ children }) {
  return <p className="muted">{children}</p>;
}
