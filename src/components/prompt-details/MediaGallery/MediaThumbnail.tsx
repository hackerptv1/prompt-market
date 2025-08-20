import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface MediaThumbnailProps {
  src: string;
  isVideo?: boolean;
  isSelected?: boolean;
  onClick: () => void;
}

export function MediaThumbnail({ src, isVideo, isSelected, onClick }: MediaThumbnailProps) {
  const [videoError, setVideoError] = useState(false);

  // Helper to detect YouTube or Vimeo
  const isYouTube = (url: string) => url.includes('youtube.com') || url.includes('youtu.be');
  const isVimeo = (url: string) => url.includes('vimeo.com');

  let videoPreview = null;
  if (isVideo && !videoError) {
    if (isYouTube(src)) {
      // Extract video ID
      let videoId = '';
      const match = src.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
      if (match && match[1]) videoId = match[1];
      const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : src;
      videoPreview = (
        <iframe
          src={embedUrl}
          title="YouTube video preview"
          className="w-full h-full object-cover"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ pointerEvents: 'none' }}
          onError={() => setVideoError(true)}
        />
      );
    } else if (isVimeo(src)) {
      let videoId = '';
      const match = src.match(/vimeo\.com\/(\d+)/);
      if (match && match[1]) videoId = match[1];
      const embedUrl = videoId ? `https://player.vimeo.com/video/${videoId}` : src;
      videoPreview = (
        <iframe
          src={embedUrl}
          title="Vimeo video preview"
          className="w-full h-full object-cover"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={{ pointerEvents: 'none' }}
          onError={() => setVideoError(true)}
        />
      );
    } else {
      videoPreview = (
        <video
          className="w-full h-full object-cover"
          onError={() => setVideoError(true)}
          style={{ pointerEvents: 'none' }}
        >
          <source src={src} />
        </video>
      );
    }
  }

  return (
    <button
      onClick={onClick}
      className={`
        relative flex-none w-24 transition-all duration-200
        ${isSelected ? 'ring-2 ring-blue-500 rounded-lg' : 'opacity-70 hover:opacity-100'}
      `}
    >
      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
        {isVideo && !videoError ? (
          videoPreview
        ) : (
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            onError={isVideo ? () => setVideoError(true) : undefined}
          />
        )}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="p-1 rounded-full bg-white/90">
              <Play className="h-3 w-3 text-blue-600" />
            </div>
          </div>
        )}
      </div>
    </button>
  );
}