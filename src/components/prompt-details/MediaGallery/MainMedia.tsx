import React from 'react';
import { Play } from 'lucide-react';
import { MediaLinkPreview } from '../../seller/prompt/MediaLinkPreview';

interface MainMediaProps {
  media: { type: 'image' | 'video'; url: string };
}

export function MainMedia({ media }: MainMediaProps) {
  // Helper to detect direct image or video file
  const isVideo = (url: string) => /\.(mp4|webm|ogg|mov|avi|mpeg|ogv)(\?|$)/i.test(url);
  const isImage = (url: string) => 
    /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url) || 
    (url.includes('supabase') && !isVideo(url));

  // Check if it's a video platform URL (YouTube, Vimeo, etc.)
  const isVideoLink = (url: string) => 
    url.includes('youtube.com') || 
    url.includes('youtu.be') || 
    url.includes('vimeo.com') ||
    url.includes('drive.google.com');

  console.log(`[MainMedia] Rendering media type: ${media.type}, URL: ${media.url}`);

  // If it's marked as image type and not a video link
  if (media.type === 'image' && !isVideoLink(media.url)) {
    return (
      <div className="relative aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={media.url}
          alt=""
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
    );
  }
  
  // If it's marked as video type and appears to be a direct video file (including Supabase storage)
  if (media.type === 'video' && !isVideoLink(media.url)) {
    console.log(`[MainMedia] Rendering direct video: ${media.url}`);
    return (
      <div className="relative aspect-[16/9] bg-black rounded-lg overflow-hidden">
        <video 
          controls 
          className="w-full h-full object-contain"
          preload="metadata"
        >
          <source src={media.url} type="video/mp4" />
          <source src={media.url} type="video/webm" />
          <source src={media.url} type="video/ogg" />
          <source src={media.url} type="video/quicktime" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }
  
  // If it's a video platform link or other external link
  if (media.type === 'video' || isVideoLink(media.url)) {
    return (
      <div className="relative aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden">
        <MediaLinkPreview url={media.url} title={''} />
      </div>
    );
  }
  
  // Fallback: treat as external link
  return (
    <div className="relative aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden">
      <MediaLinkPreview url={media.url} title={''} />
    </div>
  );
}