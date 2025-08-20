import React from 'react';
import { Link2, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const mediaLinks = [
  {
    id: '1',
    title: 'Portfolio Showcase',
    platform: 'Behance',
    url: 'https://behance.net/example',
    prompt: {
      id: 'p1',
      title: 'Design Portfolio Generator'
    },
    seller: {
      id: 's1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
    }
  },
  // Add more media links...
];

export function MediaLinksGrid() {
  return (
    <div className="space-y-4">
      {mediaLinks.map((link) => (
        <div
          key={link.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Link2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{link.title}</h3>
                <p className="text-sm text-gray-500">{link.platform}</p>
                <Link
                  to={`/prompt/${link.prompt.id}`}
                  className="text-sm text-gray-600 hover:text-blue-600 mt-1 block"
                >
                  {link.prompt.title}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-gray-400 hover:text-blue-600"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
              <button className="p-1 text-gray-400 hover:text-blue-600">
                <Edit2 className="h-5 w-5" />
              </button>
              <button className="p-1 text-gray-400 hover:text-red-600">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <img
              src={link.seller.avatar}
              alt={link.seller.name}
              className="w-6 h-6 rounded-full"
            />
            <Link
              to={`/seller/profile/${link.seller.id}`}
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              {link.seller.name}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}