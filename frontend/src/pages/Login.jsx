import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../auth";
import { Banner } from "../components/Status";

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      await login(email, password);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="login-shell">
      <section className="login-brand">
        <div>
          <div className="eyebrow">Faculty console</div>
          <h1>Student performance prediction</h1>
          <p>
            Enter marks, attendance, and behaviour. The model returns a risk
            level and a subject-level report for the next exam.
          </p>
        </div>
        <p>Admin access only. Students do not log in here.</p>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={onSubmit}>
          <h2>Sign in</h2>
          <p className="muted">Use the admin account from your server .env</p>
          <Banner>{error}</Banner>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <button className="btn" type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </div>
  );
}
