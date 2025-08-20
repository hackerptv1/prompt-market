import React from 'react';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface MediaModalProps {
  media: Array<{ type: 'image' | 'video'; url: string }>;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function MediaModal({ media, currentIndex, onClose, onNext, onPrevious }: MediaModalProps) {
  const currentMedia = media[currentIndex];

  // Helper to detect direct video file vs video platform link
  const isDirectVideo = (url: string) => /\.(mp4|webm|ogg|mov|avi|mpeg|ogv)(\?|$)/i.test(url);
  const isVideoLink = (url: string) => 
    url.includes('youtube.com') || 
    url.includes('youtu.be') || 
    url.includes('vimeo.com') ||
    url.includes('drive.google.com');

  console.log(`[MediaModal] Rendering media type: ${currentMedia.type}, URL: ${currentMedia.url}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Navigation buttons */}
      <button
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="absolute left-4 p-2 text-white/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>
      
      <button
        onClick={onNext}
        disabled={currentIndex === media.length - 1}
        className="absolute right-4 p-2 text-white/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      {/* Media content */}
      <div className="max-w-[90vw] max-h-[90vh]">
        {currentMedia.type === 'video' && !isVideoLink(currentMedia.url) ? (
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video 
              controls 
              className="w-full h-full object-contain"
              preload="metadata"
              autoPlay
            >
              <source src={currentMedia.url} type="video/mp4" />
              <source src={currentMedia.url} type="video/webm" />
              <source src={currentMedia.url} type="video/ogg" />
              <source src={currentMedia.url} type="video/quicktime" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : currentMedia.type === 'video' || isVideoLink(currentMedia.url) ? (
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src={currentMedia.url}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              title="Video content"
            />
          </div>
        ) : (
          <img
            src={currentMedia.url}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        )}
      </div>

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full text-white/90">
        {currentIndex + 1} / {media.length}
      </div>
    </div>
  );
}