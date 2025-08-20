import React from 'react';
import { FileText, FileDown, Download } from 'lucide-react';

interface File {
  name: string;
  size: string;
  type: 'prompt' | 'instructions';
  format: string;
}

interface IncludedFilesProps {
  files: File[];
}

export function IncludedFiles({ files }: IncludedFilesProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'prompt': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'instructions': return <FileDown className="h-5 w-5 text-green-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  // Helper to extract file name from a string (removes prefix before first dash or slash)
  const getDisplayFileName = (name: string) => {
    // Remove everything before the last slash (for paths)
    const afterSlash = name.split('/').pop() || name;
    // Remove everything before the first dash (for uuid or timestamp prefixes)
    const dashIndex = afterSlash.indexOf('-');
    if (dashIndex !== -1 && dashIndex < afterSlash.length - 1) {
      return afterSlash.substring(dashIndex + 1);
    }
    return afterSlash;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Included Files</h3>
      <div className="space-y-3">
        {files.map((file, index) => (
          <button key={index} 
                  className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            {getIcon(file.type)}
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">{getDisplayFileName(file.name)}</div>
              <div className="text-sm text-gray-500">
                {file.type.charAt(0).toUpperCase() + file.type.slice(1)} • {file.format} • {file.size}
              </div>
            </div>
            <Download className="h-5 w-5 text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
}