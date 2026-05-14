import { AdminProvider } from './admin/AdminContext';
import { AdminLayout } from './admin/AdminLayout';

export default function Admin() {
  return (
    <AdminProvider>
      <AdminLayout />
    </AdminProvider>
  );
}
