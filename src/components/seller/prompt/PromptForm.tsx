import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Trash2, Upload, Plus, Link2, FileText, Image as ImageIcon, ChevronDown, Video as VideoIcon } from 'lucide-react';
import { MediaUploadPreview } from '../MediaUploadPreview';
import { FileUploadPreview } from '../FileUploadPreview';
import { MediaLinkPreview } from './MediaLinkPreview';
import type { MediaLink } from '../../../types/mediaLinks';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchAILogos, type AILogo } from '../../../utils/aiLogos';
import { fetchAutomationLogos, type AutomationLogo } from '../../../utils/automationLogos';
import {
  MAX_MEDIA_FILE_SIZE,
  MAX_IMAGE_FILE_SIZE,
  MAX_PROMPT_FILE_SIZE,
  ALLOWED_MEDIA_TYPES,
  ALLOWED_PROMPT_FILE_TYPES,
} from '../../../utils/constants';

interface PromptFormProps {
  promptId: string | undefined;
}

interface Category {
  id: string;
  name: string;
  label?: string; // Optional label property
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface FormData {
  title: string;
  description: string;
  requirements: string;
  productType: string;
  categories: string[];
  subcategories: string[];
  price: string;
  aiPlatform: string;
  estimatedRunTime: string;
  aiRunningCost: string;
  apiEndpoint?: string;
  authType?: string;
  agentType?: string;
  requiredResources?: string;
}

// Add a simple image component with fallback for error handling
const SafeImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [error, setError] = useState(false);
  
  // Add debugging on mount to see what URL we're trying to load
  useEffect(() => {
    console.log('SafeImage attempting to load:', src);
  }, [src]);
  
  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <ImageIcon className="h-8 w-8 text-gray-400" />
        <div className="absolute bottom-0 inset-x-0 bg-black bg-opacity-50 text-white text-xs p-1">
          Failed to load image
        </div>
      </div>
    );
  }
  
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={(e) => {
        console.error(`Failed to load image: ${src}`);
        setError(true);
      }}
    />
  );
};

async function getSignedUrl(bucket: 'prompt-media', path: string): Promise<string> {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const fullPath = path;
  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(fullPath, 3600);
    if (!error && data?.signedUrl) return data.signedUrl;
  } catch {}
  // If signed URL fails, return a placeholder image or empty string
  return 'https://placehold.co/200x200?text=Image+Error';
}

export function PromptForm({ promptId }: PromptFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    requirements: '',
    productType: '',
    categories: [],
    subcategories: [],
    price: '',
    aiPlatform: '',
    estimatedRunTime: '',
    aiRunningCost: '',
  });
  
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [promptFiles, setPromptFiles] = useState<File[]>([]);
  const [mediaLinks, setMediaLinks] = useState<MediaLink[]>([]);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '', platform: '' });
  
  // Add state to track existing media URLs from the database
  const [existingMediaUrls, setExistingMediaUrls] = useState<string[]>([]);
  const [existingPromptUrls, setExistingPromptUrls] = useState<string[]>([]);
  
  // Add state to track files that should be deleted from bucket when save is pressed
  const [filesToDeleteFromBucket, setFilesToDeleteFromBucket] = useState<{
    media: string[];
    promptFiles: string[];
  }>({ media: [], promptFiles: [] });
  
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const subcategoryDropdownRef = useRef<HTMLDivElement>(null);
  
  const productTypes = [
    { id: 'prompt', label: 'Prompt' },
    { id: 'api', label: 'API' },
    { id: 'automation', label: 'Automation' },
  ];
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [platformOptions, setPlatformOptions] = useState<(AILogo | AutomationLogo)[]>([]);
  const [platformsLoading, setPlatformsLoading] = useState(true);
  const [platformsError, setPlatformsError] = useState<string | null>(null);
  
  // Add this useEffect to fetch categories and subcategories when component mounts
  useEffect(() => {
    async function fetchCategoriesAndSubcategories() {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');
        
        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
          return;
        }
        
        console.log('Fetched categories:', categoriesData);
        setCategories(categoriesData || []);

        // Fetch subcategories
        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from('subcategories')
          .select('*');
        
        if (subcategoriesError) {
          console.error('Error fetching subcategories:', subcategoriesError);
          return;
        }
        
        console.log('Fetched subcategories:', subcategoriesData);
        setSubcategories(subcategoriesData || []);
      } catch (err) {
        console.error('Error in fetchCategoriesAndSubcategories:', err);
      }
    }

    fetchCategoriesAndSubcategories();
  }, []); // Empty dependency array means this runs once when component mounts
  
  // Fetch existing prompt data
  useEffect(() => {
    if (promptId) {
      fetchPromptData();
    } else {
      // If creating a new prompt, auto-show the link form if no links exist
      if (mediaLinks.length === 0) {
        setShowLinkForm(true);
      }
    }
  }, [promptId]);
  
  // Check if media_links is initialized properly in the database
  useEffect(() => {
    const checkMediaLinks = async () => {
      if (!user) return;
      
      try {
        // Check if the current prompt has a valid media_links field
        if (promptId) {
          const { data, error } = await supabase
            .from('prompts')
            .select('media_links, media_urls')
            .eq('id', promptId)
            .single();
            
          if (error) {
            console.error('Error checking prompt media fields:', error);
          } else if (data) {
            // If media_links is null, initialize it as an empty array
            if (data.media_links === null) {
              console.log('Initializing media_links field as empty array');
              const { error: updateError } = await supabase
                .from('prompts')
                .update({ media_links: [] })
                .eq('id', promptId);
                
              if (updateError) {
                console.error('Error initializing media_links field:', updateError);
              } else {
                console.log('Successfully initialized media_links field');
              }
            }
          }
        }
      } catch (err) {
        console.error('Error checking media links:', err);
      }
    };
    
    checkMediaLinks();
  }, [user, promptId]);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (subcategoryDropdownRef.current && !subcategoryDropdownRef.current.contains(event.target as Node)) {
        setShowSubcategoryDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    const loadPlatforms = async () => {
      setPlatformsLoading(true);
      try {
        if (formData.productType === 'automation') {
          const data = await fetchAutomationLogos();
          setPlatformOptions(data);
        } else {
          const data = await fetchAILogos();
          setPlatformOptions(data);
        }
        setPlatformsError(null);
      } catch (err) {
        setPlatformsError('Failed to load platforms');
      } finally {
        setPlatformsLoading(false);
      }
    };
    loadPlatforms();
  }, [formData.productType]);
  
  const fetchPromptData = async () => {
    if (!promptId) return;
    
    setIsFetching(true);
    setError(null);
    
    try {
      const { data: promptData, error: promptError } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', promptId)
        .single();
      
      if (promptError) throw promptError;
      
      if (promptData) {
        // Check if the user is authorized to edit this prompt
        if (user?.id && promptData.seller_id !== user.id) {
          setError("You don't have permission to edit this prompt");
          setIsFetching(false);
          return;
        }

        // Process the category data
        let processedCategories: string[] = [];
        if (promptData.category) {
          if (typeof promptData.category === 'string') {
            processedCategories = promptData.category.split(',').map((cat: string) => cat.trim());
          } else if (Array.isArray(promptData.category)) {
            processedCategories = promptData.category;
          }
        }
        console.log('Processed categories:', processedCategories);

        // Process the subcategory data
        let processedSubcategories: string[] = [];
        if (promptData.subcategory) {
          if (typeof promptData.subcategory === 'string') {
            processedSubcategories = promptData.subcategory.split(',').map((subcat: string) => subcat.trim());
          } else if (Array.isArray(promptData.subcategory)) {
            processedSubcategories = promptData.subcategory;
          }
        }
        console.log('Processed subcategories:', processedSubcategories);
        
        // Update form data with all fetched values
        setFormData(prev => ({
          ...prev,
          title: promptData.title || '',
          description: promptData.description || '',
          requirements: promptData.requirements || '',
          productType: promptData.product_type || '',
          categories: processedCategories,
          subcategories: processedSubcategories,
          price: promptData.price?.toString() || '',
          aiPlatform: promptData.ai_platform || 'chatgpt',
          estimatedRunTime: promptData.estimated_run_time?.toString() || '',
          aiRunningCost: promptData.ai_running_cost?.toString() || '',
        }));
        
        // Process and store existing media URLs
        let rawMediaUrls = promptData.media_urls;
        if (typeof rawMediaUrls === 'string') {
          try {
            rawMediaUrls = JSON.parse(rawMediaUrls);
          } catch (e) {
            console.error('Failed to parse media_urls string:', rawMediaUrls);
            rawMediaUrls = [];
          }
        }
        if (rawMediaUrls && Array.isArray(rawMediaUrls)) {
          // Log the raw media URLs for debugging
          console.log('Raw media URLs from database:', rawMediaUrls);
          // Normalize URL format for consistency
          const processedMediaUrls = rawMediaUrls.map((url: string) => {
            if (!url) return '';
            // If it's already a complete URL, keep it as is
            if (url.startsWith('http://') || url.startsWith('https://')) {
              return url;
            }
            // Remove bucket prefix if present
            if (url.startsWith('prompt-media/')) {
              return url;
            }
            // If it's just a filename, keep it as is
            return url;
          }).filter((url: string) => url); // Remove empty URLs
          setExistingMediaUrls(processedMediaUrls);
          console.log('Processed media URLs:', processedMediaUrls);
        }
        
        // Process and store existing prompt URLs
        if (promptData.prompt_file_urls && Array.isArray(promptData.prompt_file_urls)) {
          // Log the raw prompt file URLs for debugging
          console.log('Raw prompt file URLs from database:', promptData.prompt_file_urls);
          
          // Normalize URL format for consistency
          const processedPromptUrls = promptData.prompt_file_urls.map((url: string) => {
            if (!url) return '';
            
            // If it's already a complete URL, keep it as is
            if (url.startsWith('http://') || url.startsWith('https://')) {
              return url;
            }
            
            // Remove bucket prefix if present
            if (url.startsWith('prompt-files/')) {
              return url;
            }
            
            // If it's just a filename, keep it as is
            return url;
          }).filter((url: string) => url); // Remove empty URLs
          
          setExistingPromptUrls(processedPromptUrls);
          console.log('Processed prompt file URLs:', processedPromptUrls);
        }
        
        // Handle media links - make sure we properly convert the array from the database
        if (promptData.media_links) {
          // Log for debugging
          console.log('Raw media_links from database:', JSON.stringify(promptData.media_links));
          
          try {
            let links: MediaLink[] = [];
            
            // Based on your schema view, media_links is stored as JSON
            // Handle all possible cases - null, empty, string, array, or JSON object
            
            if (promptData.media_links === null || promptData.media_links === undefined) {
              console.log('No media links found (null or undefined)');
              setMediaLinks([]);
              return;
            }
            
            // Try to parse if it's a JSON string
            if (typeof promptData.media_links === 'string') {
              try {
                // If it's a valid JSON string, parse it
                if (promptData.media_links.trim() !== '') {
                  const parsed = JSON.parse(promptData.media_links);
                  promptData.media_links = parsed;
                  console.log('Parsed JSON string media_links:', parsed);
                } else {
                  console.log('Empty media_links string');
                  setMediaLinks([]);
                  return;
                }
              } catch (parseError) {
                // If it's not valid JSON but a single URL
                console.log('media_links is a single URL string');
                setMediaLinks([{
                  id: 'existing-0',
                  title: 'Media Link',
                  url: promptData.media_links,
                  platform: promptData.media_links.includes('youtube.com') || promptData.media_links.includes('youtu.be') 
                    ? 'YouTube' 
                    : promptData.media_links.includes('vimeo.com') 
                      ? 'Vimeo' 
                      : 'Website'
                }]);
                return;
              }
            }
            
            // Ensure we're working with an array
            const mediaLinksArray = Array.isArray(promptData.media_links) 
              ? promptData.media_links 
              : [];
            
            if (mediaLinksArray.length > 0) {
              console.log('First media link item type:', typeof mediaLinksArray[0]);
              
              if (typeof mediaLinksArray[0] === 'string') {
                // Simple string format (array of URLs)
                links = mediaLinksArray.map((link: string, index: number) => {
                  // Ensure the URL is properly formatted
                  const url = link.trim();
                  console.log(`Processing string media link ${index}:`, url);
                  
                  if (!url) return null;
                  
                  // Make sure URL has http:// or https:// prefix
                  const formattedUrl = url.startsWith('http://') || url.startsWith('https://')
                    ? url
                    : `https://${url}`;
                  
                  return {
                    id: `existing-${index}`,
                    title: `Media ${index + 1}`,
                    url: formattedUrl,
                    platform: formattedUrl.includes('youtube.com') || formattedUrl.includes('youtu.be') 
                      ? 'YouTube' 
                      : formattedUrl.includes('vimeo.com') 
                        ? 'Vimeo' 
                        : 'Website'
                  };
                }).filter(Boolean) as MediaLink[];
              } else if (typeof mediaLinksArray[0] === 'object') {
                // Object format (array of objects with id, title, url, platform)
                links = mediaLinksArray.map((link: any, index: number) => {
                  console.log(`Processing object media link ${index}:`, link);
                  
                  if (!link) return null;
                  
                  // Handle both possible object structures
                  if (link.url) {
                    // Make sure URL has http:// or https:// prefix
                    const formattedUrl = link.url.startsWith('http://') || link.url.startsWith('https://')
                      ? link.url
                      : `https://${link.url}`;
                    
                    // Standard MediaLink format
                    return {
                      id: link.id || `existing-${index}`,
                      title: link.title || `Media ${index + 1}`,
                      url: formattedUrl,
                      platform: link.platform || 'Unknown'
                    };
                  } else if (link.mediaUrl) {
                    // Alternative format some data might use
                    const formattedUrl = (link.mediaUrl || link.media_url || '').startsWith('http')
                      ? (link.mediaUrl || link.media_url)
                      : `https://${link.mediaUrl || link.media_url}`;
                    
                    return {
                      id: link.id || `existing-${index}`,
                      title: link.title || link.name || `Media ${index + 1}`,
                      url: formattedUrl,
                      platform: link.platform || link.type || 'Unknown'
                    };
                  } else {
                    // Last resort - try to extract a URL from any string property
                    const possibleUrl = Object.values(link).find(val => 
                      typeof val === 'string' && 
                      val.trim() !== '' &&
                      (val.includes('.com') || val.includes('.org') || val.includes('.net'))
                    );
                    
                    if (!possibleUrl) return null;
                    
                    const formattedUrl = possibleUrl.toString().startsWith('http')
                      ? possibleUrl.toString()
                      : `https://${possibleUrl.toString()}`;
                    
                    return {
                      id: `existing-${index}`,
                      title: `Media ${index + 1}`,
                      url: formattedUrl,
                      platform: 'Unknown'
                    };
                  }
                }).filter(Boolean) as MediaLink[];
              }
            }
            
            // Filter out invalid links with empty URLs
            links = links.filter(link => link.url && link.url.trim() !== '');
            
            setMediaLinks(links);
            
            // If we fixed any links, automatically update the database
            if (links.length > 0 && promptId) {
              // Store the full links data for each item
              supabase
                .from('prompts')
                .update({ 
                  media_links: links,
                  updated_at: new Date().toISOString()
                })
                .eq('id', promptId)
                .then(({ error }) => {
                  if (error) {
                    console.error('Error updating fixed media links:', error);
                  } else {
                    console.log('Successfully updated media_links in database with fixed format');
                  }
                });
            }
          } catch (err) {
            console.error('Error parsing media links:', err);
            setMediaLinks([]);
            // Don't show error to user, just log it - we'll let them add new links
          }
        } else {
          // No media_links field found
          console.log('No media_links field found in data');
          setMediaLinks([]);
        }
      }
    } catch (err) {
      console.error('Error fetching prompt:', err);
      setError('Failed to fetch prompt data');
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'estimatedRunTime' || name === 'aiRunningCost'
        ? parseFloat(value)
        : value
    }));
  };

  const handleDeleteLink = (id: string) => {
    setMediaLinks(links => links.filter(link => link.id !== id));
  };

  const handleAddLink = async () => {
    const updatedLinks = [...mediaLinks, { ...newLink, id: Date.now().toString() }];
    setMediaLinks(updatedLinks);
    setNewLink({ title: '', url: '', platform: '' });
    setShowLinkForm(false);

    // If editing an existing prompt, update the DB immediately
    if (promptId) {
      try {
        await supabase
          .from('prompts')
          .update({
            media_links: updatedLinks,
            updated_at: new Date().toISOString(),
          })
          .eq('id', promptId);
      } catch (err) {
        // Optionally handle error (show a toast, etc)
        console.error('Failed to update media links in DB:', err);
      }
    }
  };

  // Function to delete files from storage buckets
  const deleteFilesFromBucket = async () => {
    const deletionErrors = [];

    // Delete media files
    if (filesToDeleteFromBucket.media.length > 0) {
      console.log('Deleting media files from bucket:', filesToDeleteFromBucket.media);
      
      const mediaPaths = filesToDeleteFromBucket.media.map(url => {
        // Remove bucket prefix if present
        let path = url;
        if (path.startsWith('prompt-media/')) {
          path = path.substring('prompt-media/'.length);
        }
        return path;
      });

      const { error: mediaError } = await supabase.storage
        .from('prompt-media')
        .remove(mediaPaths);

      if (mediaError) {
        console.error('Error deleting media files:', mediaError);
        deletionErrors.push(`Failed to delete ${mediaPaths.length} media file(s)`);
      } else {
        console.log(`Successfully deleted ${mediaPaths.length} media file(s) from bucket`);
      }
    }

    // Delete prompt files
    if (filesToDeleteFromBucket.promptFiles.length > 0) {
      console.log('Deleting prompt files from bucket:', filesToDeleteFromBucket.promptFiles);
      
      const promptPaths = filesToDeleteFromBucket.promptFiles.map(url => {
        // Remove bucket prefix if present  
        let path = url;
        if (path.startsWith('prompt-files/')) {
          path = path.substring('prompt-files/'.length);
        }
        return path;
      });

      const { error: promptError } = await supabase.storage
        .from('prompt-files')
        .remove(promptPaths);

      if (promptError) {
        console.error('Error deleting prompt files:', promptError);
        deletionErrors.push(`Failed to delete ${promptPaths.length} prompt file(s)`);
      } else {
        console.log(`Successfully deleted ${promptPaths.length} prompt file(s) from bucket`);
      }
    }

    // Clear the deletion queue after attempting deletion
    setFilesToDeleteFromBucket({ media: [], promptFiles: [] });

    // Return any errors that occurred
    return deletionErrors;
  };

  const handleDelete = async () => {
    if (!promptId || !user) return;
    
    if (!window.confirm('Are you sure you want to delete this prompt?')) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check authorization
      const { data: authCheck, error: authError } = await supabase
        .from('prompts')
        .select('seller_id')
        .eq('id', promptId)
        .single();
        
      if (authError) throw authError;
      
      if (authCheck && authCheck.seller_id !== user.id) {
        setError("You don't have permission to delete this prompt");
        setIsLoading(false);
        return;
      }
      
      // Then delete the prompt
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', promptId);
        
      if (error) throw error;
      
      setSuccess('Prompt deleted successfully');
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/seller');
      }, 1500);
    } catch (err) {
      console.error('Error deleting prompt:', err);
      setError('Failed to delete prompt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setError('You must be logged in to save prompts');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Upload media files with more robust error handling
      const mediaUrls = await Promise.all(
        mediaFiles.map(async (file) => {
          try {
            const timestamp = Date.now();
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const { data, error } = await supabase.storage
              .from('prompt-media')
              .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
              });
            if (error) throw error;
            return fileName;
          } catch (err) {
            console.error(`Error uploading ${file.name}:`, err);
            throw new Error(`Failed to upload ${file.name}`);
          }
        })
      );
      
      // Upload prompt files with more robust error handling
      const promptUrls = await Promise.all(
        promptFiles.map(async (file) => {
          try {
            const timestamp = Date.now();
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const { data, error } = await supabase.storage
              .from('prompt-files')
              .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
              });
            if (error) throw error;
            return fileName;
          } catch (err) {
            console.error(`Error uploading ${file.name}:`, err);
            throw new Error(`Failed to upload ${file.name}`);
          }
        })
      );
      
      // Format media links properly
      const formattedMediaLinks = mediaLinks.map(link => {
        let formattedUrl = link.url;
        if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
          formattedUrl = `https://${formattedUrl}`;
        }
        
        return {
          id: link.id,
          url: formattedUrl,
          title: link.title || 'Media Link',
          platform: link.platform || 'Website'
        };
      }).filter(link => link.url && link.url.trim() !== '');
      
      const promptData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        product_type: formData.productType,
        seller_id: user.id,
        media_urls: [...existingMediaUrls, ...mediaUrls],
        prompt_file_urls: [...existingPromptUrls, ...promptUrls],
        media_links: formattedMediaLinks,
        price: parseFloat(formData.price),
        ai_platform: formData.aiPlatform,
        estimated_run_time: parseFloat(formData.estimatedRunTime),
        ai_running_cost: parseFloat(formData.aiRunningCost),
        category: formData.categories, // Ensure this is an array
        subcategory: formData.subcategories, // Ensure this is an array
        updated_at: new Date().toISOString()
      };
      
      let promptIdToUse = promptId;
      
      // Save to database
      if (promptId) {
        // Update existing prompt
        const { error } = await supabase
          .from('prompts')
          .update(promptData)
          .eq('id', promptId);
        
        if (error) throw error;
      } else {
        // Create new prompt
        const { data, error } = await supabase
          .from('prompts')
          .insert([{
            ...promptData,
            created_at: new Date().toISOString()
          }])
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          promptIdToUse = data[0].id;
        }
      }

      // Delete files from bucket that were marked for deletion
      const deletionErrors = await deleteFilesFromBucket();
      if (deletionErrors.length > 0) {
        console.warn('Some files could not be deleted from storage:', deletionErrors);
        // Don't fail the entire save operation, just warn
      }

      // Clear uploaded files after successful save
      setMediaFiles([]);
      setPromptFiles([]);
      
      setSuccess('Prompt saved successfully');
      
      if (!promptId) {
        // Navigate to edit page for the new prompt and trigger a refresh of the prompts list
        setTimeout(() => {
          // Dispatch a custom event to notify other components to refresh
          window.dispatchEvent(new CustomEvent('promptCreated'));
          navigate(`/seller/prompt/${promptIdToUse}`);
        }, 1500);
      } else {
        // Refresh data to show the latest changes
        fetchPromptData();
        // Also trigger a refresh of the prompts list
        window.dispatchEvent(new CustomEvent('promptUpdated'));
      }
    } catch (err: any) {
      console.error('Error saving prompt:', err);
      setError(`Failed to save prompt: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const validateFile = (file: File, isMedia: boolean): string | null => {
    const fileType = file.type;
    const fileSize = file.size;
    
    // Debug logging
    console.log(`[File Validation] File: ${file.name}, Type: ${fileType}, Size: ${fileSize} bytes (${(fileSize / (1024 * 1024)).toFixed(2)}MB)`);
    
    if (isMedia) {
      if (!ALLOWED_MEDIA_TYPES.includes(fileType)) {
        console.log(`[File Validation] Invalid file type: ${fileType}`);
        return `Invalid file type. Allowed types: JPG, PNG, GIF, MP4, WEBM, MOV, AVI, MPEG, OGV`;
      }
      
      if (fileType.startsWith('image/') && fileSize > MAX_IMAGE_FILE_SIZE) {
        console.log(`[File Validation] Image too large: ${fileSize} > ${MAX_IMAGE_FILE_SIZE}`);
        return `Image files must be under ${MAX_IMAGE_FILE_SIZE / (1024 * 1024)}MB`;
      }
      
      if (fileType.startsWith('video/') && fileSize > MAX_MEDIA_FILE_SIZE) {
        console.log(`[File Validation] Video too large: ${fileSize} > ${MAX_MEDIA_FILE_SIZE}`);
        return `Video files must be under ${MAX_MEDIA_FILE_SIZE / (1024 * 1024)}MB (current: ${(fileSize / (1024 * 1024)).toFixed(2)}MB)`;
      }
    } else {
      if (!ALLOWED_PROMPT_FILE_TYPES.includes(fileType)) {
        return `Invalid file type. Allowed types: PDF, DOCX`;
      }
      
      if (fileSize > MAX_PROMPT_FILE_SIZE) {
        return `Prompt files must be under ${MAX_PROMPT_FILE_SIZE / (1024 * 1024)}MB`;
      }
    }
    
    console.log(`[File Validation] File ${file.name} passed validation`);
    return null;
  };

  // Update the media files handler
  const handleMediaFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const errors: string[] = [];
    const validFiles: File[] = [];

    console.log(`[Media Upload] Processing ${files.length} files`);

    files.forEach(file => {
      const error = validateFile(file, true);
      if (error) {
        console.log(`[Media Upload] File ${file.name} failed validation: ${error}`);
        errors.push(`${file.name}: ${error}`);
      } else {
        console.log(`[Media Upload] File ${file.name} passed validation`);
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      console.log(`[Media Upload] ${errors.length} files failed validation:`, errors);
      setError(errors.join('\n'));
      setTimeout(() => setError(''), 10000); // Extended to 10 seconds for better visibility
    } else {
      // Clear any existing errors if all files are valid
      setError('');
    }
    
    // Only update the files state if there are valid files
    if (validFiles.length > 0) {
      console.log(`[Media Upload] Adding ${validFiles.length} valid files to state`);
      setMediaFiles(prev => [...prev, ...validFiles]);
    }
    
    // Reset input
    e.target.value = '';
  };

  // Update the prompt files handler
  const handlePromptFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const errors: string[] = [];
    const validFiles: File[] = [];

    files.forEach(file => {
      const error = validateFile(file, false);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
      setTimeout(() => setError(''), 5000); // Clear error after 5 seconds
    }
    
    // Only update the files state if there are valid files
    if (validFiles.length > 0) {
      setPromptFiles(prev => [...prev, ...validFiles]);
    }
    
    // Reset input
    e.target.value = '';
  };

  // Function to handle removing an existing media file (mark for deletion, don't delete immediately)
  const handleRemoveExistingMedia = (index: number) => {
    const urlToRemove = existingMediaUrls[index];
    
    // Add to files to be deleted when save is pressed
    setFilesToDeleteFromBucket(prev => ({
      ...prev,
      media: [...prev.media, urlToRemove]
    }));
    
    // Remove from state immediately to update UI
    setExistingMediaUrls(prev => prev.filter((_, i) => i !== index));
    
    console.log(`Media file marked for deletion: ${urlToRemove}`);
  };
  
  // Function to handle removing an existing prompt file (mark for deletion, don't delete immediately)
  const handleRemoveExistingPrompt = (index: number) => {
    const urlToRemove = existingPromptUrls[index];
    
    // Add to files to be deleted when save is pressed
    setFilesToDeleteFromBucket(prev => ({
      ...prev,
      promptFiles: [...prev.promptFiles, urlToRemove]
    }));
    
    // Remove from state immediately to update UI
    setExistingPromptUrls(prev => prev.filter((_, i) => i !== index));
    
    console.log(`Prompt file marked for deletion: ${urlToRemove}`);
  };

  // For prompt-media (private bucket), always use signed URLs. For prompt-files, fallback to public URL if needed.
  const getPublicUrl = (bucket: 'prompt-media' | 'prompt-files', path: string): string => {
    if (bucket === 'prompt-files') {
      try {
        let fullPath = path;
        if (fullPath.startsWith(`${bucket}/`)) {
          fullPath = fullPath.substring(bucket.length + 1);
        }
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (supabaseUrl) {
          return `${supabaseUrl}/storage/v1/object/public/${bucket}/${fullPath}`;
        }
        const { data } = supabase.storage.from(bucket).getPublicUrl(fullPath);
        if (data && data.publicUrl) {
          return data.publicUrl;
        }
        return '#';
      } catch (error) {
        return '#';
      }
    }
    // For prompt-media, never use public URL
    return 'https://placehold.co/200x200?text=Image+Error';
  };

  // Helper to properly extract file name from path regardless of format
  const getFileNameFromUrl = (url: string): string => {
    try {
      // Handle various path formats
      // 1. Simple filename: "image.jpg"
      // 2. Full path: "prompt-media/image.jpg" 
      // 3. Timestamp path: "123456-image.jpg"
      const parts = url.split('/');
      return parts[parts.length - 1]; // Take the last part
    } catch (error) {
      console.error('Error parsing filename:', error);
      return 'file';
    }
  };

  // Function to test direct loading of images to diagnose issues
  const testImageLoading = async () => {
    if (existingMediaUrls.length === 0) {
      console.log('No media URLs to test');
      return;
    }
    
    // Try to create signed URLs which might work better if there are permissions issues
    setIsLoading(true);
    
    try {
      for (let i = 0; i < existingMediaUrls.length; i++) {
        const url = existingMediaUrls[i];
        const filename = getFileNameFromUrl(url);
        
        console.log(`=== Testing image ${i} ===`);
        console.log(`Original path: ${url}`);
        console.log(`Filename extracted: ${filename}`);
        
        // Try to get a signed URL (works with more permission setups)
        const { data, error } = await supabase.storage
          .from('prompt-media')
          .createSignedUrl(filename, 60); // 60 seconds expiration
        
        if (error) {
          console.error(`Error creating signed URL for ${filename}:`, error);
          
          // Try alternate path formats
          const alternateFilenames = [
            filename,
            url,
            `prompt-media/${filename}`,
            filename.split('/').pop()
          ];
          
          console.log('Trying alternate filenames:', alternateFilenames);
          
          // Try each alternate format
          for (const altName of alternateFilenames) {
            if (!altName) continue;
            console.log(`Trying alternate: ${altName}`);
            
            const { data: altData, error: altError } = await supabase.storage
              .from('prompt-media')
              .createSignedUrl(altName, 60);
              
            if (!altError && altData?.signedUrl) {
              console.log(`✅ Success with alternate path: ${altName}`);
              console.log(`Signed URL: ${altData.signedUrl}`);
              
              // Test if the URL actually loads
              const testResult = await testImageUrl(altData.signedUrl);
              console.log(`Image test result: ${testResult ? 'Success' : 'Failed'}`);
              
              // If it works, update the URL in the database
              if (testResult && promptId) {
                console.log(`Updating database with working filename: ${altName}`);
                const newMediaUrls = [...existingMediaUrls];
                newMediaUrls[i] = altName;
                
                await supabase
                  .from('prompts')
                  .update({ 
                    media_urls: newMediaUrls,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', promptId);
                  
                // Update state
                setExistingMediaUrls(newMediaUrls);
                setSuccess(`Fixed URL for image ${i + 1}`);
                setTimeout(() => setSuccess(null), 3000);
                break;
              }
            }
          }
        } else if (data?.signedUrl) {
          console.log(`✅ Successfully created signed URL: ${data.signedUrl}`);
          
          // Test if the URL actually loads
          const testResult = await testImageUrl(data.signedUrl);
          console.log(`Image test result: ${testResult ? 'Success' : 'Failed'}`);
        }
      }
    } catch (err) {
      console.error('Error during image testing:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to test if an image URL loads successfully
  const testImageUrl = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      // Set a timeout in case the image takes too long
      setTimeout(() => resolve(false), 5000);
    });
  };

  // Updated function to get URL that tries both signed and public URLs
  const getMediaUrl = async (path: string, bucket: 'prompt-media' | 'prompt-files' = 'prompt-media'): Promise<string> => {
    try {
      const { data } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 3600);
      
      return data?.signedUrl || '';
    } catch (error) {
      console.error('Error getting media URL:', error);
      return '';
    }
  };

  // Function to determine file type for displaying appropriate icon
  const isImageFile = (filename: string) => {
    const lowerCaseName = filename.toLowerCase();
    return lowerCaseName.endsWith('.jpg') || 
           lowerCaseName.endsWith('.jpeg') || 
           lowerCaseName.endsWith('.png') || 
           lowerCaseName.endsWith('.gif') || 
           lowerCaseName.endsWith('.webp');
  };

  const isVideoFile = (filename: string) => {
    const lowerCaseName = filename.toLowerCase();
    return lowerCaseName.endsWith('.mp4') || 
           lowerCaseName.endsWith('.webm') || 
           lowerCaseName.endsWith('.mov') || 
           lowerCaseName.endsWith('.avi') ||
           lowerCaseName.endsWith('.mpeg') ||
           lowerCaseName.endsWith('.ogv');
  };

  // Add component for media display that uses signed URLs
  const MediaDisplay = ({ url, index }: { url: string; index: number }) => {
    const [mediaUrl, setMediaUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [fileType, setFileType] = useState<'image' | 'video' | 'unknown'>('unknown');
    
    useEffect(() => {
      const loadMedia = async () => {
        try {
          setLoading(true);
          setError(false);
          
          // Determine file type from URL
          const filename = getFileNameFromUrl(url);
          let detectedType: 'image' | 'video' | 'unknown' = 'unknown';
          
          if (isImageFile(filename)) {
            detectedType = 'image';
          } else if (isVideoFile(filename)) {
            detectedType = 'video';
          }
          
          setFileType(detectedType);
          
          // Always use signed URL for prompt-media
          const { data, error } = await supabase.storage
            .from('prompt-media')
            .createSignedUrl(url, 3600);
            
          if (!error && data?.signedUrl) {
            setMediaUrl(data.signedUrl);
          } else {
            setError(true);
            setMediaUrl('');
          }
        } catch (err) {
          console.error(`Error loading media ${index}:`, err);
          setError(true);
          setMediaUrl('');
        } finally {
          setLoading(false);
        }
      };
      loadMedia();
    }, [url, index]);
    
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full w-full bg-gray-100">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    if (error || !mediaUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100">
          {fileType === 'video' ? (
            <VideoIcon className="h-8 w-8 text-gray-400" />
          ) : (
            <ImageIcon className="h-8 w-8 text-gray-400" />
          )}
          <p className="text-xs text-gray-500 mt-2">
            {fileType === 'video' ? 'Video Error' : 'Image Error'}
          </p>
        </div>
      );
    }
    
    // Render based on file type
    if (fileType === 'video') {
      return (
        <div className="relative w-full h-full bg-black">
          <video 
            src={mediaUrl}
            className="w-full h-full object-cover"
            controls
            preload="metadata"
            onError={() => setError(true)}
          >
            <source src={mediaUrl} type="video/mp4" />
            <source src={mediaUrl} type="video/webm" />
            <source src={mediaUrl} type="video/mov" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            Video
          </div>
        </div>
      );
    }
    
    // Default to image rendering
    return (
      <div className="relative w-full h-full">
        <img 
          src={mediaUrl}
          alt={getFileNameFromUrl(url)}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Image
        </div>
      </div>
    );
  };

  // Function to clean up and migrate existing media URLs to the correct format
  const cleanUpMediaUrls = async () => {
    if (!promptId || existingMediaUrls.length === 0) return;
    
    try {
      setIsLoading(true);
      
      // Extract just the filenames from the existing URLs
      const cleanedUrls = existingMediaUrls.map(url => {
        // Get just the filename part
        const parts = url.split('/');
        return parts[parts.length - 1]; // Last part should be the filename
      });
      
      console.log('Original URLs:', existingMediaUrls);
      console.log('Cleaned URLs:', cleanedUrls);
      
      // Update the database with the cleaned URLs
      const { error } = await supabase
        .from('prompts')
        .update({ 
          media_urls: cleanedUrls,
          updated_at: new Date().toISOString()
        })
        .eq('id', promptId);
      
      if (error) {
        console.error('Error updating media URLs:', error);
        setError('Failed to update media URLs');
      } else {
        setSuccess('Media URLs updated successfully');
        // Update state with the cleaned URLs
        setExistingMediaUrls(cleanedUrls);
      }
    } catch (err) {
      console.error('Error cleaning up media URLs:', err);
      setError('Failed to clean up media URLs');
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Same function for prompt files
  const cleanUpPromptUrls = async () => {
    if (!promptId || existingPromptUrls.length === 0) return;
    
    try {
      setIsLoading(true);
      
      // Extract just the filenames from the existing URLs
      const cleanedUrls = existingPromptUrls.map(url => {
        // Get just the filename part
        const parts = url.split('/');
        return parts[parts.length - 1]; // Last part should be the filename
      });
      
      console.log('Original prompt URLs:', existingPromptUrls);
      console.log('Cleaned prompt URLs:', cleanedUrls);
      
      // Update the database with the cleaned URLs
      const { error } = await supabase
        .from('prompts')
        .update({ 
          prompt_file_urls: cleanedUrls,
          updated_at: new Date().toISOString()
        })
        .eq('id', promptId);
      
      if (error) {
        console.error('Error updating prompt URLs:', error);
        setError('Failed to update prompt URLs');
      } else {
        setSuccess('Prompt URLs updated successfully');
        // Update state with the cleaned URLs
        setExistingPromptUrls(cleanedUrls);
      }
    } catch (err) {
      console.error('Error cleaning up prompt URLs:', err);
      setError('Failed to clean up prompt URLs');
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Add a function to test and fix media links
  const testAndFixMediaLinks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('=== Testing Media Links ===');
      console.log('Current media links:', mediaLinks);
      
      // Check for Supabase seller_media_links table
      if (!user) {
        setError('You must be logged in to test media links');
        return;
      }
      
      // First, try to fetch media links from seller_media_links table
      console.log('Checking seller_media_links table...');
      const { data: sellerMediaLinks, error: sellerMediaLinksError } = await supabase
        .from('seller_media_links')
        .select('*')
        .eq('seller_id', user.id);
        
      if (sellerMediaLinksError) {
        console.log('Error or table does not exist:', sellerMediaLinksError);
      } else {
        console.log('Found seller media links:', sellerMediaLinks);
        
        // If we found links, display them
        if (sellerMediaLinks && sellerMediaLinks.length > 0) {
          const transformedLinks: MediaLink[] = sellerMediaLinks.map(link => ({
            id: link.id,
            title: link.title || 'Media Link',
            url: link.url || '',
            platform: link.platform || 'Unknown'
          }));
          
          setSuccess(`Found ${transformedLinks.length} media links in your seller profile`);
          
          // Offer to add these to the current prompt
          if (window.confirm(`Found ${transformedLinks.length} media links in your seller profile. Would you like to add these to the current prompt?`)) {
            // Add links but avoid duplicates
            const existingUrls = mediaLinks.map(link => link.url);
            const newLinks = transformedLinks.filter(link => !existingUrls.includes(link.url));
            
            if (newLinks.length > 0) {
              setMediaLinks([...mediaLinks, ...newLinks]);
              setSuccess(`Added ${newLinks.length} new media links from your seller profile`);
            } else {
              setSuccess('No new media links to add');
            }
          }
        } else {
          console.log('No seller media links found');
        }
      }
      
      // Next, verify each media link in the current prompt
      if (mediaLinks.length > 0) {
        console.log('Verifying current media links...');
        
        const verifiedLinks: MediaLink[] = [];
        let fixedLinks = 0;
        
        for (const link of mediaLinks) {
          console.log(`Testing link: ${link.url}`);
          
          if (!link.url || link.url.trim() === '') {
            console.log('Skipping empty URL');
            continue;
          }
          
          // Ensure the URL has http/https prefix
          let fixedUrl = link.url;
          if (!fixedUrl.startsWith('http://') && !fixedUrl.startsWith('https://')) {
            fixedUrl = `https://${fixedUrl}`;
            console.log(`Fixed URL format: ${fixedUrl}`);
            fixedLinks++;
          }
          
          // Try to determine platform if "Unknown"
          let platform = link.platform;
          if (platform === 'Unknown' || !platform) {
            if (fixedUrl.includes('youtube.com') || fixedUrl.includes('youtu.be')) {
              platform = 'YouTube';
            } else if (fixedUrl.includes('vimeo.com')) {
              platform = 'Vimeo';
            } else if (fixedUrl.includes('instagram.com')) {
              platform = 'Instagram';
            } else if (fixedUrl.includes('facebook.com')) {
              platform = 'Facebook';
            } else if (fixedUrl.includes('twitter.com') || fixedUrl.includes('x.com')) {
              platform = 'Twitter';
            } else {
              platform = 'Website';
            }
          }
          
          verifiedLinks.push({
            ...link,
            url: fixedUrl,
            platform
          });
        }
        
        if (fixedLinks > 0) {
          setMediaLinks(verifiedLinks);
          setSuccess(`Fixed ${fixedLinks} media link URLs`);
        } else {
          setSuccess('All media links appear to be valid');
        }
      } else {
        console.log('No media links to verify');
        setSuccess('No media links to verify');
      }
      
    } catch (err) {
      console.error('Error testing media links:', err);
      setError('Error testing media links');
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Update getSignedFileUrl to use the full path as stored
  const getSignedFileUrl = async (url: string, bucket: 'prompt-media' | 'prompt-files'): Promise<string> => {
    const fullPath = url;
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(fullPath, 3600); // 1 hour
      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
      // If all signed URL attempts fail, return public URL
      return getPublicUrl(bucket, fullPath);
    } catch (err) {
      return getPublicUrl(bucket, fullPath);
    }
  };

  // FileLink component for prompt files with signed URLs
  const FileLink = ({ url, filename }: { url: string; filename: string }) => {
    const [fileUrl, setFileUrl] = useState<string>('#');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    useEffect(() => {
      const loadFileUrl = async () => {
        try {
          setLoading(true);
          const signedUrl = await getSignedFileUrl(url, 'prompt-files');
          setFileUrl(signedUrl);
        } catch (err) {
          console.error('Error loading file URL:', err);
          setError(true);
        } finally {
          setLoading(false);
        }
      };
      
      loadFileUrl();
    }, [url]);
    
    if (loading) {
      return <span className="text-sm text-gray-400">Loading file link...</span>;
    }
    
    if (error) {
      return <span className="text-sm text-red-500">Error loading file</span>;
    }
    
    return (
      <a 
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-600 hover:text-blue-700"
        onClick={(e) => {
          if (fileUrl === '#') {
            e.preventDefault();
            setError(true);
          }
        }}
      >
        View File
      </a>
    );
  };

  // 2. Category options
  const categoryList = [
    { id: 'marketing', label: 'Marketing' },
    { id: 'art', label: 'Art & Design' },
    { id: 'education', label: 'Education' },
    { id: 'writing', label: 'Writing' },
    { id: 'development', label: 'Development' },
  ];

  // 3. Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  // 4. Handle subcategory change
  const handleSubcategoryChange = (subcategoryId: string) => {
    setFormData(prev => ({
      ...prev,
      subcategories: prev.subcategories.includes(subcategoryId)
        ? prev.subcategories.filter(id => id !== subcategoryId)
        : [...prev.subcategories, subcategoryId]
    }));
  };

  if (isFetching) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded relative" role="alert">
          <pre className="whitespace-pre-wrap font-mono text-sm">{error}</pre>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Edit Prompt</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-5 w-5" />
            Delete
          </button>
          <button 
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSave}>
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
              <span className="ml-2 text-sm text-gray-500">
                {formData.title.length}/60 characters
              </span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 60) {
                  handleInputChange(e);
                }
              }}
              maxLength={60}
              className={`w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                formData.title.length >= 60 ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Type
            </label>
            <select 
              name="productType"
              value={formData.productType}
              onChange={handleInputChange}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select product type</option>
              {productTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories
            </label>
            <div className="relative" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>{formData.categories.length > 0 ? `${formData.categories.length} selected` : 'Select categories'}</span>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </button>
              {showCategoryDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {categories.map(category => (
                    <label key={category.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category.id)}
                        onChange={() => handleCategoryChange(category.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategories
            </label>
            <div className="relative" ref={subcategoryDropdownRef}>
              <button
                type="button"
                onClick={() => setShowSubcategoryDropdown(!showSubcategoryDropdown)}
                className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>{formData.subcategories.length > 0 ? `${formData.subcategories.length} selected` : 'Select subcategories'}</span>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </button>
              {showSubcategoryDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {subcategories.map(subcategory => {
                    const parentCategory = categories.find(cat => cat.id === subcategory.category_id);
                    return (
                      <label key={subcategory.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.subcategories.includes(subcategory.id)}
                          onChange={() => handleSubcategoryChange(subcategory.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          {subcategory.name} {parentCategory ? `(- ${parentCategory.name})` : ''}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price ($)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>
            {platformsLoading ? (
              <div className="text-gray-500 text-sm">Loading platforms...</div>
            ) : platformsError ? (
              <div className="text-red-500 text-sm">{platformsError}</div>
            ) : (
            <select 
              name="aiPlatform"
              value={formData.aiPlatform}
              onChange={handleInputChange}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            >
                <option value="">Select platform</option>
                {platformOptions.map(platform => (
                  <option key={platform.id} value={platform.platform_name}>
                    {platform.platform_name.charAt(0).toUpperCase() + platform.platform_name.slice(1).replace(/-/g, ' ')}
                  </option>
                ))}
            </select>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Run Time (min)
            </label>
            <input
              type="number"
              name="estimatedRunTime"
              value={formData.estimatedRunTime}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Running Cost ($)
            </label>
            <input
              type="number"
              name="aiRunningCost"
              value={formData.aiRunningCost}
              onChange={handleInputChange}
              min="0"
              step="0.001"
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Requirements
          </label>
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleInputChange}
            rows={4}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="List any requirements or prerequisites for using this prompt..."
            required
          />
        </div>

        {/* Media Links */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media Links
          </label>
          <div className="space-y-4">
            {mediaLinks.length > 0 ? (
              mediaLinks.map((link) => (
                <div key={link.id} className="space-y-2">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg group hover:border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Link2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{link.title}</h3>
                        <p className="text-sm text-gray-600">{link.platform}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Visit →
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              showLinkForm ? (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        required
                        value={newLink.title}
                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., Tutorial Video"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Platform
                      </label>
                      <input
                        type="text"
                        required
                        value={newLink.platform}
                        onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., YouTube"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL
                      </label>
                      <input
                        type="url"
                        required
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="https://"
                      />
                    </div>
                    <div className="sm:col-span-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowLinkForm(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddLink}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add Link
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center">
                  <div className="p-3 bg-blue-50 rounded-full mb-3">
                    <Link2 className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-gray-700 font-medium mb-1">No media links</h3>
                  <p className="text-gray-500 text-sm mb-4">Add links to YouTube videos, Vimeo, or other media related to your prompt</p>
                  <button
                    type="button"
                    onClick={() => setShowLinkForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Media Link
                  </button>
                </div>
              )
            )}
          </div>

          {mediaLinks.length > 0 && (
            <button
              type="button"
              onClick={() => setShowLinkForm(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 text-gray-500" />
              Add Media Link
            </button>
          )}

          {showLinkForm && mediaLinks.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newLink.title}
                    onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., Tutorial Video"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform
                  </label>
                  <input
                    type="text"
                    required
                    value={newLink.platform}
                    onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., YouTube"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    required
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLinkForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Link
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Media Files */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media Files
            <span className="text-sm text-gray-500 ml-2">
              (Images: max 5MB, Videos: max 50MB)
            </span>
          </label>
          
          {/* Existing Media Files */}
          {existingMediaUrls.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Media Files</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {existingMediaUrls.map((url, index) => (
                  <div key={index} className="relative group border rounded-lg overflow-hidden bg-gray-50">
                    <div className="aspect-square">
                      <MediaDisplay url={url} index={index} />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingMedia(index)}
                        className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all duration-200"
                        title="Remove this media file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-2 bg-white">
                      <p className="text-xs text-gray-600 truncate" title={getFileNameFromUrl(url)}>
                        {getFileNameFromUrl(url)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {isImageFile(url) ? 'Image' : isVideoFile(url) ? 'Video' : 'Media'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* New Media Files Upload Preview */}
          <MediaUploadPreview 
            files={mediaFiles} 
            onRemove={(index) => {
              setMediaFiles(files => files.filter((_, i) => i !== index));
            }}
          />
          <div className="mt-2">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Upload className="h-4 w-4 text-gray-500" />
              <span>Upload Media</span>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/gif,video/mp4,video/webm,video/quicktime,video/x-msvideo,video/mpeg,video/ogg,.jpg,.jpeg,.png,.gif,.mp4,.webm,.mov,.avi,.mpeg,.ogv"
                multiple
                onChange={handleMediaFilesChange}
              />
            </label>
            <p className="mt-1 text-sm text-gray-500">
              Supported formats: JPG, PNG, GIF, MP4, WEBM, MOV, AVI, MPEG, OGV
            </p>
          </div>
        </div>

        {/* Prompt Files */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prompt Files
            <span className="text-sm text-gray-500 ml-2">
              (Max 10MB per file)
            </span>
          </label>
          
          {/* Existing Prompt Files */}
          {existingPromptUrls.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Prompt Files</h4>
              <div className="space-y-2 mb-4">
                {existingPromptUrls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-6 w-6 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {getFileNameFromUrl(url)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {url.toLowerCase().endsWith('.pdf') ? 'PDF Document' : 'DOCX Document'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileLink url={url} filename={getFileNameFromUrl(url)} />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingPrompt(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove this file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* New Prompt Files Upload Preview */}
          <FileUploadPreview 
            files={promptFiles} 
            onRemove={(index) => {
              setPromptFiles(files => files.filter((_, i) => i !== index));
            }}
          />
          <div className="mt-2">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Upload className="h-4 w-4 text-gray-500" />
              <span>Upload Files</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple
                onChange={handlePromptFilesChange}
              />
            </label>
            <p className="mt-1 text-sm text-gray-500">
              Supported formats: PDF, DOCX
            </p>
          </div>
        </div>

        {formData.productType === 'api' && (
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900">API Configuration</h3>
            <div>
              <label htmlFor="apiEndpoint" className="block text-sm font-medium text-gray-700">API Endpoint</label>
              <input
                type="text"
                name="apiEndpoint"
                id="apiEndpoint"
                value={formData.apiEndpoint || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="https://api.example.com/endpoint"
              />
            </div>
            <div>
              <label htmlFor="authType" className="block text-sm font-medium text-gray-700">Authentication Type</label>
              <select
                name="authType"
                id="authType"
                value={formData.authType || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select Auth Type</option>
                <option value="api-key">API Key</option>
                <option value="oauth">OAuth 2.0</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
        )}

        {formData.productType === 'automation' && (
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900">Agent Configuration</h3>
            <div>
              <label htmlFor="agentType" className="block text-sm font-medium text-gray-700">Agent Type</label>
              <input
                type="text"
                name="agentType"
                id="agentType"
                value={formData.agentType || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., Data Scraper, Social Media Poster"
              />
            </div>
            <div>
              <label htmlFor="requiredResources" className="block text-sm font-medium text-gray-700">Required Resources</label>
              <textarea
                name="requiredResources"
                id="requiredResources"
                value={formData.requiredResources || ''}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="List any required software, APIs, or other resources."
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}