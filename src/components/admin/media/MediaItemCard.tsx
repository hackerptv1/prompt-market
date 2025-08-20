import React from 'react';
import { Edit2, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MediaItemCardProps {
  id: string;
  thumbnail: string;
  title: string;
  type: string;
  prompt: {
    id: string;
    title: string;
  };
  seller: {
    id: string;
    name: string;
    avatar: string;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function MediaItemCard({
  id,
  thumbnail,
  title,
  type,
  prompt,
  seller,
  onEdit,
  onDelete
}: MediaItemCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden group">
      <div className="aspect-video relative">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white"
          >
            <Edit2 className="h-5 w-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-medium text-gray-900 truncate">{title}</h3>
            <Link
              to={`/prompt/${prompt.id}`}
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              {prompt.title}
            </Link>
          </div>
          <button className="p-1 text-gray-400 hover:text-blue-600">
            <ExternalLink className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <img
            src={seller.avatar}
            alt={seller.name}
            className="w-6 h-6 rounded-full"
          />
          <Link
            to={`/seller/profile/${seller.id}`}
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            {seller.name}
          </Link>
        </div>
      </div>
    </div>
  );
}