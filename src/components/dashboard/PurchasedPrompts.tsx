import React, { useState, useEffect } from 'react';
import { ExternalLink, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ExpandableSection } from '../shared/ExpandableSection';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';

interface PurchasedPrompt {
  id: string;
  prompt_id: string;
  purchase_date: string;
  payment_amount: number;
  prompt: {
    id: string;
    title: string;
    description: string;
    price: number;
    categories: string[];
    platform: {
      name: string;
      logo_url: string;
    };
    author: {
      name: string;
      profile_picture_url: string;
    };
    media_links: string[];
  };
  seller: {
    name: string;
    profile_picture_url: string;
  };
}

export function PurchasedPrompts() {
  const { user } = useAuth();
  const [purchasedPrompts, setPurchasedPrompts] = useState<PurchasedPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchasedPrompts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching purchased prompts for user:', user.id);

        // Fetch purchased prompts with prompt details
        const { data, error } = await supabase
          .from('prompt_purchases')
          .select(`
            id,
            prompt_id,
            purchase_date,
            payment_amount,
            prompt:prompts(
              id,
              title,
              description,
              price,
              category,
              ai_platform,
              automation_platform,
              product_type,
              seller_id,
              media_links
            ),
            seller:profiles!prompt_purchases_seller_id_fkey(
              id,
              display_name,
              full_name,
              profile_picture_url
            )
          `)
          .eq('buyer_id', user.id)
          .eq('payment_status', 'paid')
          .order('purchase_date', { ascending: false });

        console.log('Purchased prompts result:', { data, error });

        if (error) {
          console.error('Error fetching purchased prompts:', error);
          setError('Failed to load purchased prompts');
        } else {
          // Fetch platform logos for AI and automation platforms
          const { data: aiPlatformLogos } = await supabase
            .from('ai_platform_logos')
            .select('platform_name, logo_url');
          
          const { data: automationPlatformLogos } = await supabase
            .from('automation_platform_logos')
            .select('platform_name, logo_url');

          // Fetch all categories to map UUIDs to names
          const { data: allCategories } = await supabase
            .from('categories')
            .select('id, name');
          
          // Create a lookup map for categories
          const categoryMap: { [key: string]: string } = {};
          allCategories?.forEach(cat => {
            categoryMap[cat.id] = cat.name;
          });
          
          console.log('Category map created with', Object.keys(categoryMap).length, 'categories');
          console.log('Sample mapping:', Object.entries(categoryMap).slice(0, 3));
          


          // Create lookup objects for platform logos
          const aiLogos: { [key: string]: string } = {};
          const automationLogos: { [key: string]: string } = {};
          
          aiPlatformLogos?.forEach(logo => {
            aiLogos[logo.platform_name] = logo.logo_url;
          });
          
          automationPlatformLogos?.forEach(logo => {
            automationLogos[logo.platform_name] = logo.logo_url;
          });

          // Transform the data to match our interface
          const transformedData = (data || []).map((item: any) => {
            // Determine platform info based on product type
            const platformType = item.prompt?.product_type === 'automation' ? 'automation' : 'ai';
            const platformName = platformType === 'automation' 
              ? (item.prompt?.automation_platform || item.prompt?.ai_platform)
              : item.prompt?.ai_platform;
            
            const platformLogo = platformType === 'automation'
              ? automationLogos[platformName] || ''
              : aiLogos[platformName] || '';

            return {
              id: item.id,
              prompt_id: item.prompt_id,
              purchase_date: item.purchase_date,
              payment_amount: item.payment_amount,
              prompt: {
                id: item.prompt?.id || '',
                title: item.prompt?.title || '',
                description: item.prompt?.description || '',
                price: item.prompt?.price || 0,
                categories: Array.isArray(item.prompt?.category) 
                  ? item.prompt.category.map((catId: string) => categoryMap[catId] || catId)
                  : [],
                platform: {
                  name: platformName || '',
                  logo_url: platformLogo || ''
                },
                author: {
                  name: item.seller?.display_name || item.seller?.full_name || 'Unknown Seller',
                  profile_picture_url: item.seller?.profile_picture_url || ''
                },
                media_links: item.prompt?.media_links || []
              },
              seller: {
                name: item.seller?.display_name || item.seller?.full_name || 'Unknown Seller',
                profile_picture_url: item.seller?.profile_picture_url || ''
              }
            };
          });
          
          setPurchasedPrompts(transformedData);
        }
      } catch (err) {
        console.error('Error in fetchPurchasedPrompts:', err);
        setError('Failed to load purchased prompts');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasedPrompts();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getThumbnailUrl = (mediaLinks: string[]) => {
    if (mediaLinks && mediaLinks.length > 0) {
      // Return the first media link as thumbnail
      return mediaLinks[0];
    }
    // Default thumbnail
    return 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Purchased Prompts</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Purchased Prompts</h2>
        <div className="text-center py-8 text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (purchasedPrompts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Purchased Prompts</h2>
        <div className="text-center py-8 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>You haven't purchased any prompts yet.</p>
          <Link 
            to="/browse" 
            className="inline-block mt-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Browse prompts to get started
          </Link>
        </div>
      </div>
    );
  }

  const promptItems = purchasedPrompts.map((purchase) => (
    <div key={purchase.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-lg min-w-0">
      <img
        src={getThumbnailUrl(purchase.prompt.media_links)}
        alt={purchase.prompt.title}
        className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded-lg flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate" title={purchase.prompt.title}>
          {purchase.prompt.title}
        </h3>
        <p className="text-sm text-gray-600 mb-1 truncate" title={`by ${purchase.seller.name}`}>
          by {purchase.seller.name}
        </p>
        <p className="text-sm text-gray-600 mb-2 truncate" title={Array.isArray(purchase.prompt.categories) 
          ? purchase.prompt.categories.join(', ') 
          : purchase.prompt.categories}>
          {Array.isArray(purchase.prompt.categories) 
            ? purchase.prompt.categories.join(', ') 
            : purchase.prompt.categories}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <div className="text-sm text-gray-500 min-w-0 flex-1">
            <div className="truncate">Purchased: {formatDate(purchase.purchase_date)}</div>
            <div className="truncate">Price: ${purchase.payment_amount.toFixed(2)}</div>
          </div>
          <div className="flex gap-2 flex-shrink-0 ml-2">
            <Link 
              to={`/prompt/${purchase.prompt.id}`} 
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="View prompt details"
            >
              <ExternalLink className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
        Purchased Prompts ({purchasedPrompts.length})
      </h2>
      <ExpandableSection initialItems={3} items={promptItems} />
    </div>
  );
}