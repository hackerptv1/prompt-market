import React from 'react';
import { X, FileText, Link2, Calendar, User } from 'lucide-react';

interface MediaDetailsProps {
  item: {
    id: number;
    name: string;
    size: string;
    uploadedBy: string;
    date: string;
    prompts: Array<{ id: string; title: string; }>;
    mediaLinks: Array<{ id: string; title: string; platform: string; }>;
  };
  onClose: () => void;
}

export function MediaDetails({ item, onClose }: MediaDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Media Details</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="h-4 w-4" />
              <span>Uploaded by {item.uploadedBy}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{item.date}</span>
            </div>
          </div>

          {/* Associated Prompts */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Associated Prompts
            </h4>
            <div className="space-y-2">
              {item.prompts.map(prompt => (
                <div
                  key={prompt.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-900">{prompt.title}</span>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Media Links */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Media Links
            </h4>
            <div className="space-y-2">
              {item.mediaLinks.map(link => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="text-gray-900">{link.title}</div>
                    <div className="text-sm text-gray-500">{link.platform}</div>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    Visit
                  </button>
                </div>
              ))}
              {item.mediaLinks.length === 0 && (
                <p className="text-sm text-gray-500">No media links associated</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}