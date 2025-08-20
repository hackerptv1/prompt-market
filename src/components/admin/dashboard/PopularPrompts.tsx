import React, { useState, useEffect } from 'react';
import { Star, TrendingUp } from 'lucide-react';
import { supabase } from '../../../utils/supabase';

interface PopularPrompt {
  id: string;
  title: string;
  author: string;
  sales: number;
  rating: number;
  revenue: number;
  thumbnail: string;
}

export function PopularPrompts() {
  const [prompts, setPrompts] = useState<PopularPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularPrompts = async () => {
      try {
        // Get prompts with their sales data
        const { data: promptsData, error: promptsError } = await supabase
          .from('prompts')
          .select(`
            id,
            title,
            seller_id,
            price,
            author:profiles(full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (promptsError) {
          console.error('Error fetching prompts:', promptsError);
          return;
        }

        // Get sales data for each prompt
        const promptIds = promptsData?.map(p => p.id) || [];
        const { data: salesData, error: salesError } = await supabase
          .from('prompt_purchases')
          .select('prompt_id, payment_amount')
          .eq('payment_status', 'paid')
          .in('prompt_id', promptIds);

        if (salesError) {
          console.error('Error fetching sales data:', salesError);
          return;
        }

        // Calculate sales and revenue for each prompt
        const salesByPrompt: { [promptId: string]: { sales: number; revenue: number } } = {};
        salesData?.forEach(purchase => {
          if (!salesByPrompt[purchase.prompt_id]) {
            salesByPrompt[purchase.prompt_id] = { sales: 0, revenue: 0 };
          }
          salesByPrompt[purchase.prompt_id].sales += 1;
          salesByPrompt[purchase.prompt_id].revenue += purchase.payment_amount;
        });

        // Transform data
        const transformedPrompts = (promptsData || []).map(prompt => ({
          id: prompt.id,
          title: prompt.title || 'Untitled Prompt',
          author: (prompt.author as any)?.full_name || 'Unknown Author',
          sales: salesByPrompt[prompt.id]?.sales || 0,
          rating: 4.5, // TODO: Add actual rating calculation
          revenue: salesByPrompt[prompt.id]?.revenue || 0,
          thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop'
        }));

        // Sort by sales and take top 3
        const topPrompts = transformedPrompts
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 3);

        setPrompts(topPrompts);
      } catch (error) {
        console.error('Error in fetchPopularPrompts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPrompts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Popular Prompts</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Popular Prompts</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="p-6">
            <div className="flex items-center gap-4">
              <img
                src={prompt.thumbnail}
                alt={prompt.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-medium">{prompt.title}</h3>
                <p className="text-sm text-gray-600">{prompt.author}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400 fill-current" />
                    <span>{prompt.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>{prompt.sales} sales</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">${prompt.revenue.toLocaleString()}</div>
                <p className="text-sm text-gray-600">Revenue</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}