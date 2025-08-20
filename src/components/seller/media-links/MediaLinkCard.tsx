import React from 'react';
import { Link2, Trash2 } from 'lucide-react';
import type { MediaLink } from '../../../types/mediaLinks';

interface MediaLinkCardProps {
  link: MediaLink;
  onDelete: () => void;
}

export function MediaLinkCard({ link, onDelete }: MediaLinkCardProps) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg group hover:border-blue-200">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Link2 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{link.title}</h3>
          <p className="text-sm text-gray-600">{link.platform}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Visit →
        </a>
        <button
          onClick={onDelete}
          className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete link"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}