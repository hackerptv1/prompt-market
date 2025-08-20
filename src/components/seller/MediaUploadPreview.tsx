import React, { useState } from 'react';
import { X, FileImage, FileVideo, AlertCircle } from 'lucide-react';

interface MediaUploadPreviewProps {
  files: File[];
  onRemove: (index: number) => void;
}

export function MediaUploadPreview({ files, onRemove }: MediaUploadPreviewProps) {
  const [previewErrors, setPreviewErrors] = useState<Record<number, boolean>>({});

  if (files.length === 0) return null;

  const handleImageError = (index: number) => {
    setPreviewErrors(prev => ({ ...prev, [index]: true }));
    console.error(`Failed to load preview for file: ${files[index].name}`);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
      {files.map((file, index) => (
        <div key={index} className="relative group">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {file.type.startsWith('image/') && !previewErrors[index] ? (
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-full object-cover"
                onError={() => handleImageError(index)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-2">
                {file.type.startsWith('video/') ? (
                  <>
                    <FileVideo className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-xs text-center text-gray-500 truncate w-full">
                      {file.name}
                    </span>
                  </>
                ) : previewErrors[index] ? (
                  <>
                    <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
                    <span className="text-xs text-center text-gray-500 truncate w-full">
                      Preview unavailable
                    </span>
                    <span className="text-xs text-center text-gray-400 truncate w-full">
                      {file.name}
                    </span>
                  </>
                ) : (
                  <>
                    <FileImage className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-xs text-center text-gray-500 truncate w-full">
                      {file.name}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="absolute -top-2 -right-2 flex space-x-1">
            <button
              onClick={() => onRemove(index)}
              className="p-1 bg-red-100 text-red-600 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}