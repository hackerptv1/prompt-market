import { useState, useEffect } from 'react';
import { AILogo, addAILogo, fetchAILogos, updateAILogo, deleteAILogo } from '../../../utils/aiLogos';
import { AutomationLogo, addAutomationLogo, fetchAutomationLogos, updateAutomationLogo, deleteAutomationLogo } from '../../../utils/automationLogos';
import { supabase } from '../../../lib/supabaseClient';
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react';

// Default AI platforms
const defaultAIPlatforms = [
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'midjourney', label: 'Midjourney' },
  { id: 'dalle', label: 'DALL-E' },
  { id: 'stable-diffusion', label: 'Stable Diffusion' },
  { id: 'claude', label: 'Claude' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'copilot', label: 'GitHub Copilot' },
  { id: 'gpt-4', label: 'GPT-4' },
];

// Default Automation platforms
const defaultAutomationPlatforms = [
  { id: 'zapier', label: 'Zapier' },
  { id: 'make', label: 'Make (Integromat)' },
  { id: 'power-automate', label: 'Microsoft Power Automate' },
  { id: 'ifttt', label: 'IFTTT' },
  { id: 'n8n', label: 'n8n' },
  { id: 'pipedream', label: 'Pipedream' },
  { id: 'automate-io', label: 'Automate.io' },
  { id: 'workato', label: 'Workato' },
];

type PlatformType = 'ai' | 'automation';

interface PlatformFormData {
  platform_name: string;
  logo_url: string;
}

export function PlatformsPage() {
  const [activeTab, setActiveTab] = useState<PlatformType>('ai');
  const [aiLogos, setAiLogos] = useState<AILogo[]>([]);
  const [automationLogos, setAutomationLogos] = useState<AutomationLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<AILogo | AutomationLogo | null>(null);
  const [formData, setFormData] = useState<PlatformFormData>({ platform_name: '', logo_url: '' });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCustomPlatform, setIsCustomPlatform] = useState(false);
  const [customPlatformName, setCustomPlatformName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [aiData, automationData] = await Promise.all([
        fetchAILogos(),
        fetchAutomationLogos()
      ]);
      setAiLogos(aiData);
      setAutomationLogos(automationData);
      setError(null);
    } catch (err) {
      setError('Failed to load platform data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadImage = async (file: File, bucketName: string): Promise<string> => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let logoUrl = formData.logo_url;

      if (selectedFile) {
        const bucketName = activeTab === 'ai' ? 'ai-platform-logos' : 'automation-platform-logos';
        logoUrl = await uploadImage(selectedFile, bucketName);
      }

      if (editingItem) {
        // Update existing item
        if (activeTab === 'ai') {
          await updateAILogo(formData.platform_name, logoUrl);
        } else {
          await updateAutomationLogo(formData.platform_name, logoUrl);
        }
      } else {
        // Add new item
        if (activeTab === 'ai') {
          await addAILogo(formData.platform_name, logoUrl);
        } else {
          await addAutomationLogo(formData.platform_name, logoUrl);
        }
      }

      resetForm();
      await loadData();
      setError(null);
    } catch (err) {
      setError(`Failed to ${editingItem ? 'update' : 'add'} platform`);
      console.error(err);
    }
  };

  const handleDelete = async (platformName: string) => {
    if (!window.confirm('Are you sure you want to delete this platform?')) return;
    
    try {
      if (activeTab === 'ai') {
        await deleteAILogo(platformName);
      } else {
        await deleteAutomationLogo(platformName);
      }
      await loadData();
      setError(null);
    } catch (err) {
      setError('Failed to delete platform');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({ platform_name: '', logo_url: '' });
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingItem(null);
    setShowAddForm(false);
    setIsCustomPlatform(false);
    setCustomPlatformName('');
  };

  const startEdit = (item: AILogo | AutomationLogo) => {
    setEditingItem(item);
    setFormData({ platform_name: item.platform_name, logo_url: item.logo_url });
    setShowAddForm(true);
  };

  const currentLogos = activeTab === 'ai' ? aiLogos : automationLogos;
  const defaultPlatforms = activeTab === 'ai' ? defaultAIPlatforms : defaultAutomationPlatforms;
  const usedPlatforms = new Set(currentLogos.map(logo => logo.platform_name));
  const availablePlatforms = defaultPlatforms.filter(platform => !usedPlatforms.has(platform.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading platforms...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Platform Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Add Platform
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ai'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            AI Platforms ({aiLogos.length})
          </button>
          <button
            onClick={() => setActiveTab('automation')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'automation'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Automation Platforms ({automationLogos.length})
          </button>
        </nav>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingItem ? 'Edit' : 'Add'} {activeTab === 'ai' ? 'AI' : 'Automation'} Platform
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Platform Name</label>
                <div className="mt-1">
                  {!isCustomPlatform && !editingItem ? (
                    <div className="space-y-2">
                      <select
                        value={formData.platform_name}
                        onChange={(e) => {
                          if (e.target.value === 'custom') {
                            setIsCustomPlatform(true);
                            setFormData({ ...formData, platform_name: '' });
                          } else {
                            setFormData({ ...formData, platform_name: e.target.value });
                          }
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select a platform</option>
                        {availablePlatforms.map(platform => (
                          <option key={platform.id} value={platform.id}>
                            {platform.label}
                          </option>
                        ))}
                        <option value="custom">+ Add Custom Platform</option>
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingItem ? formData.platform_name : customPlatformName}
                        onChange={(e) => {
                          if (editingItem) {
                            setFormData({ ...formData, platform_name: e.target.value });
                          } else {
                            setCustomPlatformName(e.target.value);
                            setFormData({ ...formData, platform_name: e.target.value.toLowerCase().replace(/\s+/g, '-') });
                          }
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter platform name"
                        required
                        disabled={!!editingItem}
                      />
                      {!editingItem && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomPlatform(false);
                            setCustomPlatformName('');
                            setFormData({ ...formData, platform_name: '' });
                          }}
                          className="text-sm text-blue-600 hover:text-blue-500"
                        >
                          Cancel custom platform
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Logo Image</label>
                <div className="mt-1 flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  {(previewUrl || formData.logo_url) && (
                    <img
                      src={previewUrl || formData.logo_url}
                      alt="Preview"
                      className="h-12 w-12 object-contain border rounded"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Or Logo URL</label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className={`flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? 'Uploading...' : (editingItem ? 'Save Changes' : 'Add Platform')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Platform List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {activeTab === 'ai' ? 'AI' : 'Automation'} Platforms
          </h2>
        </div>
        <div className="p-6">
          {currentLogos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No {activeTab === 'ai' ? 'AI' : 'automation'} platforms added yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentLogos.map((logo) => (
                <div key={logo.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      <img
                        src={logo.logo_url}
                        alt={`${logo.platform_name} logo`}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/api/placeholder/48/48';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 capitalize truncate" title={logo.platform_name.replace(/-/g, ' ')}>
                        {logo.platform_name.replace(/-/g, ' ')}
                      </h3>
                      <p 
                        className="text-sm text-gray-500 break-all text-ellipsis overflow-hidden" 
                        style={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          wordBreak: 'break-all'
                        }}
                        title={logo.logo_url}
                      >
                        {logo.logo_url}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => startEdit(logo)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex-shrink-0"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(logo.platform_name)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}