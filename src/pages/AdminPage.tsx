import React from 'react';
import { AdminLayout } from '../components/admin/layout/AdminLayout';
import { AdminDashboard } from '../components/admin/dashboard/AdminDashboard';
import { Outlet, useLocation } from 'react-router-dom';

export function AdminPage() {
  const location = useLocation();
  const isRootPath = location.pathname === '/admin';

  return (
    <AdminLayout>
      {isRootPath ? <AdminDashboard /> : <Outlet />}
    </AdminLayout>
  );
}