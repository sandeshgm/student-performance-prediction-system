import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../auth";
import { Icon } from "../components/Icons";
import { Banner } from "../components/Status";
import { MdAnalytics } from "react-icons/md";
import { toast } from "react-toastify";

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      toast.success("Logged in successfully!");
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-100">
      <section className="hidden lg:flex flex-col justify-between bg-[#125887] text-white p-12 xl:p-16">
        <div>
          <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
            Faculty portal
          </div>

          <h1 className="max-w-xl text-4xl xl:text-5xl font-bold leading-tight">
            Student performance prediction
          </h1>

          <p className="mt-6 max-w-lg text-base xl:text-lg leading-7 text-blue-50">
            Record attendance, marks, and student classroom behaviour. Get a clear
            picture of who may need extra support before exams.
          </p>
        </div>

        <p className="max-w-md text-sm leading-6 text-blue-100">
          For teachers and coordinators only. Students cannot sign in here.
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-white px-6 py-10 sm:px-10">
        <form
          className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-xl border border-slate-100"
          onSubmit={onSubmit}
        >
          <div>
            <MdAnalytics className="mx-auto h-12 w-12 text-[#125887]" />
          </div>
          <h2 className="text-2xl font-bold text-center text-[#125887]">
            StuPredict
          </h2>

          <p className="mt-2 text-sm text-slate-500 text-center">
            Enter your email and password
          </p>

          <div className="mt-5 text-red-500">
            <Banner>{error}</Banner>
          </div>

          <div className="mt-5">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#125887] focus:ring-2 focus:ring-[#125887]/20"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#125887] focus:ring-2 focus:ring-[#125887]/20"
              />

              <button
                type="button"
                className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-slate-500 transition hover:text-[#125887]"
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                onClick={() =>
                  setShowPassword((current) => !current)
                }
              >
                <Icon
                  name={showPassword ? "eyeOff" : "eye"}
                  size={18}
                />
              </button>
            </div>
          </div>

          <button
            className="mt-6 w-full rounded-lg bg-[#125887] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0e476d] focus:outline-none focus:ring-2 focus:ring-[#125887]/30 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={pending}
          >
            {pending ? "Logging in…" : "Login"}
          </button>
        </form>
      </section>
    </div>
  );
}