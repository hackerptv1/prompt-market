import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import { supabase } from '../../../utils/supabase';

interface PromptPurchase {
  id: string;
  payment_amount: number;
  payment_status: string;
  purchase_date: string;
  prompt: {
    title: string;
  };
  buyer: {
    name: string;
  };
  seller: {
    name: string;
  };
}

export function RecentOrders() {
  const [orders, setOrders] = useState<PromptPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        console.log('Fetching recent prompt purchases for admin');

        const { data, error } = await supabase
          .from('prompt_purchases')
          .select(`
            id,
            payment_amount,
            payment_status,
            purchase_date,
            prompt:prompts(title),
            buyer:profiles!prompt_purchases_buyer_id_fkey(full_name),
            seller:profiles!prompt_purchases_seller_id_fkey(full_name)
          `)
          .order('purchase_date', { ascending: false })
          .limit(10);

        console.log('Recent orders result:', { data, error });

        if (error) {
          console.error('Error fetching recent orders:', error);
        } else {
          // Transform the data to match our interface
          const transformedData = (data || []).map((item: any) => ({
            id: item.id,
            payment_amount: item.payment_amount,
            payment_status: item.payment_status,
            purchase_date: item.purchase_date,
            prompt: {
              title: item.prompt?.title || 'Unknown Prompt'
            },
            buyer: {
              name: item.buyer?.full_name || 'Unknown Buyer'
            },
            seller: {
              name: item.seller?.full_name || 'Unknown Seller'
            }
          }));
          
          setOrders(transformedData);
        }
      } catch (err) {
        console.error('Error in fetchRecentOrders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
        </div>
        <div className="p-6 text-center text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No recent orders found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Recent Orders</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {orders.map((order) => (
          <div key={order.id} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.payment_status)}
                  <span className="font-medium">#{order.id.slice(0, 8)}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{order.prompt?.title || 'Unknown Prompt'}</p>
                <p className="text-xs text-gray-500">
                  Buyer: {order.buyer?.name || 'Unknown'} | Seller: {order.seller?.name || 'Unknown'}
                </p>
              </div>
              <div className="text-right">
                <div className="font-medium">${order.payment_amount.toFixed(2)}</div>
                <p className="text-sm text-gray-600">{formatDate(order.purchase_date)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}