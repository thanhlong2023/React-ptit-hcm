import { useLocation, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import AdminDashboard from './AdminDashboard';
import MovieManagement from './MovieManagement';
import CollectionManagement from './CollectionManagement';
import DataCleanup from './DataCleanup';
import { getStoredUserData } from '../../services/authService';
import { useEffect } from 'react';

export default function AdminPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Kiểm tra xem user có phải admin không, nếu không thì redirect về login
  useEffect(() => {
    const user = getStoredUserData();
    if (!user || user.email !== 'admin@gmail.com') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const user = getStoredUserData();
  // Nếu không phải admin, không render gì
  if (!user || user.email !== 'admin@gmail.com') {
    return null;
  }

  const renderPage = () => {
    const path = location.pathname;
    
    if (path.includes('/admin/movies')) {
      return <MovieManagement />;
    } else if (path.includes('/admin/collections')) {
      return <CollectionManagement />;
    } else if (path.includes('/admin/cleanup')) {
      return <DataCleanup />;
    } else {
      return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout>
      <div>{renderPage()}</div>
    </AdminLayout>
  );
}
