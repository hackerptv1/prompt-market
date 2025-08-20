import React, { useState, useEffect } from 'react';
import { Users, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface RecentFollower {
  id: string;
  name: string;
  avatar: string;
  followedAt: string;
}

export function RecentFollowers() {
  const { user } = useAuth();
  const [followers, setFollowers] = useState<RecentFollower[]>([]);
  const [totalFollowers, setTotalFollowers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentFollowers = async () => {
      if (!user || user.role !== 'seller') {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch recent followers with their profile information
        const { data, error } = await supabase
          .from('followers')
          .select(`
            follower_id,
            created_at,
            profiles!followers_follower_id_fkey (
              id,
              display_name,
              full_name,
              profile_picture_url
            )
          `)
          .eq('following_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching recent followers:', error);
          return;
        }

        // Transform the data
        const recentFollowers: RecentFollower[] = (data || []).map((follow: any) => ({
          id: follow.profiles?.id || follow.follower_id,
          name: follow.profiles?.display_name || follow.profiles?.full_name || 'Unknown User',
          avatar: follow.profiles?.profile_picture_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
          followedAt: follow.created_at,
        }));

        setFollowers(recentFollowers);

        // Get total follower count
        const { data: totalData } = await supabase
          .from('followers')
          .select('id')
          .eq('following_id', user.id);

        setTotalFollowers(totalData?.length || 0);
      } catch (err) {
        console.error('Error fetching recent followers:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentFollowers();
  }, [user]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Recent Followers</h3>
        </div>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 text-sm mt-2">Loading followers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Recent Followers</h3>
        </div>
        <span className="text-sm text-gray-500">
          {totalFollowers} total
        </span>
      </div>

      {followers.length === 0 ? (
        <div className="text-center py-6">
          <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No followers yet</p>
          <p className="text-gray-400 text-xs mt-1">
            Share your profile to gain followers
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {followers.map((follower) => (
            <div 
              key={follower.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <img
                src={follower.avatar}
                alt={follower.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate text-sm">
                  {follower.name}
                </p>
                <p className="text-xs text-gray-500">
                  Followed {formatDistanceToNow(new Date(follower.followedAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
          
          {totalFollowers > 5 && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-center text-sm text-gray-500">
                +{totalFollowers - 5} more followers
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 