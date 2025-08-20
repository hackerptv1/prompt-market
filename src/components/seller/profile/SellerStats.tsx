import React, { useState, useEffect, useCallback } from 'react';
import { Star, ShoppingBag, Users, UserPlus } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { SocialMediaLinks } from './SocialMediaLinks';

interface SellerData {
  id: string;
  name: string;
  rating?: number;
  reviews_count?: number;
  sales_count?: number;
  social_media?: {
    twitter?: string;
    youtube?: string;
    linkedin?: string;
  };
}

interface SellerStatsProps {
  seller: SellerData | null;
}

export function SellerStats({ seller }: SellerStatsProps) {
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(true);

  // Memoize the fetch function to prevent unnecessary re-creations
  const fetchFollowerCount = useCallback(async () => {
    if (!seller?.id) {
      setIsLoadingFollowers(false);
      return;
    }

    // Don't fetch if we already have the follower count for this seller
    if (followerCount > 0) {
      setIsLoadingFollowers(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('followers')
        .select('id')
        .eq('following_id', seller.id);

      if (error) {
        console.error('Error fetching follower count:', error);
        setFollowerCount(0);
      } else {
        setFollowerCount(data?.length || 0);
      }
    } catch (err) {
      console.error('Error fetching follower count:', err);
      setFollowerCount(0);
    } finally {
      setIsLoadingFollowers(false);
    }
  }, [seller?.id, followerCount]);

  useEffect(() => {
    fetchFollowerCount();
  }, [fetchFollowerCount]);

  if (!seller) return null;

  const formatFollowerCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };
  
  const stats = [
    {
      label: 'Rating',
      value: seller.rating?.toFixed ? seller.rating.toFixed(1) : (seller.rating || 0).toFixed(1),
      icon: <Star className="h-6 w-6 text-amber-400 fill-current" />,
      description: `from ${seller.reviews_count || 0} reviews`,
    },
    {
      label: 'Sales',
      value: seller.sales_count || 0,
      icon: <ShoppingBag className="h-6 w-6 text-blue-600" />,
      description: 'total sales',
    },
    {
      label: 'Followers',
      value: isLoadingFollowers ? '...' : formatFollowerCount(followerCount),
      icon: <Users className="h-6 w-6 text-green-600" />,
      description: 'active followers',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Seller Stats</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-full">
              {stat.icon}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                <span className="text-sm text-gray-500">{stat.description}</span>
              </div>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}