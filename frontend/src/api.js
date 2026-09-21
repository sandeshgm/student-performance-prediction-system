const TOKEN_KEY = "spps_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && !path.includes("/api/admin/login")) {
      clearToken();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const loginAdmin = (email, password) =>
  api("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const getDashboard = (params) =>
  api(`/api/students/dashboard${toQuery(params)}`);

export const getStudents = (params) =>
  api(`/api/students${toQuery(params)}`);

export const getStudent = (id) => api(`/api/students/${id}`);

export const createStudent = (payload) =>
  api("/api/students", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateStudent = (id, payload) =>
  api(`/api/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteStudent = (id) =>
  api(`/api/students/${id}`, { method: "DELETE" });

export const getStudentReport = (id) => api(`/api/students/report/${id}`);

export const getTopPerformers = (limit = 5) =>
  api(`/api/students/report/top-performers?limit=${limit}`);

export const getFeatureImportance = () =>
  api("/api/students/feature-importance");

export const updateFeatureImportance = (weights) =>
  api("/api/students/feature-importance", {
    method: "PUT",
    body: JSON.stringify(weights),
  });

export const getModelAccuracy = () => api("/api/students/model-accuracy");

function toQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}
