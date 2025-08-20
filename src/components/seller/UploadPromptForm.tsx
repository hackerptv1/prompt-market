import React, { useState, useEffect, useRef } from 'react';
import { Upload, Plus, Link2, ChevronDown } from 'lucide-react';
import { MediaUploadPreview } from './MediaUploadPreview';
import { FileUploadPreview } from './FileUploadPreview';
import { MediaLinkForm } from './media-links/MediaLinkForm';
import { MediaLinkCard } from './media-links/MediaLinkCard';
import type { MediaLink } from '../../types/mediaLinks';
import { supabase } from '../../utils/supabase';
import { v4 as uuidv4 } from 'uuid';
import { fetchAILogos, type AILogo } from '../../utils/aiLogos';
import { fetchAutomationLogos, type AutomationLogo } from '../../utils/automationLogos';
import { useAuth } from '../../contexts/AuthContext';
import {
  MAX_MEDIA_FILE_SIZE,
  MAX_IMAGE_FILE_SIZE,
  MAX_PROMPT_FILE_SIZE,
  ALLOWED_MEDIA_TYPES,
  ALLOWED_PROMPT_FILE_TYPES,
} from '../../utils/constants';

interface PromptData {
  id: string;
  title: string;
  description: string;
  product_type: string;
  category: string;
  subcategory: string;
  price: number;
  ai_platform: string;
  estimated_run_time: string;
  ai_running_cost: number;
  media_urls: string[];
  prompt_file_urls: string[];
  media_links: MediaLink[];
  seller_id: string;
  created_at: string;
  api_endpoint?: string | null;
  auth_type?: string | null;
  api_documentation?: Record<string, any>;
  agent_type?: string | null;
  required_resources?: string | null;
  agent_configuration?: Record<string, any>;
  requirements: string;
}

interface Category {
  id: string;
  name: string;
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

export function UploadPromptForm() {
  const { user } = useAuth();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [platformOptions, setPlatformOptions] = useState<(AILogo | AutomationLogo)[]>([]);
  const [platformsLoading, setPlatformsLoading] = useState(true);
  const [platformsError, setPlatformsError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const subcategoryDropdownRef = useRef<HTMLDivElement>(null);

  const productTypes = [
    { id: 'prompt', label: 'Prompt' },
    { id: 'api', label: 'API' },
    { id: 'automation', label: 'Automation' },
  ];

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

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) setError(error.message);
      else setCategories(data || []);
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchSubcategories() {
      if (formData.categories.length === 0) {
        setSubcategories([]);
        return;
      }
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .in('category_id', formData.categories);
      if (error) setError(error.message);
      else setSubcategories(data || []);
    }
    fetchSubcategories();
  }, [formData.categories]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    setFormData(prev => ({
      ...prev,
      subcategories: prev.subcategories.includes(subcategoryId)
        ? prev.subcategories.filter(id => id !== subcategoryId)
        : [...prev.subcategories, subcategoryId],
    }));
  };

  const validateFile = (file: File, isMedia: boolean): string | null => {
    const fileType = file.type;
    const fileSize = file.size;
    
    if (isMedia) {
      if (!ALLOWED_MEDIA_TYPES.includes(fileType)) {
        return `Invalid file type. Allowed types: JPG, PNG, GIF, MP4, WEBM`;
      }
      
      if (fileType.startsWith('image/') && fileSize > MAX_IMAGE_FILE_SIZE) {
        return `Image files must be under ${MAX_IMAGE_FILE_SIZE / (1024 * 1024)}MB`;
      }
      
      if (fileType.startsWith('video/') && fileSize > MAX_MEDIA_FILE_SIZE) {
        return `Video files must be under ${MAX_MEDIA_FILE_SIZE / (1024 * 1024)}MB`;
      }
    } else {
      if (!ALLOWED_PROMPT_FILE_TYPES.includes(fileType)) {
        return `Invalid file type. Allowed types: PDF, DOCX`;
      }
      
      if (fileSize > MAX_PROMPT_FILE_SIZE) {
        return `Prompt files must be under ${MAX_PROMPT_FILE_SIZE / (1024 * 1024)}MB`;
      }
    }
    
    return null;
  };

  const handleMediaFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const errors: string[] = [];
    const validFiles: File[] = [];

    files.forEach(file => {
      const error = validateFile(file, true);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setError(''), 5000);
    }
    
    if (validFiles.length > 0) {
      setMediaFiles(prev => [...prev, ...validFiles]);
    }
    
    e.target.value = '';
  };

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setError(''), 5000);
    }
    
    if (validFiles.length > 0) {
      setPromptFiles(prev => [...prev, ...validFiles]);
    }
    
    e.target.value = '';
  };

  const uploadFile = async (file: File, bucketName: string, userId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${uuidv4()}.${fileExt}`;
      console.log(`Uploading file ${file.name} to ${bucketName}/${fileName}`);
      const { error: uploadError, data } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);
      if (uploadError) {
        const errorMessage = uploadError && typeof uploadError === 'object' && 'message' in uploadError
          ? uploadError.message
          : 'Unknown error occurred';
        if (typeof errorMessage === 'string') {
          if (errorMessage.includes('storage/bucket-not-found')) {
            throw new Error(`Storage bucket "${bucketName}" not found. Please contact support.`);
          }
          if (errorMessage.includes('storage/invalid-mime-type')) {
            throw new Error(`File type not allowed for ${file.name}. Please check the supported file types.`);
          }
        }
        throw new Error(`Failed to upload file ${file.name}: ${errorMessage}`);
      }
      if (!data || !data.path) {
        throw new Error(`Failed to get upload path for ${file.name}`);
      }
      return fileName;
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user) {
      setError('You must be logged in to create a prompt.');
      setLoading(false);
      return;
    }

    try {
      const mediaUrls = await Promise.all(
        mediaFiles.map(async (file) => {
          try {
            const timestamp = Date.now();
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

      const promptUrls = await Promise.all(
        promptFiles.map(async (file) => {
          try {
            const timestamp = Date.now();
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

      const promptData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        product_type: formData.productType,
        category: formData.categories,
        subcategory: formData.subcategories,
        price: parseFloat(formData.price),
        ai_platform: formData.aiPlatform,
        estimated_run_time: formData.estimatedRunTime,
        ai_running_cost: parseFloat(formData.aiRunningCost),
        media_urls: mediaUrls,
        prompt_file_urls: promptUrls,
        media_links: mediaLinks,
        seller_id: user.id,
        created_at: new Date().toISOString(),
        ...(formData.productType === 'api' && {
          api_endpoint: formData.apiEndpoint,
          auth_type: formData.authType,
        }),
        ...(formData.productType === 'automation' && {
          agent_type: formData.agentType,
          required_resources: formData.requiredResources,
        }),
      };

      const { error: insertError } = await supabase.from('prompts').insert([promptData]);

      if (insertError) {
        console.error('Database insert error:', insertError);
        setError(insertError.message);
      } else {
        setFormData({
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
        setMediaFiles([]);
        setPromptFiles([]);
        setMediaLinks([]);
        alert('Prompt created successfully!');
        window.dispatchEvent(new Event('promptCreated'));
      }
    } catch (err) {
      console.error('Error creating prompt:', err);
      setError('Failed to create prompt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = (newLink: Omit<MediaLink, 'id'>) => {
    setMediaLinks([...mediaLinks, { ...newLink, id: Date.now().toString() }]);
    setShowLinkForm(false);
  };

  const handleDeleteLink = (id: string) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      setMediaLinks(links => links.filter(link => link.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded relative" role="alert">
          <pre className="whitespace-pre-wrap font-mono text-sm">{error}</pre>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Upload New Prompt</h2>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <span className={`text-sm ${formData.title.length > 60 ? 'text-red-500' : 'text-gray-500'}`}>
                  {formData.title.length}/60
                </span>
              </div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                  formData.title.length > 60 ? 'border-red-500' : ''
                }`}
                placeholder="Enter prompt title"
                required
                maxLength={60}
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
                placeholder="29.99"
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
                Estimated Run Time
              </label>
              <input
                type="text"
                name="estimatedRunTime"
                value={formData.estimatedRunTime}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., 2-3 minutes"
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
                step="0.01"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="0.15"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your prompt..."
              required
            />
          </div>

          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
              Requirements
            </label>
            <textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="List the requirements for using this prompt..."
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Media Links
              </label>
              <button
                type="button"
                onClick={() => setShowLinkForm(true)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Link
              </button>
            </div>

            {showLinkForm && (
              <MediaLinkForm
                onSubmit={handleAddLink}
                onCancel={() => setShowLinkForm(false)}
              />
            )}

            <div className="space-y-3 mb-6">
              {mediaLinks.map((link) => (
                <MediaLinkCard
                  key={link.id}
                  link={link}
                  onDelete={() => handleDeleteLink(link.id)}
                />
              ))}

              {mediaLinks.length === 0 && !showLinkForm && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <Link2 className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">
                    Add links to your portfolio, YouTube videos, or other media
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media Files
              <span className="text-sm text-gray-500 ml-2">
                (Images: max 5MB, Videos: max 50MB)
              </span>
            </label>
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
                  accept="image/jpeg,image/png,image/gif,video/mp4,video/webm"
                  multiple
                  onChange={handleMediaFilesChange}
                />
              </label>
              <p className="mt-1 text-sm text-gray-500">
                Supported formats: JPG, PNG, GIF, MP4, WEBM
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prompt Files
              <span className="text-sm text-gray-500 ml-2">
                (Max 10MB per file)
              </span>
            </label>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Endpoint
                  </label>
                  <input
                    type="text"
                    name="apiEndpoint"
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://api.example.com/v1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Authentication Type
                  </label>
                  <select
                    name="authType"
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select auth type</option>
                    <option value="api-key">API Key</option>
                    <option value="oauth2">OAuth 2.0</option>
                    <option value="bearer">Bearer Token</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {formData.productType === 'automation' && (
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900">Agent Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Type
                  </label>
                  <select
                    name="agentType"
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select agent type</option>
                    <option value="autonomous">Autonomous</option>
                    <option value="supervised">Supervised</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Resources
                  </label>
                  <input
                    type="text"
                    name="requiredResources"
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="CPU, Memory, GPU requirements"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Upload Prompt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}