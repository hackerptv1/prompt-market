import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { MediaThumbnail } from './MediaThumbnail';
import { MediaModal } from './MediaModal';
import { MainMedia } from './MainMedia';
import { DEFAULT_PLACEHOLDER_IMAGE } from '../../../utils/constants';

interface MediaGalleryProps {
  media: Array<{ type: 'image' | 'video'; url: string }>;
  mediaLinks?: Array<{
    id: string;
    title: string;
    url: string;
    platform: string;
  }>;
  isLoadingLinks?: boolean;
}

export function MediaGallery({ media, mediaLinks = [], isLoadingLinks = false }: MediaGalleryProps) {
  console.log('[MediaGallery] mediaLinks received:', mediaLinks);
  // Helper to detect if a media url is an image or video
  const isImage = (url: string) =>
    /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url) || (url.includes('supabase') && !isVideo(url));
  const isVideo = (url: string) => /\.(mp4|webm|ogg|mov|avi|mpeg|ogv)(\?|$)/i.test(url);

  // Add all media links (video or image) as gallery items
  const allMediaFromLinks = (mediaLinks || []).map(link => {
    const isVid = isVideo(link.url) || (link.platform && (link.platform.toLowerCase().includes('youtube') || link.platform.toLowerCase().includes('vimeo'))) || link.url.includes('youtube.com') || link.url.includes('youtu.be') || link.url.includes('vimeo.com');
    return { type: isVid ? 'video' as const : 'image' as const, url: link.url };
  });

  // Merge original media and all media from links
  let galleryMedia = [
    ...media.map(item => {
      const isVid = isVideo(item.url);
      const isImg = isImage(item.url);
      console.log(`[MediaGallery] Processing media: ${item.url}, isVideo: ${isVid}, isImage: ${isImg}`);
      if (isVid) return { type: 'video' as const, url: item.url };
      if (isImg) return { type: 'image' as const, url: item.url };
      // fallback: treat as image
      return { type: 'image' as const, url: item.url };
    }),
    ...allMediaFromLinks
  ];

  // If no media is available, show default placeholder image
  if (galleryMedia.length === 0) {
    galleryMedia = [{ type: 'image', url: DEFAULT_PLACEHOLDER_IMAGE }];
  }

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Check if we're showing only the default placeholder
  const hasRealMedia = media.length > 0 || mediaLinks.length > 0;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement !== galleryRef.current && !galleryRef.current?.matches(':hover')) return;
      if (e.key === 'ArrowLeft') {
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex(prev => Math.min(prev + 1, galleryMedia.length - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryMedia.length]);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('media-scroll-container');
    if (!container) return;

    const scrollAmount = 300;
    const newPosition = direction === 'left' 
      ? scrollPosition - scrollAmount 
      : scrollPosition + scrollAmount;

    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  return (
    <div className="space-y-4" ref={galleryRef} tabIndex={0}>
      {/* Main media display with overlay arrows */}
      <div className="relative">
        <div 
          onClick={hasRealMedia ? () => setModalOpen(true) : undefined}
          className={hasRealMedia ? "cursor-pointer" : "cursor-default"}
        >
          {galleryMedia.length > 0 ? (
            <MainMedia media={galleryMedia[selectedIndex]} />
          ) : null}
        </div>
        {/* Left arrow */}
        {hasRealMedia && galleryMedia.length > 1 && (
          <button
            onClick={() => setSelectedIndex(i => Math.max(i - 1, 0))}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/90 rounded-full shadow-lg border border-gray-200 hover:bg-blue-50 transition-colors"
            disabled={selectedIndex === 0}
            aria-label="Previous media"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
        )}
        {/* Right arrow */}
        {hasRealMedia && galleryMedia.length > 1 && (
          <button
            onClick={() => setSelectedIndex(i => Math.min(i + 1, galleryMedia.length - 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/90 rounded-full shadow-lg border border-gray-200 hover:bg-blue-50 transition-colors"
            disabled={selectedIndex === galleryMedia.length - 1}
            aria-label="Next media"
          >
            <ChevronRight className="h-6 w-6 text-gray-700" />
          </button>
        )}
      </div>

      {hasRealMedia && galleryMedia.length > 1 && (
        <div className="relative px-8 py-2">
          <div
            id="media-scroll-container"
            className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          >
            {galleryMedia.map((item, index) => (
              <MediaThumbnail
                key={index}
                src={item.url}
                isVideo={item.type === 'video'}
                isSelected={index === selectedIndex}
                onClick={() => setSelectedIndex(index)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Media Links
      {isLoadingLinks ? (
        <div className="mt-6 px-4 py-8 text-center">
          <Loader2 className="h-6 w-6 text-blue-500 animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading media links...</p>
        </div>
      ) : (
        mediaLinks && mediaLinks.length > 0 && (
          <div className="mt-6 px-4">
            <h3 className="text-lg font-medium mb-4">Media Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mediaLinks.map((link) => (
                <a
                  key={link.id}
                  href={typeof link.url === 'string' ? link.url : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors group"
                >
                  <div className="p-2 bg-gray-50 rounded-full group-hover:bg-blue-50 transition-colors">
                    <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{link.title || 'Media Link'}</h4>
                    <p className="text-sm text-gray-500">{link.platform || 'Website'}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )
      )} */}

      {/* Modal */}
      {modalOpen && hasRealMedia && (
        <MediaModal
          media={galleryMedia}
          currentIndex={selectedIndex}
          onClose={() => setModalOpen(false)}
          onNext={() => setSelectedIndex(prev => Math.min(prev + 1, galleryMedia.length - 1))}
          onPrevious={() => setSelectedIndex(prev => Math.max(prev - 1, 0))}
        />
      )}
    </div>
  );
}