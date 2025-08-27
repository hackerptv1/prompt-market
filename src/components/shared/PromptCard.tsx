import React, { useState, useEffect } from 'react';
import { Star, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Prompt } from '../../types';
import { PlatformBadge } from './PlatformBadge';
import { SaveButton } from './SaveButton';
import { AIPlatformDetails } from './AIPlatformDetails';
import { supabase } from '../../lib/supabase';
import { MediaLinkPreview } from '../seller/prompt/MediaLinkPreview';
import { CARD_TITLE_MAX_LENGTH, CARD_DESCRIPTION_MAX_LENGTH, truncateText, DEFAULT_PLACEHOLDER_IMAGE } from '../../utils/constants';

// Add placeholder SVGs
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop';

const PLACEHOLDER_AVATAR = `data:image/svg+xml;base64,${btoa(`
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#f3f4f6"/>
  <circle cx="50" cy="40" r="20" fill="#9ca3af"/>
  <circle cx="50" cy="90" r="35" fill="#9ca3af"/>
</svg>
`)}`;

// Helper to get signed URL for a file in a private bucket
async function getSignedUrl(bucket: 'prompt-media', path: string): Promise<string> {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // Use the full path as stored (including user ID)
  const fullPath = path;
  console.log('fullPath', fullPath);
  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(fullPath, 3600);
    if (!error && data?.signedUrl) return data.signedUrl;
  } catch {}
  // Fallback: try public URL
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${fullPath}`;
  }
  
  return DEFAULT_PLACEHOLDER_IMAGE;
}

// Helper function to extract file name from storage URL
const getFileNameFromUrl = (url: string | undefined): string => {
  if (!url) return '';
  
  // Handle various URL formats:
  
  // 1. Handle bucket prefix: "prompt-media/path"
  const bucketPrefixes = ['prompt-media/', 'prompt-files/', 'profile-pictures/'];
  for (const prefix of bucketPrefixes) {
    if (url.startsWith(prefix)) {
      return url.substring(prefix.length);
    }
  }
  
  // 2. If it includes a forward slash but no bucket prefix, treat as a path
  if (url.includes('/') && !url.startsWith('http')) {
    return url; // Return the whole path
  }
  
  // 3. If it's a URL ending with typical image extensions, get the filename
  if (url.startsWith('http')) {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
  }
  
  // 4. Default case: return as is (likely just a filename)
  return url;
};

// Helper to check if a URL is a YouTube or Vimeo link
const isYouTube = (url: string) => /(?:youtube\.com\/watch\?v=|youtu\.be\/)/.test(url);
const isVimeo = (url: string) => /vimeo\.com\//.test(url);
const isDirectVideo = (url: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

// Helper to extract YouTube video ID
const getYouTubeId = (url: string) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : null;
};
// Helper to extract Vimeo video ID
const getVimeoId = (url: string) => {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
};

const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);

interface PromptCardProps {
  prompt: Prompt;
}

function capitalize(word: string) {
  return word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : '';
}

const categoryColors: Record<string, string> = {
  Marketing: 'bg-pink-100 text-pink-700',
  Art: 'bg-green-100 text-green-700',
  Education: 'bg-yellow-100 text-yellow-700',
  Writing: 'bg-blue-100 text-blue-700',
  // Add more categories and colors as needed
  Default: 'bg-gray-100 text-gray-700',
};

function getBestMedia(prompt: Prompt) {
  // 1. mediaUrls (direct image/video links)
  if (Array.isArray(prompt.media_urls) && prompt.media_urls.length > 0) {
    // Find the first valid image or video URL
    const validMediaUrl = prompt.media_urls.find((url: string) =>
      /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|ogg)$/i.test(url)
    );
    if (validMediaUrl) {
      return { type: 'mediaUrl', url: validMediaUrl };
    }
  }
  // 2. media_links (external links)
  if (Array.isArray(prompt.media_links) && prompt.media_links.length > 0) {
    return { type: 'mediaLink', ...prompt.media_links[0] };
  }
  // 3. thumbnail
  if (prompt.thumbnail && prompt.thumbnail !== DEFAULT_PLACEHOLDER_IMAGE) {
    return { type: 'thumbnail', url: prompt.thumbnail };
  }
  // 4. fallback
  return { type: 'fallback', url: DEFAULT_PLACEHOLDER_IMAGE };
}

export function PromptCard({ prompt }: PromptCardProps) {
  const [thumbnailError, setThumbnailError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(prompt.thumbnail || DEFAULT_PLACEHOLDER_IMAGE);
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);

  const bestMedia = getBestMedia(prompt);

  useEffect(() => {
    const loadThumbnailImage = async () => {
      if (!prompt.thumbnail) {
        setThumbnailUrl(PLACEHOLDER_IMAGE);
        return;
      }
      if (
        typeof prompt.thumbnail === 'string' &&
        prompt.thumbnail.startsWith('https://') &&
        (
          prompt.thumbnail.includes('unsplash.com') ||
          prompt.thumbnail.includes('placehold.co') ||
          prompt.thumbnail.includes('images.') ||
          prompt.thumbnail.includes('upload.')
        )
      ) {
        setThumbnailUrl(prompt.thumbnail);
        return;
      }
      if (
        typeof prompt.thumbnail === 'string' &&
        (prompt.thumbnail.startsWith('data:') || prompt.thumbnail.includes('No Image Available'))
      ) {
        setThumbnailUrl(PLACEHOLDER_IMAGE);
        return;
      }
      setIsLoadingThumbnail(true);
      try {
        const signedUrl = await getSignedUrl('prompt-media', prompt.thumbnail as string);
        setThumbnailUrl(signedUrl || PLACEHOLDER_IMAGE);
      } catch (err) {
        setThumbnailUrl(PLACEHOLDER_IMAGE);
      } finally {
        setIsLoadingThumbnail(false);
      }
    };
    loadThumbnailImage();
  }, [prompt.thumbnail, prompt.id]);

  // Helper to check if a string is an image URL
  const isImageUrl = (url: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  // Helper to check if a string is a video URL
  const isVideoUrl = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);

  return (
    <div className="group">
      <div className="bg-white border border-gray-200 group-hover:shadow-lg transition-all duration-200 rounded-xl overflow-hidden">
        <Link to={`/prompt/${prompt.id}`}>
          {/* Thumbnail or Media Preview */}
          <div className="relative aspect-video bg-gray-100 overflow-hidden">
            {isLoadingThumbnail ? (
              <div className="flex items-center justify-center h-full w-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : bestMedia.type === 'mediaUrl' ? (
              isImageUrl(bestMedia.url) ? (
                <img
                  src={bestMedia.url}
                  alt={prompt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={() => setThumbnailError(true)}
                />
              ) : isVideoUrl(bestMedia.url) ? (
                <video
                  src={bestMedia.url}
                  controls
                  className="w-full h-full object-cover"
                  poster={DEFAULT_PLACEHOLDER_IMAGE}
                />
              ) : (
                <a
                  href={bestMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-full w-full text-blue-600 underline"
                >
                  Open Media
                </a>
              )
            ) : bestMedia.type === 'mediaLink' ? (
              <MediaLinkPreview url={bestMedia.url} title={(bestMedia as any).title || ''} />
            ) : bestMedia.type === 'thumbnail' ? (
              <img
                src={thumbnailError ? DEFAULT_PLACEHOLDER_IMAGE : bestMedia.url}
                alt={prompt.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={() => setThumbnailError(true)}
              />
            ) : (
              <img
                src={DEFAULT_PLACEHOLDER_IMAGE}
                alt="No preview available"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            )}
            <div className="absolute inset-0 bg-black/5"></div>
            {/* Platform Badge */}
            <div className="absolute top-3 left-3">
              <PlatformBadge
                name={prompt.platform.name}
                logo={prompt.platform.logo}
                type={prompt.platform.type}
              />
            </div>
            {/* Save Button */}
            <div className="absolute top-3 right-3" onClick={(e) => e.preventDefault()}>
              <SaveButton promptId={prompt.id} />
            </div>
          </div>
          {/* Content */}
          <div className="p-4">
            {/* Title with truncation */}
            <h3 className="text-lg font-semibold mb-2 text-gray-900 line-clamp-2">
              {truncateText(prompt.title, CARD_TITLE_MAX_LENGTH)}
            </h3>

            {/* Description with truncation */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {truncateText(prompt.description, CARD_DESCRIPTION_MAX_LENGTH)}
            </p>
          </div>
        </Link>
        <div className="px-4 pb-4">
          {/* AI Platform Details */}
          <div className="mb-4">
            <AIPlatformDetails
              platform={prompt.platform}
              cost={prompt.aiRunningCost || 0}
              time={prompt.estimatedRunTime || 'N/A'}
            />
          </div>
          <Link 
            to={prompt.author.id ? `/seller/profile/${prompt.author.id}` : `/seller/profile`}
            className="flex items-center gap-2 mb-3 hover:text-blue-600"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={avatarError ? PLACEHOLDER_AVATAR : prompt.author.avatar}
              alt={prompt.author.name}
              className="h-6 w-6 rounded-full"
              onError={() => setAvatarError(true)}
            />
            <span className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              {prompt.author.name}
            </span>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center text-amber-400">
                <Star className="h-4 w-4 fill-current" />
                <span className="ml-1 font-medium">{(prompt.rating ?? 0).toFixed(1)}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{(prompt.total_reviews || 0).toLocaleString()} reviews</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{(prompt.author.sales_count || 0).toLocaleString()} sales</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}