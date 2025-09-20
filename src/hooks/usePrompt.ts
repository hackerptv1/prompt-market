import { useState, useEffect } from 'react';
import type { Prompt } from '../types';
import { supabase } from '../lib/supabase';
import { DEFAULT_PLACEHOLDER_IMAGE } from '../utils/constants';
import { fetchAILogos } from '../utils/aiLogos';
import { fetchAutomationLogos } from '../utils/automationLogos';

// Default placeholder images
const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop';
const DEFAULT_AVATAR = 'https://placehold.co/100x100/f3f4f6/9ca3af?text=U';

export function usePrompt(id: string | undefined) {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setPrompt(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchPrompt = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching prompt with ID:', id);
        
        // First, verify the ID format
        if (!/^[a-zA-Z0-9-]+$/.test(id)) {
          throw new Error('Invalid prompt ID format');
        }

        // Fetch platform logos
        const [aiPlatforms, automationPlatforms] = await Promise.all([
          fetchAILogos(),
          fetchAutomationLogos()
        ]);

        // Fetch the prompt data
        const { data: promptData, error: promptError } = await supabase
          .from('prompts')
          .select('*')
          .eq('id', id)
          .single();

        if (promptError) {
          console.error('Error fetching prompt:', promptError);
          setError(promptError.message);
          setPrompt(null);
          return;
        }

        if (!promptData) {
          setError('Prompt not found');
          setPrompt(null);
          return;
        }

        // Fetch categories for the prompt
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .in('id', promptData.category_id);

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
          setError(categoriesError.message);
          setPrompt(null);
          return;
        }

        // Extract category names
        const categoryNames = categoriesData?.map(cat => cat.name) || ['Unknown'];
          
        // Fetch seller info from profiles table
        let sellerName = 'Anonymous';
        let sellerAvatar = DEFAULT_AVATAR;
        let sellerRating = 4.5;
        let sellerTotalReviews = 0;
        let sellerTotalSales = 0;
        if (promptData.seller_id) {
          const { data: sellerProfile, error: sellerError } = await supabase
            .from('profiles')
            .select('display_name, full_name, profile_picture_url, average_rating, total_reviews, total_sales')
            .eq('id', promptData.seller_id)
            .single();
          if (!sellerError && sellerProfile) {
            sellerName = sellerProfile.display_name || sellerProfile.full_name || 'Anonymous';
            sellerAvatar = sellerProfile.profile_picture_url || DEFAULT_AVATAR;
            sellerRating = sellerProfile.average_rating || 4.5;
            sellerTotalReviews = sellerProfile.total_reviews || 0;
            sellerTotalSales = sellerProfile.total_sales || 0;
          }
        }
        console.log('Seller name:', sellerName);

        // Determine platform type and get logo
        const platformType = promptData.product_type === 'automation' ? 'automation' : 'ai' as const;
        let platformName = 'Unknown Platform';
        let platformLogo = '';
        
        if (platformType === 'automation') {
          // Use automation_platform field for automation products, fallback to ai_platform for backward compatibility
          const automationPlatformName = promptData.automation_platform || promptData.ai_platform;
          const automationPlatform = automationPlatforms.find(
            (p: { platform_name: string }) => p.platform_name === automationPlatformName
          );
          platformName = automationPlatformName || 'Unknown Platform';
          platformLogo = automationPlatform?.logo_url || '';
        } else {
          // Use ai_platform field for AI products
          const aiPlatform = aiPlatforms.find(
            (p: { platform_name: string }) => p.platform_name === promptData.ai_platform
          );
          platformName = promptData.ai_platform || 'Unknown Platform';
          platformLogo = aiPlatform?.logo_url || '';
        }

        // Fetch all categories to map UUIDs to names
        const { data: allCategories } = await supabase
          .from('categories')
          .select('id, name');
        
        // Create a lookup map for categories
        const categoryMap: { [key: string]: string } = {};
        allCategories?.forEach(cat => {
          categoryMap[cat.id] = cat.name;
        });

        // Fetch review statistics for this prompt
        const { data: reviewsData } = await supabase
          .from('prompt_reviews')
          .select('rating')
          .eq('prompt_id', promptData.id);

        // Calculate review statistics
        let promptRating = 0;
        let promptReviewCount = 0;
        if (reviewsData && reviewsData.length > 0) {
          const totalRating = reviewsData.reduce((sum: number, review: any) => sum + (review.rating || 0), 0);
          promptRating = totalRating / reviewsData.length;
          promptReviewCount = reviewsData.length;
        }

        // Use media_urls and prompt_file_urls directly
        const mediaUrls = Array.isArray(promptData.media_urls) ? promptData.media_urls : [];
        const fileUrls = Array.isArray(promptData.prompt_file_urls) ? promptData.prompt_file_urls : [];

        // Transform database data to match Prompt type
        const transformedPrompt: Prompt = {
          id: promptData.id,
          title: promptData.title || 'Untitled Prompt',
          description: promptData.description || 'No description available',
          requirements: promptData.requirements || 'No specific requirements listed',
          price: typeof promptData.price === 'string' ? parseFloat(promptData.price) : promptData.price || 0,
          category: Array.isArray(promptData.category) 
            ? promptData.category.map((catId: string) => categoryMap[catId] || catId)
            : (promptData.category || 'Uncategorized'),
          rating: promptRating,
          total_reviews: promptReviewCount,
          sales: 0,
          thumbnail: promptData.thumbnail || DEFAULT_PLACEHOLDER_IMAGE,
          media_urls: promptData.media_urls || [],
          fileUrls: fileUrls, // Map prompt_file_urls to fileUrls
          media_links: promptData.media_links || [],
          author: {
            id: promptData.seller_id || '',
            name: sellerName,
            avatar: sellerAvatar,
            rating: sellerRating,
            total_reviews: sellerTotalReviews,
            sales_count: sellerTotalSales,
          },
          platform: {
            name: platformName,
            logo: platformLogo,
            type: platformType
          },
          createdAt: promptData.created_at || new Date().toISOString(),
          aiRunningCost: promptData.ai_running_cost || 0,
          estimatedRunTime: promptData.estimated_run_time || 'N/A',
          productType: promptData.product_type || 'prompt',
        };
        
        setPrompt(transformedPrompt);
      } catch (err) {
        console.error('Unexpected error fetching prompt:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        setPrompt(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompt();
  }, [id]);

  return { prompt, isLoading, error };
}