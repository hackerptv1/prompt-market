import React from 'react';
import { DashboardStats } from './DashboardStats';
import { RecentOrders } from './RecentOrders';
import { RecentUsers } from './RecentUsers';
import { RevenueChart } from './RevenueChart';
import { PopularPrompts } from './PopularPrompts';
import { SystemStatus } from './SystemStatus';
import { ConsultationCleanup } from './ConsultationCleanup';

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      <DashboardStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <SystemStatus />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders />
        <RecentUsers />
      </div>
      <PopularPrompts />
      <ConsultationCleanup />
    </div>
  );
}