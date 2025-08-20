import React, { useState, useEffect } from 'react';
import { Link2, Plus, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import { MediaLinkForm } from './media-links/MediaLinkForm';
import { MediaLinkCard } from './media-links/MediaLinkCard';
import type { MediaLink } from '../../types/mediaLinks';
import { supabase } from '../../utils/supabase';

export function MediaLinksSection() {
  const [links, setLinks] = useState<MediaLink[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    fetchMediaLinks();
  }, []);

  const fetchMediaLinks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsRefreshing(true);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('You need to be logged in to view your media links');

      // Fetch user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, media_links')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw new Error('Failed to load your profile information');
      }

      setProfileId(profileData.id);

      // Extract media links from media_links JSONB field
      const mediaLinks = profileData.media_links || [];
      
      // Transform data to match MediaLink interface
      const transformedLinks: MediaLink[] = Array.isArray(mediaLinks) 
        ? mediaLinks.map(link => ({
            id: link.id,
            title: link.title,
            url: link.url,
            platform: link.platform
          }))
        : [];

      setLinks(transformedLinks);
    } catch (err) {
      console.error('Error fetching media links:', err);
      setError(err instanceof Error ? err.message : 'Failed to load media links');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this link?')) {
      return;
    }

    try {
      if (!profileId) {
        throw new Error('Profile ID not found');
      }
      
      // Get current profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('media_links')
        .eq('id', profileId)
        .single();

      if (profileError) throw profileError;

      // Get current media links
      const currentMediaLinks = profile.media_links || [];
      
      // Filter out the link to delete
      const updatedMediaLinks = Array.isArray(currentMediaLinks) 
        ? currentMediaLinks.filter(link => link.id !== id)
        : [];

      // Update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ media_links: updatedMediaLinks })
        .eq('id', profileId);

      if (updateError) throw updateError;

      // Update local state
      setLinks(links.filter(link => link.id !== id));
    } catch (err) {
      console.error('Error deleting media link:', err);
      alert('Failed to delete media link. Please try again.');
    }
  };

  const handleAddLink = async (newLink: Omit<MediaLink, 'id'>) => {
    try {
      setIsSubmitting(true);

      if (!profileId) {
        throw new Error('Profile ID not found');
      }

      // Generate a unique ID for the new link
      const newId = crypto.randomUUID();
      
      // Get current profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('media_links')
        .eq('id', profileId)
        .single();

      if (profileError) throw profileError;

      // Get current media links or initialize an empty array
      const currentMediaLinks = profile.media_links || [];
      
      // Create new link with ID
      const newLinkWithId = {
        id: newId,
        title: newLink.title,
        url: newLink.url,
        platform: newLink.platform
      };
      
      // Add new link to the array
      const updatedMediaLinks = Array.isArray(currentMediaLinks) 
        ? [newLinkWithId, ...currentMediaLinks]
        : [newLinkWithId];

      // Update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ media_links: updatedMediaLinks })
        .eq('id', profileId);

      if (updateError) throw updateError;

      // Add the new link to the state
      const insertedLink: MediaLink = {
        id: newId,
        title: newLink.title,
        url: newLink.url,
        platform: newLink.platform
      };
      
      setLinks([insertedLink, ...links]);

      // Hide the form
      setShowForm(false);
    } catch (err) {
      console.error('Error adding media link:', err);
      alert(err instanceof Error ? err.message : 'Failed to add media link');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !isRefreshing) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Media Links</h2>
        <div className="text-center py-10 text-gray-500">Loading your media links...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Media Links</h2>
        <div className="text-center py-10 text-red-500 flex flex-col items-center gap-2">
          <AlertCircle className="h-8 w-8" />
          <p>{error}</p>
          <div className="flex space-x-3 mt-2">
            <button 
              onClick={() => fetchMediaLinks()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <button 
              onClick={() => setShowForm(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="h-5 w-5" />
              Add New Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Media Links</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchMediaLinks}
            className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
            title="Refresh links"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 px-3 py-1 rounded-md hover:bg-blue-50"
            disabled={isSubmitting || isRefreshing}
          >
            <Plus className="h-5 w-5" />
            Add Link
          </button>
        </div>
      </div>

      {showForm && (
        <MediaLinkForm
          onSubmit={handleAddLink}
          onCancel={() => setShowForm(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {isRefreshing && (
        <div className="text-center py-3 text-gray-500 text-sm">
          Refreshing...
        </div>
      )}

      <div className="space-y-3">
        {links.length > 0 ? (
          links.map((link) => (
            <MediaLinkCard
              key={link.id}
              link={link}
              onDelete={() => handleDelete(link.id)}
            />
          ))
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Link2 className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">
              Add links to your portfolio, YouTube videos, or other media
            </p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add First Link
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}