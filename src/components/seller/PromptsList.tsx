import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, TrendingUp, Eye, Image as ImageIcon, Star } from 'lucide-react';
import { ExpandableSection } from '../shared/ExpandableSection';
import { supabase } from '../../utils/supabase';

interface Prompt {
  id: string;
  title: string;
  views: number;
  sales: number;
  earnings: number;
  thumbnail: string;
  aiPlatform: {
    name: string;
    logo: string;
  };
  media_links: string[];
  average_rating: number;
  review_count: number;
}

export function PromptsList() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPrompts();
  }, []);

  const getPublicUrl = async (path: string): Promise<string> => {
    if (!path) return '';
    
    try {
      // If path already has http/https prefix, use it directly
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }
      
      // Step 1: Extract the file path correctly
      // Handle various path formats:
      let filePath = path;
      
      // Handle bucket prefix
      const bucketPrefixes = ['prompt-media/', 'prompt-files/', 'profile-pictures/'];
      for (const prefix of bucketPrefixes) {
        if (filePath.startsWith(prefix)) {
          filePath = filePath.substring(prefix.length);
          break;
        }
      }
      
      // Step 2: Try to get a signed URL (works better for private buckets)
      try {
        const { data, error } = await supabase.storage
          .from('prompt-media')
          .createSignedUrl(filePath, 3600); // 1 hour expiration
          
        if (!error && data?.signedUrl) {
          return data.signedUrl;
        }
      } catch (err) {
        console.log(`Failed to get signed URL for ${filePath}, falling back to public URL`);
      }
      
      // Step 3: Try different path variants with signed URLs
      const pathVariants = [
        filePath,
        path,
        filePath.split('/').pop() || filePath,
        `${path.split('/').pop()}`
      ];
      
      for (const variant of pathVariants) {
        try {
          const { data, error } = await supabase.storage
            .from('prompt-media')
            .createSignedUrl(variant, 3600);
            
          if (!error && data?.signedUrl) {
            return data.signedUrl;
          }
        } catch (e) {
          // Continue to next variant
        }
      }
      
      // Step 4: If all signed URL attempts fail, try getPublicUrl
      const { data } = supabase.storage
        .from('prompt-media')
        .getPublicUrl(filePath);
        
      if (data && data.publicUrl) {
        return data.publicUrl;
      }
      
      // Step 5: Last resort fallback - direct URL construction
      const supabaseUrl = (window as any).VITE_SUPABASE_URL || 
                         import.meta.env.VITE_SUPABASE_URL;
      
      if (supabaseUrl) {
        return `${supabaseUrl}/storage/v1/object/public/prompt-media/${filePath}`;
      }
      
      console.warn('Failed to generate URL for:', path);
      return 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop';
    } catch (error) {
      console.error('Error generating URL:', error);
      return 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop';
    }
  };

  const fetchPrompts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      console.log('Fetching prompts for user:', user.id);

      // Fetch prompts for the current user with rating data
      const { data: promptsData, error: promptsError } = await supabase
        .from('prompts')
        .select('*, prompt_reviews(count)')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (promptsError) throw promptsError;

      console.log('Fetched prompts:', promptsData);

      // Get signed URLs for all media files first
      const mediaUrlMap = new Map<string, string>();
      
      // Process all prompts with media URLs
      for (const prompt of promptsData) {
        if (Array.isArray(prompt.media_urls) && prompt.media_urls.length > 0) {
          // Try to get a signed URL for the first media URL
          const url = prompt.media_urls[0];
          if (url) {
            const signedUrl = await getPublicUrl(url);
            mediaUrlMap.set(prompt.id, signedUrl);
          }
        }
      }

      // Transform the data to match our Prompt interface
      const transformedPrompts = promptsData.map(prompt => {
        // Use the cached signed URL or fallback to default
        let mediaUrl = mediaUrlMap.get(prompt.id) || 
                      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop';

        // Extract review count from the prompt_reviews relationship
        const reviewCount = prompt.prompt_reviews?.[0]?.count || 0;

        return {
          id: prompt.id,
          title: prompt.title,
          views: prompt.views || 0,
          sales: prompt.sales || 0,
          earnings: prompt.earnings || 0,
          thumbnail: mediaUrl,
          aiPlatform: {
            name: prompt.ai_platform || 'Unknown Platform',
            logo: getAIPlatformLogo(prompt.ai_platform || ''),
          },
          media_links: prompt.media_links || [],
          average_rating: prompt.average_rating || 0,
          review_count: reviewCount,
        };
      });

      console.log('Transformed prompts:', transformedPrompts);
      setPrompts(transformedPrompts);
    } catch (err) {
      console.error('Error fetching prompts:', err);
      setError('Failed to load prompts');
    } finally {
      setIsLoading(false);
    }
  };

  // Add event listeners for prompt creation and updates
  useEffect(() => {
    // Initial fetch
    fetchPrompts();

    // Add event listeners
    const handlePromptCreated = () => {
      console.log('Prompt created event received, refreshing prompts list...');
      fetchPrompts();
    };

    const handlePromptUpdated = () => {
      console.log('Prompt updated event received, refreshing prompts list...');
      fetchPrompts();
    };

    // Add event listeners with capture phase to ensure they're caught
    window.addEventListener('promptCreated', handlePromptCreated, true);
    window.addEventListener('promptUpdated', handlePromptUpdated, true);

    // Cleanup
    return () => {
      window.removeEventListener('promptCreated', handlePromptCreated, true);
      window.removeEventListener('promptUpdated', handlePromptUpdated, true);
    };
  }, []); // Empty dependency array means this runs once when component mounts

  const handleImageError = async (promptId: string) => {
    // Find the prompt
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    console.log(`Image loading failed for prompt: ${promptId}`);
    console.log(`Original image URL: ${prompt.thumbnail}`);
    
    // Don't immediately mark as error - try to get a new signed URL first
    try {
      // Get raw media URL from database
      const { data, error } = await supabase
        .from('prompts')
        .select('media_urls')
        .eq('id', promptId)
        .single();
        
      if (error || !data || !Array.isArray(data.media_urls) || data.media_urls.length === 0) {
        throw new Error('Could not retrieve original media URLs');
      }
      
      // Try to get a new signed URL
      const rawUrl = data.media_urls[0];
      const newSignedUrl = await getPublicUrl(rawUrl);
      
      if (newSignedUrl && newSignedUrl !== prompt.thumbnail) {
        console.log('Successfully retrieved new signed URL');
        
        // Update the prompt with the new URL
        setPrompts(prevPrompts => 
          prevPrompts.map(p => 
            p.id === promptId 
              ? { ...p, thumbnail: newSignedUrl } 
              : p
          )
        );
        
        // Don't set error since we successfully got a new URL
        return;
      }
    } catch (err) {
      console.error('Error trying to fix broken image:', err);
    }
    
    // If all attempts fail, mark as error
    setImageErrors(prev => ({ ...prev, [promptId]: true }));
  };

  const handleImageLoad = (promptId: string) => {
    // Clear any error and loading states when image loads successfully
    if (imageErrors[promptId]) {
      setImageErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[promptId];
        return newErrors;
      });
    }
    
    if (loadingImages[promptId]) {
      setLoadingImages(prev => {
        const newLoading = {...prev};
        delete newLoading[promptId];
        return newLoading;
      });
    }
  };

  const handleDelete = async (promptId: string) => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) return;
    
    setIsDeleting(promptId);
    try {
      // Then delete the prompt
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', promptId);
        
      if (error) throw error;
      
      // Refresh the prompts list
      fetchPrompts();
    } catch (err) {
      console.error('Error deleting prompt:', err);
      setError('Failed to delete prompt');
    } finally {
      setIsDeleting(null);
    }
  };

  const getAIPlatformLogo = (platform: string): string => {
    const platformLogos: Record<string, string> = {
      'chatgpt': 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
      'gpt-4': 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
      'midjourney': 'https://seeklogo.com/images/M/midjourney-logo-02E160DA6E-seeklogo.com.png',
      'claude': 'https://seeklogo.com/images/A/anthropic-claude-logo-7ABEA5C5A9-seeklogo.com.png',
      'dall-e': 'https://seeklogo.com/images/D/dall-e-logo-1DD62F0D6C-seeklogo.com.png',
    };

    return platformLogos[platform.toLowerCase()] || 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg';
  };

  const promptItems = prompts.map(prompt => (
    <div key={prompt.id} className="flex items-center gap-4 p-4 border-b border-gray-200 last:border-0">
      <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        {imageErrors[prompt.id] ? (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <ImageIcon className="h-6 w-6" />
            <span className="text-xs mt-1">No image</span>
          </div>
        ) : loadingImages[prompt.id] ? (
          <div className="flex items-center justify-center h-full w-full">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <img
            src={prompt.thumbnail}
            alt={prompt.title}
            className="w-full h-full object-cover"
            onLoad={() => handleImageLoad(prompt.id)}
            onError={() => {
              // Set loading state while we try to fix the image
              setLoadingImages(prev => ({...prev, [prompt.id]: true}));
              handleImageError(prompt.id).finally(() => {
                // Clear loading state when done
                setLoadingImages(prev => {
                  const newLoading = {...prev};
                  delete newLoading[prompt.id];
                  return newLoading;
                });
              });
            }}
          />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">
          {prompt.title}
        </h3>
        
        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{prompt.views.toLocaleString()} views</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>{prompt.sales} sales</span>
          </div>
          {prompt.average_rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span>{prompt.average_rating.toFixed(1)} ({prompt.review_count} reviews)</span>
            </div>
          )}
          <div className="font-medium text-gray-900">
            ${prompt.earnings.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          to={`/seller/prompt/${prompt.id}`}
          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-50"
        >
          <Edit2 className="h-5 w-5" />
        </Link>
        <button 
          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => handleDelete(prompt.id)}
          disabled={isDeleting === prompt.id}
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  ));

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Your Prompts</h2>
        </div>
        <div className="p-6 text-center text-gray-500">
          Loading your prompts...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Your Prompts</h2>
        </div>
        <div className="p-6 text-center text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Your Prompts</h2>
      </div>

      {prompts.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No prompts found. Start by creating your first prompt!
        </div>
      ) : (
        <ExpandableSection 
          initialItems={3} 
          items={promptItems} 
          gridCols="grid-cols-1" 
          showAllText="Show all"
        />
      )}
    </div>
  );
}