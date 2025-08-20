import React from 'react';

const popularAIs = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg'
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    logo: 'https://seeklogo.com/images/M/midjourney-logo-02E160DA6E-seeklogo.com.png'
  },
  {
    id: 'dalle',
    name: 'DALL-E',
    logo: 'https://seeklogo.com/images/D/dall-e-logo-1DD62F0D6C-seeklogo.com.png'
  },
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    logo: 'https://seeklogo.com/images/S/stable-diffusion-logo-C2BA8B27AD-seeklogo.com.png'
  },
  {
    id: 'claude',
    name: 'Claude',
    logo: 'https://seeklogo.com/images/A/anthropic-claude-logo-7ABEA5C5A9-seeklogo.com.png'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    logo: 'https://seeklogo.com/images/G/google-gemini-logo-A5787B2669-seeklogo.com.png'
  }
];

export function PopularAIs() {
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
                  <img
                    src={ai.logo}
                    alt={ai.name}
                    className="h-24 w-24 object-contain mb-4"
                  />
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
                  <img
                    src={ai.logo}
                    alt={ai.name}
                    className="h-24 w-24 object-contain mb-4"
                  />
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