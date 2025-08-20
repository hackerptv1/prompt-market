import React from 'react';
import { Image, Film, FileText, Trash2, Download, Link2, ExternalLink } from 'lucide-react';
import { MediaCard } from './MediaCard';

const mediaItems = [
  {
    id: 1,
    type: 'image',
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=300&fit=crop',
    name: 'marketing-banner.jpg',
    size: '2.4 MB',
    uploadedBy: 'Sarah Johnson',
    date: '2024-03-15',
    prompts: [
      { id: '1', title: 'SEO Blog Generator' },
      { id: '2', title: 'Content Marketing Pack' }
    ],
    mediaLinks: [
      { id: '1', title: 'Portfolio Showcase', platform: 'Behance' },
      { id: '2', title: 'Tutorial Video', platform: 'YouTube' }
    ]
  },
  {
    id: 2,
    type: 'video',
    url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=300&h=300&fit=crop',
    name: 'product-demo.mp4',
    size: '8.7 MB',
    uploadedBy: 'Mike Wilson',
    date: '2024-03-14',
    prompts: [
      { id: '3', title: 'Video Marketing Suite' }
    ],
    mediaLinks: [
      { id: '3', title: 'Behind the Scenes', platform: 'Vimeo' }
    ]
  },
  {
    id: 3,
    type: 'document',
    url: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=300&h=300&fit=crop',
    name: 'guidelines.pdf',
    size: '1.2 MB',
    uploadedBy: 'Emma Davis',
    date: '2024-03-13',
    prompts: [
      { id: '4', title: 'Brand Guidelines Generator' }
    ],
    mediaLinks: []
  }
];

export function MediaGrid() {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {mediaItems.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}