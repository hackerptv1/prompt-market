import React from 'react';
import { MediaItemCard } from '../MediaItemCard';

const videos = [
  {
    id: '1',
    thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop',
    title: 'Product Demo Video',
    type: 'video',
    prompt: {
      id: 'p2',
      title: 'Video Marketing Suite'
    },
    seller: {
      id: 's2',
      name: 'Mike Wilson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
    }
  },
  // Add more videos...
];

export function VideosGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <MediaItemCard
          key={video.id}
          {...video}
          onEdit={() => console.log('Edit video', video.id)}
          onDelete={() => console.log('Delete video', video.id)}
        />
      ))}
    </div>
  );
}