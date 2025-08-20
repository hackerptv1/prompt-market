import React, { useState, useEffect } from 'react';
import { FilterSidebar } from '../components/browse/FilterSidebar';
import { PromptGrid } from '../components/browse/PromptGrid';
import { Pagination } from '../components/browse/Pagination';
import { MobileFilterButton } from '../components/browse/MobileFilterButton';
import { supabase } from '../utils/supabase';
import type { Prompt } from '../types';
import { FilterProvider, useFilters } from '../contexts/FilterContext';
import { DEFAULT_PLACEHOLDER_IMAGE } from '../utils/constants';

// Add placeholder SVGs
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop';

const PLACEHOLDER_AVATAR = `data:image/svg+xml;base64,${btoa(`
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#f3f4f6"/>
  <circle cx="50" cy="40" r="20" fill="#9ca3af"/>
  <circle cx="50" cy="90" r="35" fill="#9ca3af"/>
</svg>
`)}`;

function BrowsePromptsContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  // Search state
  const [localSearch, setLocalSearch] = useState('');
  const [search, setSearch] = useState('');

  const {
    categories,
    subcategories,
    selectedCategories,
    selectedSubcategories,
    selectedPlatform,
    priceRange,
    sortBy,
    aiPlatforms,
    automationPlatforms,
    resetFilters
  } = useFilters();

  useEffect(() => {
    async function fetchPrompts() {
      try {
        setIsLoading(true);
        setError(null);

        // Calculate pagination range
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        // Start building the query
        let query = supabase
          .from('prompts')
          .select('*', { count: 'exact' });

        // Apply filters
        if (selectedCategories.length > 0) {
          query = query.overlaps('category', selectedCategories);
        }
        if (selectedSubcategories.length > 0) {
          query = query.overlaps('subcategory', selectedSubcategories);
        }
        if (selectedPlatform) {
          const platform = aiPlatforms.find(p => p.id === selectedPlatform);
          if (platform) {
            query = query.eq('ai_platform', platform.platform_name);
          }
        }
        if (priceRange[0] > 0 || priceRange[1] < 1000) {
          query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);
        }
        if (search && search.trim() !== '') {
          query = query.ilike('title', `%${search.trim()}%`);
        }

        // Apply sorting
        switch (sortBy) {
          case 'price_asc':
            query = query.order('price', { ascending: true });
            break;
          case 'price_desc':
            query = query.order('price', { ascending: false });
            break;
          case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
          case 'newest':
          default:
            query = query.order('created_at', { ascending: false });
            break;
        }

        // Apply pagination
        query = query.range(from, to);

        const { data: promptsData, error: promptsError, count } = await query;

        if (promptsError) {
          console.error('Supabase error:', promptsError);
          throw new Error('Failed to fetch prompts');
        }

        if (!promptsData) {
          throw new Error('No data received from server');
        }

        // Get all unique seller_ids from promptsData
        const sellerIds = Array.from(new Set(promptsData.map(p => p.seller_id).filter(Boolean)));
        let sellerProfiles: Record<string, { display_name: string | null; full_name: string; profile_picture_url: string | null; average_rating?: number; total_reviews?: number; total_sales?: number }> = {};
        if (sellerIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, display_name, full_name, profile_picture_url, average_rating, total_reviews, total_sales')
            .in('id', sellerIds);
          if (!profilesError && profilesData) {
            profilesData.forEach((profile: any) => {
              sellerProfiles[profile.id] = {
                display_name: profile.display_name,
                full_name: profile.full_name,
                profile_picture_url: profile.profile_picture_url,
                average_rating: profile.average_rating,
                total_reviews: profile.total_reviews,
                total_sales: profile.total_sales,
              };
            });
          }
        }

        // Fetch review statistics for all prompts
        const promptIds = promptsData.map(prompt => prompt.id);
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
        const transformedPrompts = await Promise.all(promptsData.map(async prompt => {
          let thumbnail = DEFAULT_PLACEHOLDER_IMAGE;
          if (Array.isArray(prompt.media_urls) && prompt.media_urls.length > 0) {
            thumbnail = await getSignedUrl('prompt-media', prompt.media_urls[0]);
          }

          // Determine platform type and get logo
          const platformType = prompt.product_type === 'automation' ? 'automation' : 'ai' as const;
          let platformLogo;
          let platformName;
          
          if (platformType === 'automation') {
            // Use automation_platform field for automation products, fallback to ai_platform for backward compatibility
            const automationPlatformName = prompt.automation_platform || prompt.ai_platform;
            const automationPlatform = automationPlatforms.find(
              (p: { platform_name: string }) => p.platform_name === automationPlatformName
            );
            platformName = automationPlatformName;
            platformLogo = automationPlatform?.logo_url;
          } else {
            const aiPlatform = aiPlatforms.find(
              (p: { platform_name: string }) => p.platform_name === prompt.ai_platform
            );
            platformName = prompt.ai_platform;
            platformLogo = aiPlatform?.logo_url;
          }

          // Get seller profile info
          const sellerProfile = prompt.seller_id ? sellerProfiles[prompt.seller_id] : undefined;

          return {
            id: prompt.id,
            title: prompt.title || 'Untitled Prompt',
            description: prompt.description || 'No description available',
            requirements: prompt.requirements || 'No specific requirements listed',
            price: typeof prompt.price === 'string' ? parseFloat(prompt.price) : prompt.price || 0,
            category: prompt.category || 'Uncategorized',
            rating: reviewStats[prompt.id]?.rating || 0,
            total_reviews: reviewStats[prompt.id]?.count || 0,
            sales: sellerProfile?.total_sales || 0, // Add total_sales to the prompt object
            thumbnail,
            author: {
              id: prompt.seller_id || '',
              name: sellerProfile?.display_name || sellerProfile?.full_name || 'Anonymous Seller',
              avatar: sellerProfile?.profile_picture_url || PLACEHOLDER_AVATAR,
              rating: sellerProfile?.average_rating ?? 0,
              total_reviews: sellerProfile?.total_reviews ?? 0,
              sales_count: sellerProfile?.total_sales ?? 0,
            },
            platform: {
              name: platformName || 'Unknown Platform',
              logo: platformLogo || `data:image/svg+xml;base64,${btoa(`
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#f3f4f6"/>
  <text x="16" y="20" font-family="Arial" font-size="12" fill="#9ca3af" text-anchor="middle">${platformType === 'automation' ? 'Auto' : 'AI'}</text>
</svg>
`)}`,
              type: platformType
            },
            createdAt: prompt.created_at || new Date().toISOString(),
            aiRunningCost: prompt.ai_running_cost || 0,
            estimatedRunTime: prompt.estimated_run_time || 'N/A',
            productType: prompt.product_type || 'prompt',
            media_links: prompt.media_links || [],
          } as const;
        }));

        setPrompts(transformedPrompts);
        setTotalPages(Math.ceil((count || 0) / itemsPerPage));
      } catch (err) {
        console.error('Error fetching prompts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load prompts');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPrompts();
  }, [currentPage, selectedCategories, selectedSubcategories, selectedPlatform, priceRange, sortBy, aiPlatforms, automationPlatforms, search]);

  // Helper to get signed URL for a file in a private bucket
  async function getSignedUrl(bucket: 'prompt-media', path: string): Promise<string> {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const fullPath = path;
    try {
      const { data, error } = await supabase.storage.from(bucket).createSignedUrl(fullPath, 3600);
      if (!error && data?.signedUrl) return data.signedUrl;
    } catch {}
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/${bucket}/${fullPath}`;
    }
    return '';
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Browse Prompts</h1>
          <form
            className="flex items-center gap-2 w-full sm:w-auto"
            onSubmit={e => {
              e.preventDefault();
              setSearch(localSearch);
              setCurrentPage(1);
            }}
          >
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search prompts..."
              className="w-full sm:w-64 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Active Filters Display */}
        {(selectedCategories.length > 0 || selectedSubcategories.length > 0 || selectedPlatform || search) && (
          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Active Filters:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">Category:</span>
                  {selectedCategories.map(categoryId => {
                    const category = categories.find(c => c.id === categoryId);
                    return category ? (
                      <span key={categoryId} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {category.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
              {selectedSubcategories.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">Subcategory:</span>
                  {selectedSubcategories.map(subcategoryId => {
                    const subcategory = subcategories.find(s => s.id === subcategoryId);
                    return subcategory ? (
                      <span key={subcategoryId} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {subcategory.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
              {selectedPlatform && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">Platform:</span>
                  {(() => {
                    const platform = aiPlatforms.find(p => p.id === selectedPlatform) || 
                                   automationPlatforms.find(p => p.id === selectedPlatform);
                    return platform ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {platform.platform_name}
                      </span>
                    ) : null;
                  })()}
                </div>
              )}
              {search && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">Search:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                    "{search}"
                  </span>
                </div>
              )}
              <button
                onClick={() => {
                  // Reset all filters
                  setSearch('');
                  setLocalSearch('');
                  setCurrentPage(1);
                  // Reset filters in context
                  resetFilters();
                }}
                className="ml-2 text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Welcome Message for Category Selection */}
        {selectedCategories.length > 0 && !search && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  Browsing {selectedCategories.map(categoryId => {
                    const category = categories.find(c => c.id === categoryId);
                    return category?.name;
                  }).filter(Boolean).join(', ')}
                </h3>
                <p className="text-sm text-blue-700">
                  Discover amazing prompts in this category. Use the filters on the left to refine your search.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-8">
          <FilterSidebar 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
          
          <div className="flex-1 space-y-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                <p>{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : prompts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No prompts found.</p>
                {selectedCategories.length > 0 && (
                  <p className="text-sm text-gray-400 mt-2">
                    Try adjusting your filters or browse all categories.
                  </p>
                )}
              </div>
            ) : (
              <PromptGrid prompts={prompts} />
            )}

            {!isLoading && !error && prompts.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>

        <MobileFilterButton onClick={() => setIsSidebarOpen(true)} />
      </div>
    </div>
  );
}

export function BrowsePrompts() {
  return (
    <FilterProvider>
      <BrowsePromptsContent />
    </FilterProvider>
  );
}