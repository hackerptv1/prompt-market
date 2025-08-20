import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PromptCard } from '../../shared/PromptCard';
import { supabase } from '../../../lib/supabase';
import type { Prompt } from '../../../types';

interface SellerPromptsProps {
  sellerId?: string;
}

export function SellerPrompts({ sellerId }: SellerPromptsProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiPlatformLogos, setAiPlatformLogos] = useState<{ [platform: string]: string }>({});
  const [automationPlatformLogos, setAutomationPlatformLogos] = useState<{ [platform: string]: string }>({});
  const [sellerProfile, setSellerProfile] = useState<{ name: string; avatar: string; total_sales?: number }>({ name: 'Anonymous', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' });

  // Memoize platform logos fetching to prevent unnecessary re-fetches
  const fetchPlatformLogos = useCallback(async () => {
    // Only fetch if we don't already have the logos
    if (Object.keys(aiPlatformLogos).length > 0 && Object.keys(automationPlatformLogos).length > 0) {
      return;
    }

    // Fetch AI platform logos
    const { data: aiData, error: aiError } = await supabase
      .from('ai_platform_logos')
      .select('platform_name, logo_url');
    if (!aiError && aiData) {
      const aiLogos: { [platform: string]: string } = {};
      aiData.forEach((row: any) => {
        aiLogos[row.platform_name] = row.logo_url;
      });
      setAiPlatformLogos(aiLogos);
    }

    // Fetch automation platform logos
    const { data: automationData, error: automationError } = await supabase
      .from('automation_platform_logos')
      .select('platform_name, logo_url');
    if (!automationError && automationData) {
      const automationLogos: { [platform: string]: string } = {};
      automationData.forEach((row: any) => {
        automationLogos[row.platform_name] = row.logo_url;
      });
      setAutomationPlatformLogos(automationLogos);
    }
  }, [aiPlatformLogos, automationPlatformLogos]);

  // Memoize seller profile fetching
  const fetchSellerProfile = useCallback(async () => {
    if (!sellerId) return;
    
    // Don't fetch if we already have the profile for this seller
    if (sellerProfile.name !== 'Anonymous' && sellerProfile.name !== 'Unknown Seller') {
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('display_name, full_name, profile_picture_url, total_sales')
      .eq('id', sellerId)
      .single();
    if (!error && data) {
      setSellerProfile({
        name: data.display_name || data.full_name || 'Unknown Seller',
        avatar: data.profile_picture_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        total_sales: data.total_sales || 0,
      });
    }
  }, [sellerId, sellerProfile.name]);

  // Memoize prompts fetching
  const fetchSellerPrompts = useCallback(async () => {
    // Don't fetch if we already have prompts for this seller
    if (prompts.length > 0 && sellerId) {
      const firstPrompt = prompts[0];
      if (firstPrompt.author.id === sellerId) {
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    try {
      if (!sellerId) {
        setPrompts([]);
        return;
      }
      // Fetch prompts for this seller from the database
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });
      if (error || !data) {
        setPrompts([]);
        return;
      }
      // Fetch review statistics for all prompts
      const promptIds = data.map(prompt => prompt.id);
      const { data: reviewsData } = await supabase
        .from('prompt_reviews')
        .select('prompt_id, rating')
        .in('prompt_id', promptIds);

      // Calculate review statistics for each prompt
      const reviewStats: { [promptId: string]: { rating: number; count: number } } = {};
      if (reviewsData) {
        reviewsData.forEach((review: any) => {
          if (!reviewStats[review.prompt_id]) {
            reviewStats[review.prompt_id] = { rating: 0, count: 0 };
          }
          reviewStats[review.prompt_id].rating += review.rating;
          reviewStats[review.prompt_id].count += 1;
        });
        
        // Calculate averages
        Object.keys(reviewStats).forEach(promptId => {
          if (reviewStats[promptId].count > 0) {
            reviewStats[promptId].rating = reviewStats[promptId].rating / reviewStats[promptId].count;
          }
        });
      }

      // Transform the data to match the Prompt type
      const transformedPrompts = data.map(prompt => {
        let thumbnail = '';
        // First check mediaUrls for valid image/video URLs
        if (Array.isArray(prompt.media_urls) && prompt.media_urls.length > 0) {
          const validMediaUrl = prompt.media_urls.find((url: string) =>
            /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|ogg)$/i.test(url)
          );
          if (validMediaUrl) {
            thumbnail = validMediaUrl;
          }
        }
        // If no valid mediaUrl found, try media_links
        if (!thumbnail && Array.isArray(prompt.media_links) && prompt.media_links.length > 0) {
          thumbnail = typeof prompt.media_links[0] === 'string' 
            ? prompt.media_links[0] 
            : prompt.media_links[0].url;
        }
        // Fallback to default image if no media found
        if (!thumbnail) {
          thumbnail = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop';
        }

        // Determine platform type and get appropriate platform info
        const platformType: 'automation' | 'ai' = prompt.product_type === 'automation' ? 'automation' : 'ai';
        let platformName = 'Unknown Platform';
        let platformLogo = '';

        if (platformType === 'automation') {
          // Use automation_platform field for automation products, fallback to ai_platform for backward compatibility
          const automationPlatformName = prompt.automation_platform || prompt.ai_platform;
          platformName = automationPlatformName || 'Unknown Platform';
          platformLogo = automationPlatformLogos[automationPlatformName] || '';
        } else {
          // Use ai_platform field for AI products
          platformName = prompt.ai_platform || 'Unknown Platform';
          platformLogo = aiPlatformLogos[prompt.ai_platform] || '';
        }

        // Fallback logo if no platform logo found
        if (!platformLogo) {
          platformLogo = `data:image/svg+xml;base64,${btoa(`
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#f3f4f6"/>
  <text x="16" y="20" font-family="Arial" font-size="12" fill="#9ca3af" text-anchor="middle">${platformType === 'automation' ? 'Auto' : 'AI'}</text>
</svg>
`)}`;
        }

        return {
          id: prompt.id,
          title: prompt.title || 'Untitled Prompt',
          description: prompt.description || 'No description available',
          price: typeof prompt.price === 'string' ? parseFloat(prompt.price) : prompt.price || 0,
          category: prompt.category || ['Uncategorized'],
          rating: reviewStats[prompt.id]?.rating || 0,
          total_reviews: reviewStats[prompt.id]?.count || 0,
          sales: sellerProfile.total_sales || 0, // Use seller's total_sales
          thumbnail,
          author: {
            id: prompt.seller_id || '',
            name: sellerProfile.name,
            avatar: sellerProfile.avatar,
            sales_count: sellerProfile.total_sales || 0,
          },
          platform: {
            name: platformName,
            logo: platformLogo,
            type: platformType,
          },
          createdAt: prompt.created_at 
            ? new Date(prompt.created_at).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          aiRunningCost: typeof prompt.ai_running_cost === 'string' 
            ? parseFloat(prompt.ai_running_cost) 
            : prompt.ai_running_cost || 0,
          estimatedRunTime: prompt.estimated_run_time || 'N/A',
          productType: prompt.product_type || 'prompt',
          requirements: prompt.requirements || '',
          media_links: prompt.media_links || [],
        };
      });
      setPrompts(transformedPrompts);
    } catch (err) {
      setPrompts([]);
    } finally {
      setIsLoading(false);
    }
  }, [sellerId, aiPlatformLogos, automationPlatformLogos, sellerProfile.name, prompts.length]);

  // Memoize the ScrollablePrompts component to prevent unnecessary re-renders
  const ScrollablePrompts = useMemo(() => {
    return ({ title, items }: { title: string; items: Prompt[] }) => (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <span className="text-sm text-gray-500">{items.length} {items.length === 1 ? 'prompt' : 'prompts'}</span>
        </div>
        <div className="relative">
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
            {items.map((prompt) => (
              <div key={prompt.id} className="flex-none w-[280px] sm:w-[320px] snap-start">
                <PromptCard prompt={prompt} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }, []);

  useEffect(() => {
    fetchPlatformLogos();
  }, [fetchPlatformLogos]);

  useEffect(() => {
    fetchSellerProfile();
  }, [fetchSellerProfile]);

  useEffect(() => {
    fetchSellerPrompts();
  }, [fetchSellerPrompts]);

  if (isLoading) {
    return (
      <div className="py-4 text-center text-gray-500">
        Loading prompts...
      </div>
    );
  }

  if (prompts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <ScrollablePrompts title="Published Prompts" items={prompts} />
    </div>
  );
}