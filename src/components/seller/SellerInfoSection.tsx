import React, { useState, useEffect } from 'react';
import { Camera, Save, Twitter, Youtube, Linkedin } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface SellerProfile {
  full_name: string;
  display_name: string;
  description: string;
  profile_picture_url: string | null;
  social_media: {
    twitter: string | null;
    youtube: string | null;
    linkedin: string | null;
  } | null;
}

export function SellerInfoSection() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<SellerProfile>({
    full_name: '',
    display_name: '',
    description: '',
    profile_picture_url: null,
    social_media: null
  });
  const [formData, setFormData] = useState({
    display_name: '',
    description: '',
    twitter: '',
    youtube: '',
    linkedin: '',
  });

  useEffect(() => {
    fetchSellerProfile();
  }, [user?.id]);

  const fetchSellerProfile = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, display_name, description, profile_picture_url, social_media')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        display_name: data.display_name || data.full_name,
        description: data.description || '',
        twitter: data.social_media?.twitter || '',
        youtube: data.social_media?.youtube || '',
        linkedin: data.social_media?.linkedin || '',
      });
    } catch (error) {
      console.error('Error fetching seller profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    try {
      setIsSaving(true);
      
      // Upload the file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // First, try to delete any existing profile picture
      if (profile.profile_picture_url) {
        const oldFileName = profile.profile_picture_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('profile-pictures')
            .remove([`${user.id}/${oldFileName}`]);
        }
      }

      // Upload the new file
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update the profile with the new picture URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, profile_picture_url: publicUrl }));
    } catch (error) {
      console.error('Error updating profile picture:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          description: formData.description,
          social_media: {
            twitter: formData.twitter || null,
            youtube: formData.youtube || null,
            linkedin: formData.linkedin || null,
          },
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => ({
        ...prev,
        display_name: formData.display_name,
        description: formData.description,
        social_media: {
          twitter: formData.twitter || null,
          youtube: formData.youtube || null,
          linkedin: formData.linkedin || null,
        },
      }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-24 bg-gray-200 rounded-full w-24 mx-auto"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Seller Information</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={profile.profile_picture_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop'}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
            {isEditing && (
              <label className="absolute bottom-0 right-0 p-1 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isSaving}
                />
              </label>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your display name"
              />
            ) : (
              <p className="text-gray-900">{profile.display_name || profile.full_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                placeholder="Tell us about yourself"
              />
            ) : (
              <p className="text-gray-600">{profile.description || 'No bio provided'}</p>
            )}
          </div>

          {/* Social Media Links */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Social Media Links</label>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg">
                    <Twitter className="h-4 w-4 text-blue-400" />
                  </div>
                  <input
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                    className="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://twitter.com/username"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-50 rounded-lg">
                    <Youtube className="h-4 w-4 text-red-500" />
                  </div>
                  <input
                    type="url"
                    value={formData.youtube}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtube: e.target.value }))}
                    className="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://youtube.com/@username"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg">
                    <Linkedin className="h-4 w-4 text-blue-600" />
                  </div>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                    className="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {profile.social_media?.twitter && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg">
                      <Twitter className="h-4 w-4 text-blue-400" />
                    </div>
                    <a
                      href={profile.social_media.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Twitter
                    </a>
                  </div>
                )}
                {profile.social_media?.youtube && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-50 rounded-lg">
                      <Youtube className="h-4 w-4 text-red-500" />
                    </div>
                    <a
                      href={profile.social_media.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      YouTube
                    </a>
                  </div>
                )}
                {profile.social_media?.linkedin && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg">
                      <Linkedin className="h-4 w-4 text-blue-600" />
                    </div>
                    <a
                      href={profile.social_media.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      LinkedIn
                    </a>
                  </div>
                )}
                {(!profile.social_media?.twitter && !profile.social_media?.youtube && !profile.social_media?.linkedin) && (
                  <p className="text-gray-500 text-sm">No social media links added</p>
                )}
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </form>
    </div>
  );
}