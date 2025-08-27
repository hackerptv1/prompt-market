import React, { useState, useEffect } from 'react';
import { PromptCard } from '../shared/PromptCard';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import type { Prompt } from '../../types';

interface CategoryPromptsRealProps {
  title: string;
  categoryName: string;
  limit?: number;
}

export function CategoryPromptsReal({ title, categoryName, limit = 3 }: CategoryPromptsRealProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, get the category UUID from the categories table
        console.log('Fetching category UUID for:', categoryName);
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryName)
          .single();

        if (categoryError) {
          console.error('Error fetching category:', categoryError);
          console.log('Category not found, showing empty state');
          setPrompts([]);
          setLoading(false);
          return;
        }

        if (!categoryData) {
          console.log('Category not found:', categoryName);
          setPrompts([]);
          setLoading(false);
          return;
        }

        console.log('Found category UUID:', categoryData.id);
        
        // Now fetch prompts using the category UUID (category is an array field)
        let { data: promptsData, error: promptsError } = await supabase
          .from('prompts')
          .select('*')
          .contains('category', [categoryData.id])
          .order('created_at', { ascending: false })
          .limit(limit);

        if (promptsError) {
          console.error('Error fetching prompts:', promptsError);
          setError('Failed to load prompts');
          return;
        }

        if (!promptsData) {
          setPrompts([]);
          setLoading(false);
          return;
        }

        // Get all unique seller_ids from promptsData
        const sellerIds = Array.from(new Set(promptsData.map(p => p.seller_id).filter(Boolean)));
        let sellerProfiles: Record<string, { full_name: string | null; display_name: string | null; profile_picture_url: string | null }> = {};
        
        if (sellerIds.length > 0) {
          console.log('Fetching seller profiles for IDs:', sellerIds);
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, display_name, profile_picture_url')
            .in('id', sellerIds);
          
          if (profilesError) {
            console.error('Error fetching seller profiles:', profilesError);
            // Continue without seller profiles - use defaults
          } else if (profilesData) {
            profilesData.forEach((profile: any) => {
              sellerProfiles[profile.id] = {
                full_name: profile.full_name,
                display_name: profile.display_name,
                profile_picture_url: profile.profile_picture_url,
              };
            });
            console.log('Found seller profiles:', Object.keys(sellerProfiles));
          }
        }

        if (promptsError) {
          console.error('Error fetching prompts:', promptsError);
          console.error('Category name:', categoryName);
          setError('Failed to load prompts');
          return;
        }

        if (!promptsData) {
          setPrompts([]);
          return;
        }

        // Transform the data to match our Prompt interface
        const transformedPrompts = promptsData.map((prompt: any) => {
          const sellerProfile = sellerProfiles[prompt.seller_id];
          return {
            id: prompt.id,
            title: prompt.title,
            description: prompt.description,
            requirements: prompt.requirements || '',
            price: prompt.price,
            category: [categoryName], // We know the category name
            rating: prompt.average_rating || 4.5,
            sales: prompt.total_sales || 0,
            thumbnail: prompt.media_urls?.[0] || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
            author: {
              id: prompt.seller_id,
              name: sellerProfile?.display_name || sellerProfile?.full_name || `Seller ${prompt.seller_id?.slice(0, 8)}`,
              avatar: sellerProfile?.profile_picture_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
            },
            platform: {
              name: prompt.ai_platform || 'ChatGPT',
              logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
              type: 'ai' as const,
            },
            createdAt: prompt.created_at,
            aiRunningCost: prompt.ai_running_cost || 0.02,
            estimatedRunTime: prompt.estimated_run_time || '2-3 minutes',
            productType: prompt.product_type || 'prompt'
          };
        });

        setPrompts(transformedPrompts);
      } catch (err) {
        console.error('Error in fetchPrompts:', err);
        setError('Failed to load prompts');
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [categoryName, limit]);

  if (loading) {
    return (
      <div className="py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
            <Link 
              to="/browse" 
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              View all
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
            <Link 
              to="/browse" 
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              View all
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="text-center py-8 text-gray-500">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (prompts.length === 0) {
    return null; // Don't show the section if no prompts
  }

  return (
    <div className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
          <Link 
            to="/browse" 
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
          >
            View all
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </div>
    </div>
  );
}
