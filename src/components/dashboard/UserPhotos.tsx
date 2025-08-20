import React from 'react';
import { Upload, X } from 'lucide-react';

export function UserPhotos() {
  const photos = [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
      date: '2024-03-15'
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
      date: '2024-03-14'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">My Photos</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group">
            <img
              src={photo.url}
              alt=""
              className="w-full aspect-square object-cover rounded-lg"
            />
            <button className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <label className="cursor-pointer flex items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
          <div className="text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
            <span className="text-sm text-gray-600 mt-1">Upload Photo</span>
          </div>
          <input type="file" className="hidden" accept="image/*" />
        </label>
      </div>
    </div>
  );
}