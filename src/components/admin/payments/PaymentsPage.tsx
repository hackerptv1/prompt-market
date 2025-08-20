import React from 'react';
import { Search, Filter, DollarSign, Download } from 'lucide-react';

export function PaymentsPage() {
  const payments = [
    {
      id: 'PAY-1234',
      user: 'John Doe',
      amount: 29.99,
      status: 'completed',
      method: 'Credit Card',
      date: '2024-03-15',
      orderId: 'ORD-1234'
    },
    {
      id: 'PAY-1235',
      user: 'Jane Smith',
      amount: 49.99,
      status: 'pending',
      method: 'PayPal',
      date: '2024-03-15',
      orderId: 'ORD-1235'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Download className="h-5 w-5" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                className="pl-10 w-full rounded-lg border-gray-200"
              />
            </div>
            <select className="rounded-lg border-gray-200">
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="h-5 w-5" />
              More Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Payment ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">User</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Method</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Order ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{payment.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.user}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm font-medium text-gray-900">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                      {payment.amount}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{payment.method}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{payment.date}</td>
                  <td className="px-6 py-4 text-sm text-blue-600 hover:text-blue-800">
                    <a href={`#${payment.orderId}`}>{payment.orderId}</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}