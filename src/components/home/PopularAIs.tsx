import React, { useState } from 'react';

const popularAIs = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg'
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Midjourney_Emblem.png/1200px-Midjourney_Emblem.png'
  },
  {
    id: 'dalle',
    name: 'DALL-E',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/DALL-E_2_logo.svg/1200px-DALL-E_2_logo.svg.png'
  },
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Stability_AI_logo.svg/1200px-Stability_AI_logo.svg.png'
  },
  {
    id: 'claude',
    name: 'Claude',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Anthropic_logo.svg/1200px-Anthropic_logo.svg.png'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Google_AI_Logo.svg/1200px-Google_AI_Logo.svg.png'
  }
];

export function PopularAIs() {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = event.target as HTMLImageElement;
    const platformName = img.alt || 'Unknown';
    console.log('Image failed to load:', img.src, 'for platform:', platformName);
    
    setFailedImages(prev => new Set(prev).add(platformName));
  };

  const renderPlatformIcon = (ai: typeof popularAIs[0]) => {
    const hasFailed = failedImages.has(ai.name);
    
    if (hasFailed) {
      return (
        <div className="fallback-icon h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 text-white font-bold text-lg shadow-lg">
          {ai.name.charAt(0)}
        </div>
      );
    }

    return (
      <img
        src={ai.logo}
        alt={ai.name}
        className="h-24 w-24 object-contain mb-4"
        onError={handleImageError}
      />
    );
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular AI Platforms</h2>
        
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll gap-12 py-4">
            {/* First set of logos */}
            {popularAIs.map((ai) => (
              <div key={ai.id} className="flex-none w-48">
                <div className="flex flex-col items-center">
                  {renderPlatformIcon(ai)}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {ai.name}
                  </h3>
                </div>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {popularAIs.map((ai) => (
              <div key={`${ai.id}-duplicate`} className="flex-none w-48">
                <div className="flex flex-col items-center">
                  {renderPlatformIcon(ai)}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {ai.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}