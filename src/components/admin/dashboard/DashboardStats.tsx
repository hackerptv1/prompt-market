import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, DollarSign, FileText } from 'lucide-react';
import { supabase } from '../../../utils/supabase';

interface DashboardStatsData {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activePrompts: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activePrompts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        console.log('Fetching dashboard statistics');

        // Get total users
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (userError) {
          console.error('Error fetching user count:', userError);
        }

        // Get total orders and revenue
        const { data: ordersData, error: ordersError } = await supabase
          .from('prompt_purchases')
          .select('payment_amount')
          .eq('payment_status', 'paid');

        if (ordersError) {
          console.error('Error fetching orders data:', ordersError);
        }

        const totalOrders = ordersData?.length || 0;
        const totalRevenue = ordersData?.reduce((sum, order) => sum + order.payment_amount, 0) || 0;

        // Get active prompts
        const { count: promptCount, error: promptError } = await supabase
          .from('prompts')
          .select('*', { count: 'exact', head: true });

        if (promptError) {
          console.error('Error fetching prompt count:', promptError);
        }

        setStats({
          totalUsers: userCount || 0,
          totalOrders,
          totalRevenue,
          activePrompts: promptCount || 0,
        });

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return `$${formatNumber(amount)}`;
  };

  const statsData = [
    {
      label: 'Total Users',
      value: formatNumber(stats.totalUsers),
      icon: <Users className="h-6 w-6" />,
      color: 'blue'
    },
    {
      label: 'Total Orders',
      value: formatNumber(stats.totalOrders),
      icon: <ShoppingBag className="h-6 w-6" />,
      color: 'green'
    },
    {
      label: 'Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: <DollarSign className="h-6 w-6" />,
      color: 'purple'
    },
    {
      label: 'Active Prompts',
      value: formatNumber(stats.activePrompts),
      icon: <FileText className="h-6 w-6" />,
      color: 'amber'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => (
        <div key={stat.label} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className={`p-2 bg-${stat.color}-50 rounded-lg`}>
              {React.cloneElement(stat.icon, { className: `h-6 w-6 text-${stat.color}-600` })}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}