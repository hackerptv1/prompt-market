import React from 'react';
import { MediaItemCard } from '../MediaItemCard';

const photos = [
  {
    id: '1',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    title: 'Marketing Campaign Visual',
    type: 'photo',
    prompt: {
      id: 'p1',
      title: 'SEO Blog Generator'
    },
    seller: {
      id: 's1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
    }
  },
  // Add more photos...
];

export function PhotosGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {photos.map((photo) => (
        <MediaItemCard
          key={photo.id}
          {...photo}
          onEdit={() => console.log('Edit photo', photo.id)}
          onDelete={() => console.log('Delete photo', photo.id)}
        />
      ))}
    </div>
  );
}