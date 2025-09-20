import { useState, useEffect } from 'react';
import type { Prompt } from '../types';
import { supabase } from '../utils/supabase';

interface RelatedPromptsResult {
  prompts: Prompt[];
  isLoading: boolean;
  error: string | null;
}

export function useRelatedPrompts(currentPromptId: string, categories: string[]): RelatedPromptsResult {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRelatedPrompts() {
      console.log('useRelatedPrompts: Starting fetch for prompt:', currentPromptId, 'categories:', categories);
      
      if (!currentPromptId || !categories || categories.length === 0) {
        console.log('useRelatedPrompts: Missing required data, returning empty');
        setPrompts([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // First, we need to get the category UUIDs from the category names
        console.log('useRelatedPrompts: Fetching category UUIDs for:', categories);
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .in('name', categories);

        if (categoryError) {
          console.error('Error fetching categories:', categoryError);
          setError('Failed to load related prompts');
          return;
        }

        if (!categoryData || categoryData.length === 0) {
          console.log('No categories found for:', categories);
          setPrompts([]);
          return;
        }

        console.log('useRelatedPrompts: Found categories:', categoryData);
        const categoryIds = categoryData.map(cat => cat.id);
        let relatedPrompts: Prompt[] = [];
        
        // Get all subcategories for the current prompt's categories
        console.log('useRelatedPrompts: Fetching subcategories for category IDs:', categoryIds);
        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from('subcategories')
          .select('id, name, category_id')
          .in('category_id', categoryIds);

        if (subcategoriesError) {
          console.error('Error fetching subcategories:', subcategoriesError);
        }

        // Fetch all potential related prompts (both subcategory and category level)
        let allPotentialPrompts: any[] = [];
        
        if (subcategoriesData && subcategoriesData.length > 0) {
          console.log('useRelatedPrompts: Found subcategories:', subcategoriesData);
          const subcategoryIds = subcategoriesData.map(sub => sub.id);
          
          // Fetch prompts that share any subcategories
          console.log('useRelatedPrompts: Searching for prompts with subcategory IDs:', subcategoryIds);
          const { data: subcategoryPrompts, error: subcategoryError } = await supabase
            .from('prompts')
            .select(`
              id,
              title,
              description,
              requirements,
              price,
              category,
              media_urls,
              media_links,
              ai_platform,
              estimated_run_time,
              ai_running_cost,
              product_type,
              seller_id,
              created_at
            `)
            .neq('id', currentPromptId)
            .contains('category', subcategoryIds)
            .limit(20); // Get more to have better selection

          if (subcategoryError) {
            console.error('Error fetching subcategory prompts:', subcategoryError);
          } else if (subcategoryPrompts) {
            console.log('useRelatedPrompts: Found subcategory prompts:', subcategoryPrompts.length);
            allPotentialPrompts = [...allPotentialPrompts, ...subcategoryPrompts];
          }
        }

        // Also fetch prompts that share categories (but not necessarily subcategories)
        console.log('useRelatedPrompts: Searching for prompts with category IDs:', categoryIds);
        const { data: categoryPrompts, error: categoryPromptsError } = await supabase
          .from('prompts')
          .select(`
            id,
            title,
            description,
            requirements,
            price,
            category,
            media_urls,
            media_links,
            ai_platform,
            estimated_run_time,
            ai_running_cost,
            product_type,
            seller_id,
            created_at
          `)
          .neq('id', currentPromptId)
          .contains('category', categoryIds)
          .limit(20); // Get more to have better selection

        if (categoryPromptsError) {
          console.error('Error fetching category prompts:', categoryPromptsError);
        } else if (categoryPrompts) {
          console.log('useRelatedPrompts: Found category prompts:', categoryPrompts.length);
          allPotentialPrompts = [...allPotentialPrompts, ...categoryPrompts];
        }

        // Remove duplicates and score prompts by category/subcategory overlap
        const uniquePrompts = allPotentialPrompts.filter((prompt, index, self) => 
          index === self.findIndex(p => p.id === prompt.id)
        );

        console.log('useRelatedPrompts: Total unique prompts found:', uniquePrompts.length);

        if (uniquePrompts.length > 0) {
          console.log('useRelatedPrompts: Scoring', uniquePrompts.length, 'unique prompts');
          console.log('useRelatedPrompts: Current prompt category IDs:', categoryIds);
          console.log('useRelatedPrompts: Available subcategory IDs:', subcategoriesData ? subcategoriesData.map(sub => sub.id) : 'none');
          
          // Score and sort prompts by relevance (most matching categories/subcategories first)
          const scoredPrompts = uniquePrompts.map(prompt => {
            const promptCategories = Array.isArray(prompt.category) ? prompt.category : [prompt.category];
            
            // Count matching categories
            const matchingCategories = promptCategories.filter(catId => categoryIds.includes(catId)).length;
            
            // Count matching subcategories (if we have subcategory data)
            let matchingSubcategories = 0;
            if (subcategoriesData && subcategoriesData.length > 0) {
              const subcategoryIds = subcategoriesData.map(sub => sub.id);
              matchingSubcategories = promptCategories.filter(catId => subcategoryIds.includes(catId)).length;
            }
            
            // Calculate relevance score (subcategories weighted higher than categories)
            const relevanceScore = (matchingSubcategories * 3) + matchingCategories;
            
            console.log(`Prompt ${prompt.id}: categories=[${promptCategories.join(',')}], matching categories=${matchingCategories}, matching subcategories=${matchingSubcategories}, score=${relevanceScore}`);
            
            return {
              ...prompt,
              relevanceScore,
              matchingCategories,
              matchingSubcategories
            };
          });

          // Sort by relevance score (highest first) and take top 10
          const topPrompts = scoredPrompts
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, 10);

          console.log('useRelatedPrompts: Top scored prompts:', topPrompts.map(p => ({ id: p.id, score: p.relevanceScore, categories: p.matchingCategories, subcategories: p.matchingSubcategories })));
          
          relatedPrompts = await transformPromptsData(topPrompts);
        } else {
          console.log('useRelatedPrompts: No unique prompts found to score');
        }

        // If we don't have enough prompts, implement progressive fallback strategy
        if (relatedPrompts.length < 3) {
          console.log('useRelatedPrompts: Not enough high-relevance prompts, implementing fallback strategy');
          
          // Fallback 1: Try to find prompts with ANY matching subcategory
          if (subcategoriesData && subcategoriesData.length > 0) {
            console.log('useRelatedPrompts: Fallback 1 - searching for ANY subcategory match');
            const subcategoryIds = subcategoriesData.map(sub => sub.id);
            
            for (const subId of subcategoryIds) {
              if (relatedPrompts.length >= 3) break;
              
              const { data: fallbackPrompts, error: fallbackError } = await supabase
                .from('prompts')
                .select(`
                  id,
                  title,
                  description,
                  requirements,
                  price,
                  category,
                  media_urls,
                  prompt_file_urls,
                  media_links,
                  ai_platform,
                  estimated_run_time,
                  ai_running_cost,
                  product_type,
                  seller_id,
                  created_at
                `)
                .neq('id', currentPromptId)
                .contains('category', [subId])
                .limit(5);

              if (!fallbackError && fallbackPrompts && fallbackPrompts.length > 0) {
                console.log(`useRelatedPrompts: Found ${fallbackPrompts.length} prompts for subcategory ${subId}`);
                
                const existingIds = new Set(relatedPrompts.map(p => p.id));
                const newPrompts = await transformPromptsData(fallbackPrompts);
                const uniqueNewPrompts = newPrompts.filter(p => !existingIds.has(p.id));
                
                relatedPrompts = [...relatedPrompts, ...uniqueNewPrompts];
                console.log('useRelatedPrompts: Total prompts after subcategory fallback:', relatedPrompts.length);
              }
            }
          }
          
          // Fallback 2: Try to find prompts with ANY matching category
          if (relatedPrompts.length < 3) {
            console.log('useRelatedPrompts: Fallback 2 - searching for ANY category match');
            
            for (const catId of categoryIds) {
              if (relatedPrompts.length >= 3) break;
              
              const { data: fallbackPrompts, error: fallbackError } = await supabase
                .from('prompts')
                .select(`
                  id,
                  title,
                  description,
                  requirements,
                  price,
                  category,
                  media_urls,
                  prompt_file_urls,
                  media_links,
                  ai_platform,
                  estimated_run_time,
                  ai_running_cost,
                  product_type,
                  seller_id,
                  created_at
                `)
                .neq('id', currentPromptId)
                .contains('category', [catId])
                .limit(5);

              if (!fallbackError && fallbackPrompts && fallbackPrompts.length > 0) {
                console.log(`useRelatedPrompts: Found ${fallbackPrompts.length} prompts for category ${catId}`);
                
                const existingIds = new Set(relatedPrompts.map(p => p.id));
                const newPrompts = await transformPromptsData(fallbackPrompts);
                const uniqueNewPrompts = newPrompts.filter(p => !existingIds.has(p.id));
                
                relatedPrompts = [...relatedPrompts, ...uniqueNewPrompts];
                console.log('useRelatedPrompts: Total prompts after category fallback:', relatedPrompts.length);
              }
            }
          }
          
          // Fallback 3: Get any recent prompts if still not enough
          if (relatedPrompts.length < 3) {
            console.log('useRelatedPrompts: Fallback 3 - getting any recent prompts');
            
            const { data: recentPrompts, error: recentError } = await supabase
              .from('prompts')
              .select(`
                id,
                title,
                description,
                requirements,
                price,
                category,
                media_urls,
                media_links,
                ai_platform,
                estimated_run_time,
                ai_running_cost,
                product_type,
                seller_id,
                created_at
              `)
              .neq('id', currentPromptId)
              .order('created_at', { ascending: false })
              .limit(10);

            if (!recentError && recentPrompts && recentPrompts.length > 0) {
              console.log(`useRelatedPrompts: Found ${recentPrompts.length} recent prompts`);
              
              const existingIds = new Set(relatedPrompts.map(p => p.id));
              const newPrompts = await transformPromptsData(recentPrompts);
              const uniqueNewPrompts = newPrompts.filter(p => !existingIds.has(p.id));
              
              const needed = Math.max(0, 3 - relatedPrompts.length);
              relatedPrompts = [...relatedPrompts, ...uniqueNewPrompts.slice(0, needed)];
              console.log('useRelatedPrompts: Total prompts after recent fallback:', relatedPrompts.length);
            }
          }
        }

        console.log('useRelatedPrompts: Final result:', relatedPrompts.length, 'prompts');
        setPrompts(relatedPrompts);
      } catch (err) {
        console.error('Error in fetchRelatedPrompts:', err);
        setError('Failed to load related prompts');
        setPrompts([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRelatedPrompts();
  }, [currentPromptId, categories]);

  return { prompts, isLoading, error };
}

// Helper function to transform Supabase data to Prompt interface
async function transformPromptsData(data: any[]): Promise<Prompt[]> {
  // Get all unique seller_ids from the data
  const sellerIds = Array.from(new Set(data.map(p => p.seller_id).filter(Boolean)));
  
  // Fetch seller profiles separately
  let sellerProfiles: Record<string, any> = {};
  if (sellerIds.length > 0) {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, display_name, profile_picture_url, average_rating, total_sales, total_reviews')
      .in('id', sellerIds);

    if (profilesError) {
      console.error('Error fetching seller profiles:', profilesError);
    } else if (profilesData) {
      sellerProfiles = profilesData.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);
    }
  }

  return data.map((item) => {
    const sellerProfile = sellerProfiles[item.seller_id];
    
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      requirements: item.requirements,
      price: parseFloat(item.price) || 0,
      category: Array.isArray(item.category) ? item.category : [item.category],
      rating: sellerProfile?.average_rating || 0,
      total_reviews: sellerProfile?.total_reviews || 0,
      sales: sellerProfile?.total_sales || 0,
      thumbnail: item.media_urls?.[0] || '',
      media_urls: item.media_urls || [],
      fileUrls: item.prompt_file_urls || [],
      author: {
        id: sellerProfile?.id,
        name: sellerProfile?.display_name || sellerProfile?.full_name || 'Unknown Seller',
        avatar: sellerProfile?.profile_picture_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        rating: sellerProfile?.average_rating || 0,
        total_reviews: sellerProfile?.total_reviews || 0,
        sales_count: sellerProfile?.total_sales || 0,
      },
      platform: {
        name: item.ai_platform || 'Unknown Platform',
        logo: getPlatformLogo(item.ai_platform),
        type: 'ai' as const,
      },
      createdAt: item.created_at,
      aiRunningCost: parseFloat(item.ai_running_cost) || 0,
      estimatedRunTime: item.estimated_run_time || '',
      productType: item.product_type || 'prompt',
      media_links: item.media_links || [],
    };
  });
}

// Helper function to get platform logo
function getPlatformLogo(platform: string): string {
  const logoMap: Record<string, string> = {
    'ChatGPT': 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    'GPT-4': 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    'Claude': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Claude_AI_logo.svg/1200px-Claude_AI_logo.svg.png',
    'Gemini': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Google_Bard_logo.svg/1200px-Google_Bard_logo.svg.png',
    'Midjourney': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Midjourney_Emblem.png/1200px-Midjourney_Emblem.png',
    'DALL-E': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1200px-ChatGPT_logo.svg.png',
    'Stable Diffusion': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Stable_Diffusion_logo.svg/1200px-Stable_Diffusion_logo.svg.png',
  };
  
  return logoMap[platform] || 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg';
}