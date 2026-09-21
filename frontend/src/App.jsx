import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./auth";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import Login from "./pages/Login";
import Report from "./pages/Report";
import StudentForm from "./pages/StudentForm";
import Students from "./pages/Students";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/students/new" element={<StudentForm />} />
        <Route path="/students/:id/edit" element={<StudentForm />} />
        <Route path="/students/:id/report" element={<Report />} />
        <Route path="/insights" element={<Insights />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
