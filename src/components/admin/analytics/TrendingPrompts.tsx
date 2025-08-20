import React from 'react';
import { TrendingUp, Star } from 'lucide-react';

export function TrendingPrompts() {
  const prompts = [
    {
      title: 'SEO Blog Generator',
      thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop',
      sales: 250,
      rating: 4.8,
      growth: '+25%'
    },
    {
      title: 'Instagram Story Pack',
      thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=100&fit=crop',
      sales: 180,
      rating: 4.7,
      growth: '+18%'
    },
    {
      title: 'Email Marketing Suite',
      thumbnail: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=100&h=100&fit=crop',
      sales: 150,
      rating: 4.9,
      growth: '+15%'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Trending Prompts</h2>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {prompts.map((prompt) => (
          <div key={prompt.title} className="p-6">
            <div className="flex items-center gap-4">
              <img
                src={prompt.thumbnail}
                alt={prompt.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{prompt.title}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm">{prompt.rating}</span>
                  </div>
                  <span className="text-sm text-gray-600">{prompt.sales} sales</span>
                </div>
              </div>
              <div className="text-green-600 font-medium">
                {prompt.growth}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}