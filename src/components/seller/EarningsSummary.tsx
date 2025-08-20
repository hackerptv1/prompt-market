import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShoppingCart, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';

interface EarningsData {
  totalEarnings: number;
  monthlyEarnings: number;
  totalSales: number;
  activeCustomers: number;
}

export function EarningsSummary() {
  const { user } = useAuth();
  const [stats, setStats] = useState<EarningsData>({
    totalEarnings: 0,
    monthlyEarnings: 0,
    totalSales: 0,
    activeCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarningsData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching earnings data for seller:', user.id);

        // Get seller's total sales from profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('total_sales')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile data:', profileError);
        }

        // Get total earnings from prompt purchases
        const { data: purchasesData, error: purchasesError } = await supabase
          .from('prompt_purchases')
          .select('payment_amount, purchase_date, buyer_id')
          .eq('seller_id', user.id)
          .eq('payment_status', 'paid');

        if (purchasesError) {
          console.error('Error fetching purchases data:', purchasesError);
        }

        // Calculate earnings
        const totalEarnings = purchasesData?.reduce((sum, purchase) => sum + purchase.payment_amount, 0) || 0;
        
        // Calculate monthly earnings (current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyEarnings = purchasesData?.reduce((sum, purchase) => {
          const purchaseDate = new Date(purchase.purchase_date);
          if (purchaseDate.getMonth() === currentMonth && purchaseDate.getFullYear() === currentYear) {
            return sum + purchase.payment_amount;
          }
          return sum;
        }, 0) || 0;

        // Get unique customers count
        const uniqueCustomers = new Set(purchasesData?.map(purchase => purchase.buyer_id) || []).size;

        setStats({
          totalEarnings,
          monthlyEarnings,
          totalSales: profileData?.total_sales || 0,
          activeCustomers: uniqueCustomers,
        });

      } catch (error) {
        console.error('Error fetching earnings data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-semibold">Earnings Summary</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-semibold">Earnings Summary</h2>

      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-blue-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-sm text-blue-600">Total Earnings</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-700">
            ${stats.totalEarnings.toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-green-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-sm text-green-600">Monthly Earnings</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-green-700">
            ${stats.monthlyEarnings.toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-gray-600">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <span className="text-sm text-gray-600">Total Sales</span>
            </div>
            <div className="mt-2 text-xl font-bold text-gray-900">
              {stats.totalSales}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-gray-600">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-sm text-gray-600">Customers</span>
            </div>
            <div className="mt-2 text-xl font-bold text-gray-900">
              {stats.activeCustomers}
            </div>
          </div>
        </div>
      </div>

      {/* Sales Trend Chart would go here */}
      <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
        Sales Trend Chart
      </div>
    </div>
  );
}