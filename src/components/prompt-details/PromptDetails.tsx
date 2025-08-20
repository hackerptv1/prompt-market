import React, { useState, useEffect } from 'react';
import { Share2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Prompt } from '../../types';
import { MediaGallery } from './MediaGallery/MediaGallery';
import { PromptInfo } from './PromptInfo';
import { IncludedFiles } from './IncludedFiles';
import { RatingSection } from './RatingSection';
import { ReviewSection } from './ReviewSection';
import { SaveButton } from '../shared/SaveButton';
import { SellerInfo } from './SellerInfo';
import { AIPlatformDetails } from '../shared/AIPlatformDetails';
import { PromptPurchaseModal } from './PromptPurchaseModal';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';

interface PromptDetailsProps {
  prompt: Prompt;
}

// Helper to get signed URL for a file in a private bucket
async function getSignedUrl(bucket: 'prompt-media' | 'prompt-files', path: string): Promise<string> {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // Use the full path as stored (including user ID)
  const fullPath = path;
  console.log('fullPath', fullPath);
  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(fullPath, 3600);
    if (!error && data?.signedUrl) return data.signedUrl;
  } catch {}
  // Fallback: try public URL
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${fullPath}`;
  }
  
  return '';
}

function capitalize(word: string) {
  return word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : '';
}

const categoryColors: Record<string, string> = {
  Marketing: 'bg-pink-100 text-pink-700',
  Art: 'bg-green-100 text-green-700',
  Education: 'bg-yellow-100 text-yellow-700',
  Writing: 'bg-blue-100 text-blue-700',
  // Add more categories and colors as needed
  Default: 'bg-gray-100 text-gray-700',
};

export function PromptDetails({ prompt }: PromptDetailsProps) {
  const { user } = useAuth();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(true);
  
  // Use media_links from prompt directly
  const mediaLinks = prompt.media_links || [];
  console.log('[PromptDetails] prompt.media_links:', prompt.media_links);
  console.log('[PromptDetails] mediaLinks passed to MediaGallery:', mediaLinks);
  const [signedMedia, setSignedMedia] = useState<{ type: 'image' | 'video'; url: string }[]>([]);
  const [signedFiles, setSignedFiles] = useState<{ name: string; size: string; type: 'prompt'; format: string; url: string }[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);

  // Check if user has already purchased this prompt
  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (!user) {
        console.log('No user, skipping purchase check');
        setIsCheckingPurchase(false);
        return;
      }

      console.log('Checking purchase status for user:', user.id, 'prompt:', prompt.id);

      try {
        // First, let's check if there are any purchases for this user and prompt
        const { data, error } = await supabase
          .from('prompt_purchases')
          .select('id, payment_status')
          .eq('prompt_id', prompt.id)
          .eq('buyer_id', user.id);

        console.log('Purchase check result:', { data, error, user: user.id, prompt: prompt.id });

        if (!error && data && data.length > 0) {
          // Check if any purchase has payment_status = 'paid' or if payment_status is null (assuming null means paid)
          const hasPaidPurchase = data.some(purchase => 
            purchase.payment_status === 'paid' || purchase.payment_status === null
          );
          console.log('Has paid purchase:', hasPaidPurchase, 'purchases:', data);
          setHasPurchased(hasPaidPurchase);
        } else {
          console.log('No purchases found or error occurred');
          setHasPurchased(false);
        }
      } catch (error) {
        console.error('Error checking purchase status:', error);
        setHasPurchased(false);
      } finally {
        setIsCheckingPurchase(false);
      }
    };

    checkPurchaseStatus();
  }, [user, prompt.id]);

  // Fetch signed URLs for media and files
  useEffect(() => {
    let isMounted = true;
    async function fetchSignedMedia() {
      setIsLoadingMedia(true);
      const arr = await Promise.all(
        (prompt.media_urls || []).map(async (url) => {
          // Check the original filename for video extension before getting signed URL
          const isVideo = /\.(mp4|webm|ogg|mov|avi|mpeg|ogv)$/i.test(url);
          let signedUrl = '';
          try {
            signedUrl = await getSignedUrl('prompt-media', url);
          } catch (err) {
            console.error('Error generating signed URL for media:', url, err);
          }
          console.log(`[PromptDetails] File: ${url}, isVideo: ${isVideo}, signedUrl: ${signedUrl}`);
          return { type: isVideo ? 'video' as const : 'image' as const, url: signedUrl };
        })
      );
      if (isMounted) setSignedMedia(arr);
      setIsLoadingMedia(false);
    }
    async function fetchSignedFiles() {
      setIsLoadingFiles(true);
      const arr = await Promise.all(
        (prompt.fileUrls || []).map(async (url) => {
          let signedUrl = '';
          try {
            signedUrl = await getSignedUrl('prompt-files', url);
          } catch (err) {
            console.error('Error generating signed URL for file:', url, err);
          }
          return {
            name: url.split('/').pop() || 'File',
            size: '',
            type: 'prompt' as 'prompt',
            format: url.split('.').pop() || '',
            url: signedUrl
          };
        })
      );
      if (isMounted) setSignedFiles(arr);
      setIsLoadingFiles(false);
    }
    fetchSignedMedia();
    fetchSignedFiles();
    return () => {
      isMounted = false;
    };
  }, [prompt.media_urls, prompt.fileUrls]);

  const handlePurchaseClick = () => {
    if (!user) {
      // Redirect to auth page
      window.location.href = '/auth';
      return;
    }
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseSuccess = () => {
    setHasPurchased(true);
    setIsPurchaseModalOpen(false);
  };

  const getButtonText = () => {
    if (isCheckingPurchase) return 'Loading...';
    if (hasPurchased) return 'Purchased ';
    return `Buy Now - $${prompt.price.toFixed(2)}`;
  };

  const getButtonClass = () => {
    if (isCheckingPurchase) return 'bg-gray-400 text-white px-8 py-3 rounded-lg transition-colors whitespace-nowrap cursor-not-allowed';
    if (hasPurchased) return 'bg-green-600 text-white px-8 py-3 rounded-lg transition-colors whitespace-nowrap cursor-not-allowed';
    return 'bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap';
  };

  return (
    <div className="bg-white">
      {/* Purchase Modal */}
      <PromptPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        prompt={{
          id: prompt.id,
          title: prompt.title,
          description: prompt.description,
          price: prompt.price,
          ai_platform: prompt.platform.name,
          product_type: prompt.productType,
          seller_id: prompt.author.id || ''
        }}
        seller={{
          id: prompt.author.id || '',
          name: prompt.author.name,
          email: '' // Email not available in author object
        }}
      />

      {/* Hero Section */}
      <div className="relative">
        <MediaGallery media={signedMedia} mediaLinks={mediaLinks} isLoadingLinks={isLoadingMedia} />
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-2">
            <SaveButton promptId={prompt.id} className="p-2" />
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-50">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="space-y-4">
              <div className="flex flex-row flex-wrap items-center gap-2 sm:gap-3">
                {(() => {
                  let categories: string[] = [];
                  if (Array.isArray(prompt.category)) {
                    if (
                      prompt.category.length === 1 &&
                      typeof prompt.category[0] === 'string' &&
                      prompt.category[0].includes(',')
                    ) {
                      // Split the single string into multiple categories
                      categories = prompt.category[0].split(',').map((cat: string) => cat.trim());
                    } else {
                      categories = prompt.category as string[];
                    }
                  } else if (typeof prompt.category === 'string') {
                    categories = (prompt.category as string).split(',').map((cat: string) => cat.trim());
                  }
                  return categories.map((cat: string, idx: number) => {
                    const colorClass = categoryColors[capitalize(cat)] || categoryColors.Default;
                    return (
                      <span
                        key={cat + idx}
                        className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${colorClass}`}
                      >
                        {capitalize(cat)}
                      </span>
                    );
                  });
                })()}
                <div className="flex items-center text-amber-400">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="ml-1 font-medium">{(prompt.rating ?? 0).toFixed(1)}</span>
                  <span className="ml-1 text-gray-600">({prompt.total_reviews ?? 0} reviews)</span>
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                {prompt.title}
              </h1>
              {/* AI Platform Details */}
              <div className="border-t border-gray-100 pt-4">
                <AIPlatformDetails
                  platform={prompt.platform}
                  cost={prompt.aiRunningCost}
                  time={prompt.estimatedRunTime}
                />
              </div>
            </div>
            {/* Desktop Buy Button */}
            <div className="hidden lg:flex items-center gap-4 mt-6">
              <button 
                onClick={handlePurchaseClick}
                disabled={isCheckingPurchase || hasPurchased}
                className={getButtonClass()}
              >
                {getButtonText()}
              </button>
            </div>
          </div>
        </div>
        {/* Seller Info */}
        <div className="mt-8">
          <SellerInfo author={prompt.author} />
        </div>
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <PromptInfo prompt={prompt} />
            <div className="lg:hidden">
              {isLoadingFiles ? (
                <div className="text-gray-400 text-center py-6">Loading files...</div>
              ) : signedFiles.length > 0 ? (
                <IncludedFiles files={signedFiles} />
              ) : (
                <div className="text-gray-400 text-center py-6">No files available</div>
              )}
            </div>
            <RatingSection 
              ratings={[]} 
              stats={{ average: (prompt.rating ?? 0), total: (prompt.total_reviews ?? 0), distribution: [] }} 
            />
            <ReviewSection promptId={prompt.id} />
          </div>
          {/* Right Column */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Mobile Buy Button */}
              <div className="lg:hidden">
                <button 
                  onClick={handlePurchaseClick}
                  disabled={isCheckingPurchase || hasPurchased}
                  className={`w-full ${getButtonClass()}`}
                >
                  {getButtonText()}
                </button>
              </div>
              {isLoadingFiles ? (
                <div className="text-gray-400 text-center py-6">Loading files...</div>
              ) : signedFiles.length > 0 ? (
                <IncludedFiles files={signedFiles} />
              ) : (
                <div className="text-gray-400 text-center py-6">No files available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}