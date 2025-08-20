import React from 'react';
import { Calendar, Clock, Video, MoreVertical, ExternalLink } from 'lucide-react';

export function BookingsList() {
  const bookings = [
    {
      id: 'BK-1234',
      expert: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        specialty: 'Marketing Expert'
      },
      client: {
        name: 'John Doe',
        email: 'john@example.com'
      },
      date: '2024-03-20',
      time: '10:00 AM',
      duration: '60 min',
      status: 'upcoming',
      amount: 149.99,
      meetingUrl: 'https://meet.google.com/abc-defg-hij'
    },
    {
      id: 'BK-1235',
      expert: {
        name: 'Michael Chen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        specialty: 'AI Developer'
      },
      client: {
        name: 'Jane Smith',
        email: 'jane@example.com'
      },
      date: '2024-03-19',
      time: '2:00 PM',
      duration: '30 min',
      status: 'completed',
      amount: 99.99
    },
    {
      id: 'BK-1236',
      expert: {
        name: 'Emma Davis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        specialty: 'Content Strategist'
      },
      client: {
        name: 'Mike Wilson',
        email: 'mike@example.com'
      },
      date: '2024-03-18',
      time: '11:30 AM',
      duration: '45 min',
      status: 'cancelled',
      amount: 129.99
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Booking ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Expert</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Client</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Schedule</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">{booking.id}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={booking.expert.avatar}
                      alt={booking.expert.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{booking.expert.name}</div>
                      <div className="text-sm text-gray-500">{booking.expert.specialty}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-gray-900">{booking.client.name}</div>
                    <div className="text-sm text-gray-500">{booking.client.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{booking.time}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">${booking.amount}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    booking.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {booking.status === 'upcoming' && booking.meetingUrl && (
                      <a
                        href={booking.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      >
                        <Video className="h-5 w-5" />
                      </a>
                    )}
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
            Showing 1 to 3 of 3 bookings
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