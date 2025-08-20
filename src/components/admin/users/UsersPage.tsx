import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Shield, Ban, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '../../../utils/supabase';

export function UsersPage() {
  const [selectedRole, setSelectedRole] = useState('all');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [approvingUser, setApprovingUser] = useState<string | null>(null);

  // Fetch users from database
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          role,
          seller_status,
          profile_picture_url,
          created_at,
          display_name,
          description,
          website_url,
          average_rating,
          total_sales,
          total_reviews
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSeller = async (userId: string) => {
    try {
      setApprovingUser(userId);
      
      const { error } = await supabase
        .from('profiles')
        .update({ seller_status: 'active' })
        .eq('id', userId);

      if (error) {
        console.error('Error approving seller:', error);
        alert('Failed to approve seller. Please try again.');
        return;
      }

      // Refresh the users list
      await fetchUsers();
      alert('Seller approved successfully!');
    } catch (error) {
      console.error('Error approving seller:', error);
      alert('Failed to approve seller. Please try again.');
    } finally {
      setApprovingUser(null);
    }
  };

  const handleRejectSeller = async (userId: string) => {
    try {
      setApprovingUser(userId);
      
      const { error } = await supabase
        .from('profiles')
        .update({ seller_status: 'rejected' })
        .eq('id', userId);

      if (error) {
        console.error('Error rejecting seller:', error);
        alert('Failed to reject seller. Please try again.');
        return;
      }

      // Refresh the users list
      await fetchUsers();
      alert('Seller rejected successfully!');
    } catch (error) {
      console.error('Error rejecting seller:', error);
      alert('Failed to reject seller. Please try again.');
    } finally {
      setApprovingUser(null);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      setApprovingUser(userId);
      
      const { error } = await supabase
        .from('profiles')
        .update({ seller_status: 'suspended' })
        .eq('id', userId);

      if (error) {
        console.error('Error suspending user:', error);
        alert('Failed to suspend user. Please try again.');
        return;
      }

      // Refresh the users list
      await fetchUsers();
      alert('User suspended successfully!');
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Failed to suspend user. Please try again.');
    } finally {
      setApprovingUser(null);
    }
  };

  const getStatusBadge = (user: any) => {
    const status = user.seller_status || 'active';
    
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending Approval
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <Ban className="w-3 h-3 mr-1" />
            Suspended
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = selectedRole === 'all' || 
      (selectedRole === 'pending-sellers' ? user.role === 'seller' && user.seller_status === 'pending' : user.role === selectedRole);
    const matchesSearch = searchTerm === '' || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">
            {users.filter(u => u.role === 'seller' && u.seller_status === 'pending').length} sellers pending approval
          </p>
        </div>
        <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
          Export Data
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-lg border-gray-200"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="rounded-lg border-gray-200"
            >
              <option value="all">All Roles</option>
              <option value="buyer">Buyers</option>
              <option value="seller">Sellers</option>
              <option value="pending-sellers">Pending Sellers</option>
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
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">User</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Role</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Join Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Activity</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profile_picture_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                        alt={user.full_name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'seller' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(user)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.role === 'seller' ? (
                      <div>
                        <div>{user.total_sales || 0} sales</div>
                        <div className="text-gray-900">${(user.average_rating || 0).toFixed(1)} rating</div>
                      </div>
                    ) : (
                      <div>
                        <div>Buyer</div>
                        <div className="text-gray-900">Active</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.role === 'seller' && user.seller_status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApproveSeller(user.id)}
                            disabled={approvingUser === user.id}
                            className="p-1 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50"
                            title="Approve Seller"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleRejectSeller(user.id)}
                            disabled={approvingUser === user.id}
                            className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                            title="Reject Seller"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {user.seller_status === 'active' && (
                        <button 
                          onClick={() => handleSuspendUser(user.id)}
                          disabled={approvingUser === user.id}
                          className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                          title="Suspend User"
                        >
                          <Ban className="h-5 w-5" />
                        </button>
                      )}
                      <button className="p-1 text-gray-400 hover:text-gray-500">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {filteredUsers.length} of {users.length} users
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
    </div>
  );
}