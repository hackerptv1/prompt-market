import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface FollowButtonProps {
  sellerId: string;
  className?: string;
}

export function FollowButton({ sellerId, className = '' }: FollowButtonProps) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Check if user is already following this seller
  const checkFollowStatus = useCallback(async () => {
    if (!user || !sellerId) {
      console.log('FollowButton: No user or sellerId, skipping check', { user: !!user, sellerId });
      setIsCheckingStatus(false);
      return;
    }

    // Don't check follow status if user is trying to follow themselves
    if (user.id === sellerId) {
      console.log('FollowButton: User trying to follow themselves, skipping check');
      setIsCheckingStatus(false);
      return;
    }

    console.log('FollowButton: Checking follow status', { userId: user.id, sellerId });

    // Validate user ID format
    if (!user.id || typeof user.id !== 'string' || user.id.length !== 36) {
      console.error('FollowButton: Invalid user ID format:', user.id);
      setIsCheckingStatus(false);
      return;
    }

    // Validate seller ID format
    if (!sellerId || typeof sellerId !== 'string' || sellerId.length !== 36) {
      console.error('FollowButton: Invalid seller ID format:', sellerId);
      setIsCheckingStatus(false);
      return;
    }

    try {
      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('FollowButton: Session error:', sessionError);
        setIsCheckingStatus(false);
        return;
      }
      
      if (!session) {
        console.log('FollowButton: No active session, skipping follow check');
        setIsCheckingStatus(false);
        return;
      }

      console.log('FollowButton: User authenticated, making query');

      const { data, error } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', sellerId);

      console.log('FollowButton: Follow status check result', { data, error });

      if (error) {
        console.error('Error checking follow status:', error);
        // If it's a 406 error, it might be an authentication issue
        if (error.code === '406') {
          console.error('FollowButton: 406 error - authentication issue detected');
        }
      } else {
        // Check if there are any results (user is following)
        setIsFollowing(data && data.length > 0);
      }
    } catch (err) {
      console.error('Error checking follow status:', err);
    } finally {
      setIsCheckingStatus(false);
    }
  }, [user, sellerId]);

  useEffect(() => {
    checkFollowStatus();
  }, [checkFollowStatus]);

  const handleFollowToggle = async () => {
    if (!user) {
      // Redirect to login or show login modal
      window.location.href = '/auth';
      return;
    }

    if (user.role !== 'buyer') {
      alert('Only buyers can follow sellers');
      return;
    }

    if (user.id === sellerId) {
      alert('You cannot follow yourself');
      return;
    }

    setIsLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', sellerId);

        if (error) throw error;
        setIsFollowing(false);
      } else {
        // Follow
        const { error } = await supabase
          .from('followers')
          .insert({
            follower_id: user.id,
            following_id: sellerId
          });

        if (error) throw error;
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Error toggling follow status:', err);
      alert('Failed to update follow status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button if user is not logged in as a buyer or if it's their own profile
  if (!user || user.role !== 'buyer' || user.id === sellerId) {
    return null;
  }

  if (isCheckingStatus) {
    return (
      <button
        disabled
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-400 cursor-not-allowed ${className}`}
      >
        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
        Loading...
      </button>
    );
  }

  return (
    <button
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isFollowing
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          {isFollowing ? 'Unfollowing...' : 'Following...'}
        </>
      ) : (
        <>
          {isFollowing ? (
            <>
              <UserCheck className="h-4 w-4" />
              Following
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Follow
            </>
          )}
        </>
      )}
    </button>
  );
} 