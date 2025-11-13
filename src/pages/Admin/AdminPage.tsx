import { useLocation } from 'react-router-dom';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import AdminDashboard from './AdminDashboard';
import MovieManagement from './MovieManagement';
import CollectionManagement from './CollectionManagement';
import DataCleanup from './DataCleanup';

export default function AdminPage() {
  const location = useLocation();

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
