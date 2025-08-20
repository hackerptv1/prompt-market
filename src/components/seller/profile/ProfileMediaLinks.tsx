import React, { useState, useEffect } from 'react';
import { Twitter, Youtube, BookOpen, ExternalLink, Link2, Globe } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface MediaLink {
  id: string;
  title: string;
  url: string;
  platform: string;
}

interface SellerData {
  id: string;
  name: string;
}

interface ProfileMediaLinksProps {
  seller: SellerData | null;
}

// Platform icon mapping
const getPlatformIcon = (platform: string) => {
  const platformLower = platform.toLowerCase();
  switch (platformLower) {
    case 'twitter':
      return <Twitter className="h-5 w-5 text-blue-400" />;
    case 'youtube':
      return <Youtube className="h-5 w-5 text-red-500" />;
    case 'blog':
    case 'medium':
      return <BookOpen className="h-5 w-5 text-emerald-500" />;
    case 'website':
    case 'portfolio':
      return <Globe className="h-5 w-5 text-purple-500" />;
    default:
      return <Link2 className="h-5 w-5 text-gray-500" />;
  }
};

export function ProfileMediaLinks({ seller }: ProfileMediaLinksProps) {
  const [links, setLinks] = useState<MediaLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMediaLinks = async () => {
      if (!seller?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('media_links')
          .eq('id', seller.id)
          .single();

        if (error) {
          console.error('Error fetching media links:', error);
          setLinks([]);
        } else {
          const mediaLinks = data.media_links || [];
          setLinks(Array.isArray(mediaLinks) ? mediaLinks : []);
        }
      } catch (err) {
        console.error('Error fetching media links:', err);
        setLinks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMediaLinks();
  }, [seller?.id]);

  if (!seller) return null;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Media & Resources</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-gray-500">Loading media links...</div>
        </div>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Media & Resources</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-gray-500">
            <Link2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p>No media links available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Media & Resources</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {links.map((link) => (
            <a 
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors group"
            >
              <div className="p-2 rounded-full bg-gray-100 group-hover:bg-blue-50 transition-colors">
                {getPlatformIcon(link.platform)}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {link.title}
                </h3>
                <p className="text-sm text-gray-500 capitalize">{link.platform}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}