import React from 'react';
import { Bookmark, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ExpandableSection } from '../shared/ExpandableSection';

export function SavedPrompts() {
  const savedPrompts = [
    {
      id: '1',
      title: 'Video Script Generator',
      category: 'Video',
      price: 39.99,
      savedDate: '2024-03-15',
      thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop'
    },
    {
      id: '2',
      title: 'Social Media Strategy',
      category: 'Marketing',
      price: 29.99,
      savedDate: '2024-03-14',
      thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop'
    },
    {
      id: '3',
      title: 'Email Marketing Template',
      category: 'Marketing',
      price: 24.99,
      savedDate: '2024-03-13',
      thumbnail: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=300&fit=crop'
    },
    {
      id: '4',
      title: 'Social Media Calendar',
      category: 'Social Media',
      price: 34.99,
      savedDate: '2024-03-12',
      thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop'
    },
    {
      id: '5',
      title: 'AI Art Generator',
      category: 'Art',
      price: 49.99,
      savedDate: '2024-03-11',
      thumbnail: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400&h=300&fit=crop'
    },
    {
      id: '6',
      title: 'Product Photography',
      category: 'Photography',
      price: 44.99,
      savedDate: '2024-03-10',
      thumbnail: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=400&h=300&fit=crop'
    }
  ];

  const promptItems = savedPrompts.map((prompt) => (
    <div key={prompt.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
      <img
        src={prompt.thumbnail}
        alt={prompt.title}
        className="w-24 h-24 object-cover rounded-lg"
      />
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{prompt.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{Array.isArray(prompt.category) ? prompt.category.join(', ') : prompt.category}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900">${prompt.price}</span>
          <div className="flex gap-2">
            <button className="p-1 text-red-600 hover:bg-red-50 rounded">
              <Bookmark className="h-5 w-5 fill-current" />
            </button>
            <Link to={`/prompt/${prompt.id}`} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
              <ExternalLink className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Saved Prompts</h2>
      <ExpandableSection initialItems={2} items={promptItems} />
    </div>
  );
}