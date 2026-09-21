import { createContext, useContext, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { clearToken, getToken, loginAdmin, setToken } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      async login(email, password) {
        const result = await loginAdmin(email, password);
        setToken(result.token);
        setTokenState(result.token);
        return result;
      },
      logout() {
        clearToken();
        setTokenState(null);
      },
    }),
    [token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
