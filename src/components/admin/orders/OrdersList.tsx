import React from 'react';
import { CheckCircle, Clock, XCircle, MoreVertical, ExternalLink } from 'lucide-react';

export function OrdersList() {
  const orders = [
    {
      id: 'ORD-1234',
      prompt: {
        title: 'SEO Blog Generator',
        thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop'
      },
      buyer: {
        name: 'John Doe',
        email: 'john@example.com'
      },
      seller: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
      },
      amount: 29.99,
      status: 'completed',
      paymentMethod: 'Credit Card',
      date: '2024-03-15 10:30 AM'
    },
    {
      id: 'ORD-1235',
      prompt: {
        title: 'Instagram Story Pack',
        thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=100&fit=crop'
      },
      buyer: {
        name: 'Jane Smith',
        email: 'jane@example.com'
      },
      seller: {
        name: 'Mike Wilson',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      amount: 24.99,
      status: 'pending',
      paymentMethod: 'PayPal',
      date: '2024-03-15 09:45 AM'
    },
    {
      id: 'ORD-1236',
      prompt: {
        title: 'Email Marketing Suite',
        thumbnail: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=100&h=100&fit=crop'
      },
      buyer: {
        name: 'Mike Wilson',
        email: 'mike@example.com'
      },
      seller: {
        name: 'Emma Davis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      amount: 39.99,
      status: 'failed',
      paymentMethod: 'Credit Card',
      date: '2024-03-15 09:15 AM'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Order ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Prompt</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Buyer</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Seller</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">{order.id}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={order.prompt.thumbnail}
                      alt={order.prompt.title}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <span className="text-gray-900">{order.prompt.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-gray-900">{order.buyer.name}</div>
                    <div className="text-sm text-gray-500">{order.buyer.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={order.seller.avatar}
                      alt={order.seller.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-gray-900">{order.seller.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">${order.amount}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className={`text-sm font-medium ${
                      order.status === 'completed' ? 'text-green-700' :
                      order.status === 'pending' ? 'text-amber-700' :
                      'text-red-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                      <ExternalLink className="h-5 w-5" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-500">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing 1 to 3 of 3 orders
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}