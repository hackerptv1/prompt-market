import React, { useState } from 'react';
import { Image, Film, FileText, Trash2, Download, Link2, ExternalLink } from 'lucide-react';
import { MediaDetails } from './MediaDetails';

interface MediaItem {
  id: number;
  type: string;
  url: string;
  name: string;
  size: string;
  uploadedBy: string;
  date: string;
  prompts: Array<{ id: string; title: string; }>;
  mediaLinks: Array<{ id: string; title: string; platform: string; }>;
}

interface MediaCardProps {
  item: MediaItem;
}

export function MediaCard({ item }: MediaCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Preview */}
      <div className="aspect-square relative group">
        {item.type === 'image' ? (
          <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            {item.type === 'video' ? (
              <Film className="h-12 w-12 text-gray-400" />
            ) : (
              <FileText className="h-12 w-12 text-gray-400" />
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white">
            <Download className="h-5 w-5" />
          </button>
          <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.size}</p>
          </div>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
          >
            <ExternalLink className="h-5 w-5" />
          </button>
        </div>

        {/* References Summary */}
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{item.prompts.length} prompts</span>
          </div>
          <div className="flex items-center gap-1">
            <Link2 className="h-4 w-4" />
            <span>{item.mediaLinks.length} links</span>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <MediaDetails
          item={item}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
}