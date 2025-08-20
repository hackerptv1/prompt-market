import React, { useState, useEffect } from 'react';
import { Play, Link2, AlertCircle } from 'lucide-react';

interface MediaLinkPreviewProps {
  url: string;
  title: string;
  size?: 'small' | 'large';
}

// oEmbed endpoints for popular platforms
const oEmbedEndpoints: { [key: string]: (url: string) => string } = {
  'youtube.com': url => `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
  'youtu.be': url => `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
  'vimeo.com': url => `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
  'soundcloud.com': url => `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`,
  'twitter.com': url => `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`,
  'instagram.com': url => `https://graph.facebook.com/v8.0/instagram_oembed?url=${encodeURIComponent(url)}`,
};

// Known iframe embeddable platforms
const iframePlatforms: { [key: string]: (url: string) => string | null } = {
  'tiktok.com': url => {
    const match = url.match(/tiktok.com\/(?:@\w+\/video\/|v\/)?(\d+)/);
    return match ? `https://www.tiktok.com/embed/${match[1]}` : null;
  },
  'spotify.com': url => {
    const match = url.match(/spotify.com\/(track|album|playlist)\/([\w\d]+)/);
    if (!match) return null;
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
  },
  'figma.com': url => `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`,
  'notion.so': url => `https://notion.so/embed?url=${encodeURIComponent(url)}`,
};

// Helper: get oEmbed endpoint for a URL
function getOEmbedEndpoint(url: string): string | null {
  for (const domain in oEmbedEndpoints) {
    if (url.includes(domain)) return oEmbedEndpoints[domain](url);
  }
  return null;
}
// Helper: get iframe embed for a URL
function getIframeEmbed(url: string): string | null {
  for (const domain in iframePlatforms) {
    if (url.includes(domain)) return iframePlatforms[domain](url);
  }
  return null;
}

// Helper: YouTube ID
function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : null;
}
// Helper: Vimeo ID
function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}
// Helper: TikTok ID
function getTikTokId(url: string): string | null {
  const match = url.match(/tiktok.com\/(?:@\w+\/video\/|v\/)?(\d+)/);
  return match ? match[1] : null;
}
// Helper: Spotify embed
function getSpotifyEmbed(url: string): string | null {
  const match = url.match(/spotify.com\/(track|album|playlist)\/([\w\d]+)/);
  if (!match) return null;
  return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
}
// Helper: Figma embed
function getFigmaEmbed(url: string): string | null {
  if (url.includes('figma.com')) {
    return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`;
  }
  return null;
}
// Helper: Notion embed
function getNotionEmbed(url: string): string | null {
  if (url.includes('notion.so')) {
    return `https://notion.so/embed?url=${encodeURIComponent(url)}`;
  }
  return null;
}
// Helper: SoundCloud oEmbed
function getSoundCloudOEmbed(url: string): string {
  return `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`;
}

export function MediaLinkPreview({ url, title, size = 'large' }: MediaLinkPreviewProps) {
  const aspectClass = size === 'small' ? 'aspect-square' : 'aspect-video';
  const sizeClass = size === 'small' ? 'w-24 h-24' : 'w-full h-full';
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [oEmbedHtml, setOEmbedHtml] = useState<string | null>(null);

  // Direct platform detection
  const youTubeId = getYouTubeId(url);
  const vimeoId = getVimeoId(url);
  const tikTokId = getTikTokId(url);
  const spotifyEmbed = getSpotifyEmbed(url);
  const figmaEmbed = getFigmaEmbed(url);
  const notionEmbed = getNotionEmbed(url);

  // SoundCloud oEmbed (still works reliably)
  useEffect(() => {
    let cancelled = false;
    async function fetchSoundCloudOEmbed() {
      setIsLoading(true);
      setIsError(false);
      setOEmbedHtml(null);
      if (url.includes('soundcloud.com')) {
        try {
          const proxy = 'https://corsproxy.io/?';
          const oEmbedUrl = getSoundCloudOEmbed(url);
          const res = await fetch(proxy + oEmbedUrl);
          if (!res.ok) throw new Error('oEmbed fetch failed');
          const data = await res.json();
          if (!cancelled && data.html) {
            setOEmbedHtml(data.html);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          // Fallback
        }
      }
      setIsLoading(false);
    }
    fetchSoundCloudOEmbed();
    return () => { cancelled = true; };
  }, [url]);

  // Google Drive, Dropbox, OneDrive, and previous logic
  const getGoogleDriveEmbedUrl = (url: string) => {
    const fileIdMatch = url.match(/(?:file\/d\/|open\?id=)([\w-]+)/);
    if (fileIdMatch) {
      return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
    return null;
  };
  const getDropboxDirectUrl = (url: string) => {
    if (url.includes('dropbox.com')) {
      return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
    }
    return null;
  };
  const getOneDriveEmbedUrl = (url: string) => {
    if (url.includes('1drv.ms')) {
      return `https://onedrive.live.com/embed?resurl=${encodeURIComponent(url)}`;
    }
    return null;
  };
  const googleDriveEmbed = getGoogleDriveEmbedUrl(url);
  const dropboxDirect = getDropboxDirectUrl(url);
  const oneDriveEmbed = getOneDriveEmbedUrl(url);

  // Helper: is direct image/video
  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  const isVideo = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);

  if (isLoading) {
    return (
      <div className={`relative ${aspectClass} ${sizeClass} bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // YouTube iframe
  if (youTubeId) {
    return (
      <div className={`relative ${aspectClass} ${sizeClass} bg-gray-100 rounded-lg overflow-hidden`}>
        <iframe
          src={`https://www.youtube.com/embed/${youTubeId}`}
          title={title || 'YouTube video'}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  // Vimeo iframe
  if (vimeoId) {
    return (
      <div className={`relative ${aspectClass} ${sizeClass} bg-gray-100 rounded-lg overflow-hidden`}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          title={title || 'Vimeo video'}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  // TikTok iframe
  if (tikTokId) {
    return (
      <div className={`relative ${aspectClass} ${sizeClass} bg-gray-100 rounded-lg overflow-hidden`}>
        <iframe
          src={`https://www.tiktok.com/embed/${tikTokId}`}
          title={title || 'TikTok video'}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  // Spotify iframe
  if (spotifyEmbed) {
    return (
      <div className={`relative ${aspectClass} ${sizeClass} bg-gray-100 rounded-lg overflow-hidden`}>
        <iframe
          src={spotifyEmbed}
          title={title || 'Spotify'}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  // Figma iframe
  if (figmaEmbed) {
    return (
      <div className={`relative ${aspectClass} ${sizeClass} bg-gray-100 rounded-lg overflow-hidden`}>
        <iframe
          src={figmaEmbed}
          title={title || 'Figma'}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  // Notion iframe
  if (notionEmbed) {
    return (
      <div className={`relative ${aspectClass} ${sizeClass} bg-gray-100 rounded-lg overflow-hidden`}>
        <iframe
          src={notionEmbed}
          title={title || 'Notion'}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  // SoundCloud oEmbed
  if (oEmbedHtml) {
    return (
      <div className={`relative ${aspectClass} ${sizeClass} bg-gray-100 rounded-lg overflow-hidden`} dangerouslySetInnerHTML={{ __html: oEmbedHtml }} />
    );
  }
  // Google Drive
  if (googleDriveEmbed) {
    return (
      <div className={`relative ${aspectClass} ${sizeClass} bg-gray-100 rounded-lg overflow-hidden`}>
        <iframe
          src={googleDriveEmbed}
          title={title || 'Google Drive Preview'}
          className="absolute inset-0 w-full h-full"
          allow="autoplay"
        />
      </div>
    );
  }
  // Dropbox
  if (dropboxDirect) {
    if (isImage(dropboxDirect)) {
      return (
        <div className={`relative ${aspectClass} ${sizeClass} bg-gray-100 rounded-lg overflow-hidden`}>
          <img
            src={dropboxDirect}
            alt={title || 'Dropbox Preview'}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      );
    } else if (isVideo(dropboxDirect)) {
      return (
        <div className={`relative ${aspectClass} ${sizeClass} bg-gray-100 rounded-lg overflow-hidden`}>
          <video
            src={dropboxDirect}
            controls
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      );
    } else {
      return (
        <div className={`relative ${aspectClass} ${sizeClass} bg-gray-100 rounded-lg overflow-hidden flex items-center justify-between border border-blue-200`}>
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-500 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l4 4-4 4-4-4 4-4zm0 8l4 4-4 4-4-4 4-4z"></path></svg>
            <div>
              <div className="font-medium">Dropbox File</div>
              <div className="text-xs text-gray-500 truncate max-w-[200px]">{url}</div>
            </div>
          </div>
          <a href={dropboxDirect} target="_blank" rel="noopener noreferrer" className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full">Open</a>
        </div>
      );
    }
  }
  // OneDrive
  if (oneDriveEmbed) {
    return (
      <div className={`relative ${aspectClass} ${sizeClass} bg-gray-100 rounded-lg overflow-hidden`}>
        <iframe
          src={oneDriveEmbed}
          title={title || 'OneDrive Preview'}
          className="absolute inset-0 w-full h-full"
          allow="autoplay"
        />
      </div>
    );
  }
  // Direct image/video fallback
  if (isImage(url)) {
    return (
      <div className={`relative ${aspectClass} ${sizeClass} bg-gray-100 rounded-lg overflow-hidden`}>
        <img
          src={url}
          alt={title || 'Media Preview'}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    );
  }
  if (isVideo(url)) {
    return (
      <div className={`relative ${aspectClass} ${sizeClass} bg-gray-100 rounded-lg overflow-hidden`}>
        <video
          src={url}
          controls
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    );
  }
  // Fallback: link preview card
  return (
    <div className={`relative ${aspectClass} ${sizeClass} bg-gray-50 p-4 rounded-lg overflow-hidden flex items-center justify-between border border-gray-200`}>
      <div className="flex items-center">
        <Link2 className="h-5 w-5 text-blue-500 mr-3" />
        <div>
          <div className="font-medium">{title || 'External Link'}</div>
          <div className="text-xs text-gray-500 truncate max-w-[200px]">{url}</div>
        </div>
      </div>
      <a 
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full"
      >
        Visit Link
      </a>
    </div>
  );
}