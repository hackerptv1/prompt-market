import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ExternalLink } from 'lucide-react';
import { ExpandableSection } from '../shared/ExpandableSection';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface FollowedSeller {
  id: string;
  name: string;
  avatar: string;
  role: string;
  promptCount: number;
  followers: number;
}

export function FollowedSellers() {
  const { user } = useAuth();
  const [sellers, setSellers] = useState<FollowedSeller[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFollowedSellers = async () => {
      if (!user || user.role !== 'buyer') {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch followed sellers with their profile information
        const { data, error } = await supabase
          .from('followers')
          .select(`
            following_id,
            profiles!followers_following_id_fkey (
              id,
              display_name,
              full_name,
              profile_picture_url,
              description,
              total_sales
            )
          `)
          .eq('follower_id', user.id);

        if (error) {
          console.error('Error fetching followed sellers:', error);
          setSellers([]);
          return;
        }

        // Transform the data and get additional stats
        const followedSellers: FollowedSeller[] = [];
        
        for (const follow of data || []) {
          const profile = (follow as any).profiles;
          if (!profile) continue;

          // Get prompt count for this seller
          const { data: promptData } = await supabase
            .from('prompts')
            .select('id')
            .eq('seller_id', profile.id);

          // Get follower count for this seller
          const { data: followerData } = await supabase
            .from('followers')
            .select('id')
            .eq('following_id', profile.id);

          followedSellers.push({
            id: profile.id,
            name: profile.display_name || profile.full_name || 'Unknown Seller',
            avatar: profile.profile_picture_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
            role: profile.description || 'Prompt Creator',
            promptCount: promptData?.length || 0,
            followers: followerData?.length || 0,
          });
        }

        setSellers(followedSellers);
      } catch (err) {
        console.error('Error fetching followed sellers:', err);
        setSellers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowedSellers();
  }, [user]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Followed Sellers</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading followed sellers...</p>
        </div>
      </div>
    );
  }

  if (sellers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Followed Sellers</h2>
          </div>
          <Link 
            to="/browse"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Discover sellers
          </Link>
        </div>
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">You're not following any sellers yet.</p>
          <Link 
            to="/browse"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Browse prompts to discover sellers
          </Link>
        </div>
      </div>
    );
  }

  const sellerItems = sellers.map((seller) => (
    <div 
      key={seller.id}
      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-200 transition-colors"
    >
      <img
        src={seller.avatar}
        alt={seller.name}
        className="w-12 h-12 rounded-full"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 truncate">{seller.name}</h3>
          <Link 
            to={`/seller/profile/${seller.id}`}
            className="p-1 text-gray-400 hover:text-blue-600"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
        <p className="text-sm text-gray-600 truncate">{seller.role}</p>
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
          <span>{seller.promptCount} prompts</span>
          <span>{seller.followers} followers</span>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Followed Sellers</h2>
        </div>
        <Link 
          to="/browse"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Discover more sellers
        </Link>
      </div>

      <ExpandableSection initialItems={2} items={sellerItems} />
    </div>
  );
}