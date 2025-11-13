import { Routes, Route, Navigate } from "react-router-dom";
import AdminPage from "./pages/Admin/AdminPage";

function AdminApp() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default AdminApp;
