import React from 'react';
import { Play, Link2, AlertCircle, Loader2 } from 'lucide-react';
import type { MediaLink } from '../../types/mediaLinks';
import { DEFAULT_PLACEHOLDER_IMAGE } from '../../utils/constants';

interface PromptMediaProps {
  media: {
    images: string[];
    video?: string;
  };
  mediaLinks?: MediaLink[];
  isLoadingLinks?: boolean;
}

export function PromptMedia({ media, mediaLinks = [], isLoadingLinks = false }: PromptMediaProps) {
  // Function to get link icon based on platform
  const getLinkIcon = (platform: string) => {
    const lowercasePlatform = platform.toLowerCase();
    if (lowercasePlatform.includes('youtube')) {
      return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-red-500">
        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
      </svg>;
    } else if (lowercasePlatform.includes('vimeo')) {
      return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-blue-500">
        <path d="M22.875 10.063c-2.442 5.217-8.337 12.319-12.063 12.319-3.672 0-4.203-7.831-6.208-13.043-.987-2.565-1.624-1.976-3.474-.681l-1.128-1.455c2.698-2.372 5.398-5.127 7.057-5.28 1.868-.179 3.018 1.098 3.448 3.832.568 3.593 1.362 9.17 2.748 9.17 1.08 0 3.741-4.424 3.878-6.006.243-2.316-1.703-2.386-3.392-1.663 2.673-8.754 13.793-7.142 9.134 2.807z"></path>
      </svg>;
    } else if (lowercasePlatform.includes('twitter') || lowercasePlatform.includes('x')) {
      return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-blue-400">
        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
      </svg>;
    } else {
      return <Link2 className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Images Grid */}
      {media.images.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {media.images.map((image, index) => (
            <div key={index} className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={image}
                alt={`Example ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // On error, replace with placeholder
                  e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE;
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Video Preview */}
      {media.video && (
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
          <img
            src={`https://images.unsplash.com/photo-1590859808308-3d2d9c515b1a?w=1200&h=600&fit=crop`}
            alt="Video thumbnail"
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="p-4 rounded-full bg-white/90 hover:bg-white transition-colors">
              <Play className="h-8 w-8 text-blue-600" />
            </button>
          </div>
        </div>
      )}

      {/* Media Links Section */}
      {isLoadingLinks ? (
        <div className="mt-6 py-8 text-center">
          <Loader2 className="h-6 w-6 text-blue-500 animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading media links...</p>
        </div>
      ) : mediaLinks && mediaLinks.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Media Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mediaLinks.map((link) => (
              <a
                key={link.id}
                href={typeof link.url === 'string' ? link.url : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors group"
              >
                <div className="p-2 bg-gray-50 rounded-full group-hover:bg-blue-50 transition-colors">
                  {getLinkIcon(link.platform || '')}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {link.title || 'Media Link'}
                  </h4>
                  <p className="text-sm text-gray-500 truncate">{link.platform || 'Website'}</p>
                </div>
                <div className="text-sm text-blue-600 font-medium">Visit</div>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {/* No Media Content */}
      {media.images.length === 0 && !media.video && (!mediaLinks || mediaLinks.length === 0) && !isLoadingLinks && (
        <div className="py-10 text-center">
          <div className="flex flex-col items-center justify-center">
            <AlertCircle className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-gray-500">No media content available for this prompt</p>
          </div>
        </div>
      )}
    </div>
  );
}