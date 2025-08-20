import React from 'react';
import { X, FileText } from 'lucide-react';

interface FileUploadPreviewProps {
  files: File[];
  onRemove: (index: number) => void;
}

export function FileUploadPreview({ files, onRemove }: FileUploadPreviewProps) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {files.map((file, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
        >
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-gray-400" />
            <div>
              <div className="font-medium text-gray-900">{file.name}</div>
              <div className="text-sm text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>
          <button
            onClick={() => onRemove(index)}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
}