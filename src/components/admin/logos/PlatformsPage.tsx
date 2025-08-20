import { useState, useEffect } from 'react';
import { AILogo, addAILogo, fetchAILogos, updateAILogo, deleteAILogo } from '../../../utils/aiLogos';
import { supabase } from '../../../lib/supabaseClient';

// Default AI platforms
const defaultPlatforms = [
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'midjourney', label: 'Midjourney' },
  { id: 'dalle', label: 'DALL-E' },
  { id: 'stable-diffusion', label: 'Stable Diffusion' },
  { id: 'claude', label: 'Claude' },
  { id: 'gemini', label: 'Gemini' },
];

const SuperAdminLogos = () => {
  const [logos, setLogos] = useState<AILogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingLogo, setEditingLogo] = useState<AILogo | null>(null);
  const [newLogo, setNewLogo] = useState({ platform_name: '', logo_url: '' });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCustomPlatform, setIsCustomPlatform] = useState(false);
  const [customPlatformName, setCustomPlatformName] = useState('');

  // Fetch all logos on component mount
  useEffect(() => {
    loadLogos();
  }, []);

  const loadLogos = async () => {
    try {
      setLoading(true);
      const data = await fetchAILogos();
      setLogos(data);
      setError(null);
    } catch (err) {
      setError('Failed to load logos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('ai-platform-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ai-platform-logos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleAddLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let logoUrl = newLogo.logo_url;

      // If a file is selected, upload it first
      if (selectedFile) {
        logoUrl = await uploadImage(selectedFile);
      }

      await addAILogo(newLogo.platform_name, logoUrl);
      setNewLogo({ platform_name: '', logo_url: '' });
      setSelectedFile(null);
      setPreviewUrl(null);
      await loadLogos();
      setError(null);
    } catch (err) {
      setError('Failed to add logo');
      console.error(err);
    }
  };

  const handleUpdateLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLogo) return;
    
    try {
      let logoUrl = editingLogo.logo_url;

      // If a file is selected, upload it first
      if (selectedFile) {
        logoUrl = await uploadImage(selectedFile);
      }

      await updateAILogo(editingLogo.platform_name, logoUrl);
      setEditingLogo(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      await loadLogos();
      setError(null);
    } catch (err) {
      setError('Failed to update logo');
      console.error(err);
    }
  };

  const handleDeleteLogo = async (platformName: string) => {
    if (!window.confirm('Are you sure you want to delete this logo?')) return;
    
    try {
      await deleteAILogo(platformName);
      await loadLogos();
      setError(null);
    } catch (err) {
      setError('Failed to delete logo');
      console.error(err);
    }
  };

  // Compute available platforms (not already added)
  const usedPlatforms = new Set(logos.map(logo => logo.platform_name));
  const availablePlatforms = defaultPlatforms.filter(
    (platform) => !usedPlatforms.has(platform.id)
  );

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">AI Platform Logo Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add New Logo Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Logo</h2>
        <form onSubmit={handleAddLogo} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Platform Name</label>
            <div className="mt-1">
              {!isCustomPlatform ? (
                <div className="space-y-2">
                  <select
                    value={newLogo.platform_name}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustomPlatform(true);
                        setNewLogo({ ...newLogo, platform_name: '' });
                      } else {
                        setNewLogo({ ...newLogo, platform_name: e.target.value });
                      }
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                    value={customPlatformName}
                    onChange={(e) => {
                      setCustomPlatformName(e.target.value);
                      setNewLogo({ ...newLogo, platform_name: e.target.value.toLowerCase().replace(/\s+/g, '-') });
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter custom platform name"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomPlatform(false);
                      setCustomPlatformName('');
                      setNewLogo({ ...newLogo, platform_name: '' });
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Cancel custom platform
                  </button>
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
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
              {previewUrl && (
                <img
                  src={previewUrl}
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
              value={newLogo.logo_url}
              onChange={(e) => setNewLogo({ ...newLogo, logo_url: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="https://example.com/logo.png"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className={`bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? 'Uploading...' : 'Add Logo'}
          </button>
        </form>
      </div>

      {/* Edit Logo Form */}
      {editingLogo && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit Logo</h2>
          <form onSubmit={handleUpdateLogo} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Platform Name</label>
              <input
                type="text"
                value={editingLogo.platform_name}
                onChange={(e) => setEditingLogo({ ...editingLogo, platform_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Logo Image</label>
              <div className="mt-1 flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
                {previewUrl && (
                  <img
                    src={previewUrl}
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
                value={editingLogo.logo_url}
                onChange={(e) => setEditingLogo({ ...editingLogo, logo_url: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={uploading}
                className={`bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploading ? 'Uploading...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingLogo(null);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Logos */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Current Logos</h2>
        <div className="space-y-4">
          {logos.map((logo) => (
            <div key={logo.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <img
                  src={logo.logo_url}
                  alt={`${logo.platform_name} logo`}
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h3 className="font-medium">{logo.platform_name}</h3>
                  <p className="text-sm text-gray-500">{logo.logo_url}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingLogo(logo)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteLogo(logo.platform_name)}
                  className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogos; 