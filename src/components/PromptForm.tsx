import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MediaLink } from '../types/mediaLinks';
import { MediaLinkForm } from './seller/media-links/MediaLinkForm';
import { v4 as uuidv4 } from 'uuid';

interface PromptFormData {
  title: string;
  description: string;
  product_type: string;
  category: string;
  price: number;
  ai_platform: string;
  estimated_run_time: number;
  ai_running_cost: number;
  media_urls: string[] | File[];
  prompt_file_urls: string[] | File[];
  media_links: MediaLink[];
  seller_id: string;
  api_endpoint?: string;
  auth_type?: string;
  api_documentation?: string;
  agent_type?: string;
  required_resources?: string[];
  agent_configuration?: Record<string, any>;
}

export default function PromptForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<PromptFormData>({
    title: '',
    description: '',
    product_type: 'prompt',
    category: 'marketing',
    price: 0,
    ai_platform: 'chatgpt',
    estimated_run_time: 5,
    ai_running_cost: 0.002,
    media_urls: [],
    prompt_file_urls: [],
    media_links: [],
    seller_id: user?.id || '',
    required_resources: [],
    agent_configuration: {}
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showMediaLinkForm, setShowMediaLinkForm] = useState(false);
  const [editMediaLinkIndex, setEditMediaLinkIndex] = useState<number | null>(null);

  // Set seller_id when user changes
  useEffect(() => {
    if (user?.id) {
      setFormData(prev => ({ ...prev, seller_id: user.id }));
    }
  }, [user]);

  // Fetch prompt data when ID changes
  useEffect(() => {
    if (id) {
      fetchPromptData();
    }
  }, [id]);

  const fetchPromptData = async () => {
    if (!id) return;
    
    setIsFetching(true);
    setError(null);

    try {
      // Fetch the prompt data
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        // Check if user is the owner of this prompt
        if (user?.id && data.seller_id !== user.id) {
          setError("You don't have permission to edit this prompt");
          setIsFetching(false);
          return;
        }

        // No need to download files if we're just displaying stored URLs
        setFormData({
          ...data,
          // Keep these as string arrays since we don't need to convert for display
          media_urls: Array.isArray(data.media_urls) ? data.media_urls : [],
          prompt_file_urls: Array.isArray(data.prompt_file_urls) ? data.prompt_file_urls : [],
          media_links: Array.isArray(data.media_links) ? data.media_links : [],
        });
      }
    } catch (err) {
      console.error('Error fetching prompt:', err);
      setError('Failed to fetch prompt data. Please try again.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'estimated_run_time' || name === 'ai_running_cost' 
        ? parseFloat(value) 
        : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'media_urls' | 'prompt_file_urls') => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        [type]: Array.from(e.target.files || [])
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user) {
      setError('You must be logged in to save prompts');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let mediaUrls: string[] = [];
      let promptFileUrls: string[] = [];

      // Handle media files if they're actual File objects
      if (formData.media_urls.length > 0 && formData.media_urls[0] instanceof File) {
        // Upload new media files
        mediaUrls = await Promise.all(
          (formData.media_urls as File[]).map(async (file) => {
            const fileName = `${user.id}/${Date.now()}-${file.name}`;
            const { data, error } = await supabase.storage
              .from('prompt-media')
              .upload(fileName, file);
            if (error) throw error;
            return data.path;
          })
        );
      } else {
        // Keep existing URLs
        mediaUrls = formData.media_urls as string[];
      }

      // Handle prompt files if they're actual File objects
      if (formData.prompt_file_urls.length > 0 && formData.prompt_file_urls[0] instanceof File) {
        // Upload new prompt files
        promptFileUrls = await Promise.all(
          (formData.prompt_file_urls as File[]).map(async (file) => {
            const fileName = `${user.id}/${Date.now()}-${file.name}`;
            const { data, error } = await supabase.storage
              .from('prompt-files')
              .upload(fileName, file);
            if (error) throw error;
            return data.path;
          })
        );
      } else {
        // Keep existing URLs
        promptFileUrls = formData.prompt_file_urls as string[];
      }

      const promptData = {
        ...formData,
        media_urls: mediaUrls,
        prompt_file_urls: promptFileUrls,
        updated_at: new Date().toISOString(),
        seller_id: user.id // Ensure seller_id is set
      };

      // If we have an ID, update the existing prompt
      if (id) {
        const { error } = await supabase
          .from('prompts')
          .update(promptData)
          .eq('id', id);

        if (error) throw error;
        setSuccessMessage('Prompt updated successfully!');
      } else {
        // Otherwise, create a new prompt
        const { data, error } = await supabase
          .from('prompts')
          .insert([{
            ...promptData,
            created_at: new Date().toISOString()
          }])
          .select();

        if (error) throw error;
        setSuccessMessage('Prompt created successfully!');
        
        // Navigate to the edit page for the new prompt
        if (data && data.length > 0) {
          navigate(`/prompts/${data[0].id}`);
        }
      }
    } catch (err) {
      console.error('Error saving prompt:', err);
      setError('Failed to save prompt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !user) return;
    
    if (!window.confirm('Are you sure you want to delete this prompt?')) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // First check if user is the owner
      const { data, error: fetchError } = await supabase
        .from('prompts')
        .select('seller_id')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      if (data && data.seller_id !== user.id) {
        setError("You don't have permission to delete this prompt");
        setIsLoading(false);
        return;
      }

      // Delete the prompt
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSuccessMessage('Prompt deleted successfully!');
      
      // Navigate back to homepage or prompts list
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Error deleting prompt:', err);
      setError('Failed to delete prompt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
        <button 
          onClick={() => id ? fetchPromptData() : setError(null)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {id ? 'Retry' : 'Create New Prompt'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{id ? 'Edit Prompt' : 'Create Prompt'}</h2>
          <div className="flex items-center gap-3">
            {id && (
              <button 
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                onClick={handleDelete}
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2 h-5 w-5">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  <line x1="10" x2="10" y1="11" y2="17"></line>
                  <line x1="14" x2="14" y1="11" y2="17"></line>
                </svg>
                Delete
              </button>
            )}
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-save h-5 w-5">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600">{successMessage}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="marketing">Marketing</option>
                <option value="art">Art & Design</option>
                <option value="education">Education</option>
                <option value="writing">Writing</option>
                <option value="development">Development</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">AI Platform</label>
              <select
                name="ai_platform"
                value={formData.ai_platform}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="chatgpt">ChatGPT</option>
                <option value="midjourney">Midjourney</option>
                <option value="dalle">DALL-E</option>
                <option value="stable-diffusion">Stable Diffusion</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Run Time (minutes)</label>
              <input
                type="number"
                name="estimated_run_time"
                min="0"
                step="0.1"
                value={formData.estimated_run_time}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">AI Running Cost ($)</label>
              <input
                type="number"
                name="ai_running_cost"
                min="0"
                step="0.001"
                value={formData.ai_running_cost}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Media Files</label>
            {Array.isArray(formData.media_urls) && formData.media_urls.length > 0 && !(formData.media_urls[0] instanceof File) && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Current files:</p>
                <ul className="space-y-1">
                  {(formData.media_urls as string[]).map((url, index) => (
                    <li key={index} className="text-sm text-blue-600">
                      {url.split('/').pop()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-2">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus h-4 w-4 text-gray-500">
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
                <span>{formData.media_urls.length > 0 ? 'Change Media' : 'Add Media'}</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                  multiple
                  onChange={(e) => handleFileChange(e, 'media_urls')}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prompt Files</label>
            {Array.isArray(formData.prompt_file_urls) && formData.prompt_file_urls.length > 0 && !(formData.prompt_file_urls[0] instanceof File) && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Current files:</p>
                <ul className="space-y-1">
                  {(formData.prompt_file_urls as string[]).map((url, index) => (
                    <li key={index} className="text-sm text-blue-600">
                      {url.split('/').pop()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-2">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload h-4 w-4 text-gray-500">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" x2="12" y1="3" y2="15"></line>
                </svg>
                <span>{formData.prompt_file_urls.length > 0 ? 'Change Files' : 'Upload Files'}</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.pdf,.doc,.docx"
                  multiple
                  onChange={(e) => handleFileChange(e, 'prompt_file_urls')}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Media Links (Optional)</label>
            <div className="space-y-2">
              {formData.media_links.length === 0 && (
                <p className="text-gray-500 text-sm">No media links added yet.</p>
              )}
              {formData.media_links.map((link, index) => (
                <div key={link.id} className="flex flex-col md:flex-row md:items-center gap-2 border p-2 rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold">{link.title}</div>
                    <div className="text-xs text-gray-500">{link.platform}</div>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs break-all">{link.url}</a>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-blue-600 hover:underline text-xs"
                      onClick={() => {
                        setEditMediaLinkIndex(index);
                        setShowMediaLinkForm(true);
                      }}
                    >Edit</button>
                    <button
                      type="button"
                      className="text-red-600 hover:underline text-xs"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          media_links: prev.media_links.filter((_, i) => i !== index)
                        }));
                      }}
                    >Remove</button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setEditMediaLinkIndex(null);
                  setShowMediaLinkForm(true);
                }}
                className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus h-4 w-4">
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
                Add Media Link
              </button>
              {showMediaLinkForm && (
                <MediaLinkForm
                  onSubmit={(link) => {
                    if (editMediaLinkIndex !== null) {
                      // Edit existing
                      setFormData(prev => {
                        const updated = [...prev.media_links];
                        updated[editMediaLinkIndex] = { ...updated[editMediaLinkIndex], ...link };
                        return { ...prev, media_links: updated };
                      });
                    } else {
                      // Add new
                      setFormData(prev => ({
                        ...prev,
                        media_links: [
                          ...prev.media_links,
                          { ...link, id: uuidv4() }
                        ]
                      }));
                    }
                    setShowMediaLinkForm(false);
                    setEditMediaLinkIndex(null);
                  }}
                  onCancel={() => {
                    setShowMediaLinkForm(false);
                    setEditMediaLinkIndex(null);
                  }}
                />
              )}
            </div>
          </div>

          {/* Optional Advanced Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Advanced Settings (Optional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Endpoint</label>
                <input
                  type="text"
                  name="api_endpoint"
                  value={formData.api_endpoint || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://api.example.com/v1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auth Type</label>
                <select
                  name="auth_type"
                  value={formData.auth_type || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Auth Type</option>
                  <option value="none">None</option>
                  <option value="api_key">API Key</option>
                  <option value="oauth">OAuth</option>
                  <option value="basic">Basic Auth</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">API Documentation</label>
                <textarea
                  name="api_documentation"
                  rows={3}
                  value={formData.api_documentation || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Provide any API documentation or instructions here"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 