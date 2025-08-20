import React from 'react';

export function RecentUsers() {
  const users = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'buyer',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop',
      joinDate: '2024-03-15'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop',
      joinDate: '2024-03-15'
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike@example.com',
      role: 'buyer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop',
      joinDate: '2024-03-15'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Recent Users</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {users.map((user) => (
          <div key={user.id} className="p-6">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="font-medium">{user.name}</div>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <span className="ml-auto px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600">
                {user.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}