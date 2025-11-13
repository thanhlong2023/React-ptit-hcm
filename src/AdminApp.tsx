import { Routes, Route, Navigate } from "react-router-dom";
import AdminPage from "./pages/Admin/AdminPage";
import { getStoredUserData } from "./services/authService";

function AdminApp() {
  const user = getStoredUserData();
  if (!user || user.email !== 'admin@gmail.com') {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default AdminApp;
