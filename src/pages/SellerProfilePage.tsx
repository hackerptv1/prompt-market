import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { SellerHeader } from '../components/seller/profile/SellerHeader';
import { SellerStats } from '../components/seller/profile/SellerStats';
import { SellerPrompts } from '../components/seller/profile/SellerPrompts';
import { ConsultationSection } from '../components/seller/profile/ConsultationSection';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface SellerData {
  id: string;
  name: string;
  avatar_url: string;
  bio: string;
  rating: number;
  reviews_count: number;
  sales_count: number;
  social_media?: {
    twitter?: string;
    youtube?: string;
    linkedin?: string;
  };
  media_links?: Array<{
    id: string;
    title: string;
    url: string;
    platform: string;
  }>;
}

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function SellerProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the seller ID to prevent unnecessary re-renders
  const sellerId = useMemo(() => {
    if (id) return id;
    if (user && user.role === 'seller') return user.id;
    return null;
  }, [id, user?.id, user?.role]);

  // Memoize the fetch function to prevent unnecessary re-creations
  const fetchSellerProfile = useCallback(async () => {
    // Don't fetch if we already have the data for this seller
    if (seller && seller.id === sellerId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // If no ID provided and user is a seller, show own profile
      if (!id && user && user.role === 'seller') {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, full_name, profile_picture_url, description, average_rating, total_reviews, total_sales, social_media, media_links')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setSeller({
          id: data.id,
          name: data.display_name || data.full_name || 'Unknown Seller',
          avatar_url: data.profile_picture_url || '',
          bio: data.description || '',
          rating: data.average_rating || 0,
          reviews_count: data.total_reviews || 0,
          sales_count: data.total_sales || 0,
          social_media: data.social_media || {},
          media_links: data.media_links || []
        });
      } 
      // If ID provided, validate it's a UUID and fetch that specific seller's profile
      else if (id) {
        // Check if the ID is a valid UUID
        if (!isValidUUID(id)) {
          setError('Invalid seller ID format. Please check the URL.');
          setSeller(null);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, full_name, profile_picture_url, description, average_rating, total_reviews, total_sales, social_media, media_links')
          .eq('id', id)
          .eq('role', 'seller')
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            setError('Seller not found. The profile may not exist or may have been removed.');
          } else {
            throw error;
          }
          setSeller(null);
          return;
        }
        
        setSeller({
          id: data.id,
          name: data.display_name || data.full_name || 'Unknown Seller',
          avatar_url: data.profile_picture_url || '',
          bio: data.description || '',
          rating: data.average_rating || 0,
          reviews_count: data.total_reviews || 0,
          sales_count: data.total_sales || 0,
          social_media: data.social_media || {},
          media_links: data.media_links || []
        });
      } 
      // If no ID and user is not a seller, show an error
      else {
        setError('No seller profile specified. Please provide a valid seller ID in the URL.');
        setSeller(null);
      }
    } catch (err) {
      console.error('Error fetching seller profile:', err);
      setError('Failed to load seller profile. Please try again later.');
      setSeller(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, user?.id, user?.role, seller?.id]);

  useEffect(() => {
    // Only fetch if we have a valid seller ID and we don't already have the data
    if (sellerId && (!seller || seller.id !== sellerId)) {
      fetchSellerProfile();
    } else if (!sellerId) {
      // If no valid seller ID, set loading to false
      setIsLoading(false);
    }
  }, [sellerId, fetchSellerProfile, seller?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.history.back()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Seller Not Found</h2>
          <p className="text-gray-600 mb-4">The seller profile you're looking for doesn't exist.</p>
          <button 
            onClick={() => window.history.back()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerHeader seller={seller} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <SellerStats seller={seller} />
        <ConsultationSection seller={seller} />
        <SellerPrompts sellerId={seller?.id} />
      </div>
    </div>
  );
}