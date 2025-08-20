import React, { useState } from 'react';
import { MapPin, Calendar, StarIcon, Users } from 'lucide-react';
import { FollowButton } from '../../shared/FollowButton';
import { SocialMediaLinks } from './SocialMediaLinks';

interface SellerData {
  id: string;
  name: string;
  avatar_url: string;
  bio?: string;
  rating?: number;
  reviews_count?: number;
  social_media?: {
    twitter?: string;
    youtube?: string;
    linkedin?: string;
  };
}

interface SellerHeaderProps {
  seller: SellerData | null;
}

export function SellerHeader({ seller }: SellerHeaderProps) {
  const [showSocials, setShowSocials] = useState(false);
  
  if (!seller) return null;
  
  return (
    <div className="bg-gradient-to-r from-blue-700 to-indigo-800 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={seller.avatar_url}
            alt={seller.name}
            className="w-24 h-24 rounded-full border-4 border-white shadow-md"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{seller.name}</h1>
            <div className="mt-2 flex flex-wrap justify-center md:justify-start items-center gap-4">
              <div className="flex items-center gap-1">
                <StarIcon className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="text-white font-medium">{seller.rating?.toFixed ? seller.rating.toFixed(1) : (seller.rating || 0).toFixed(1)}</span>
                <span className="text-blue-100">({seller.reviews_count || 0} reviews)</span>
              </div>
              <span className="text-blue-100">|</span>
              <span className="text-blue-100">Prompt Engineer & Content Creator</span>
            </div>
            {/* Socials button positioned under the reviews text */}
            <div className="mt-4 flex justify-center md:justify-start">
              <button
                onClick={() => setShowSocials(!showSocials)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200 border border-white/20 hover:border-white/30"
              >
                <Users className="h-4 w-4" />
                <span className="font-medium">Socials</span>
              </button>
            </div>
            {seller.bio && (
              <p className="mt-3 text-blue-100 max-w-2xl">{seller.bio}</p>
            )}
          </div>
          <div className="flex flex-col items-center gap-3">
            <FollowButton sellerId={seller.id} />
          </div>
        </div>
        <SocialMediaLinks 
          socialMedia={seller.social_media || {}} 
          isVisible={showSocials} 
        />
      </div>
    </div>
  );
}