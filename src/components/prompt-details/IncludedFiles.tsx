import React from 'react';
import { FileText, FileDown, Download, Lock } from 'lucide-react';

interface File {
  name: string;
  size: string;
  type: 'prompt' | 'instructions';
  format: string;
  url?: string;
}

interface IncludedFilesProps {
  files: File[];
  hasPurchased?: boolean;
  onPurchaseClick?: () => void;
}

export function IncludedFiles({ files, hasPurchased = false, onPurchaseClick }: IncludedFilesProps) {
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

  const handleFileClick = (file: File) => {
    if (!hasPurchased) {
      onPurchaseClick?.();
      return;
    }
    
    // If purchased and has URL, download the file
    if (file.url) {
      try {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = getDisplayFileName(file.name);
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error downloading file:', error);
        // Fallback: open in new tab
        window.open(file.url, '_blank');
      }
    } else {
      console.error('No download URL available for file:', file.name);
      alert('File download is not available at the moment. Please try again later.');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Included Files</h3>
      <div className="space-y-3">
        {files.map((file, index) => (
          <button 
            key={index} 
            onClick={() => handleFileClick(file)}
            className={`w-full flex items-center gap-3 p-4 border rounded-lg transition-all ${
              hasPurchased 
                ? 'border-gray-200 hover:bg-gray-50 cursor-pointer' 
                : 'border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100'
            }`}
          >
            {hasPurchased ? getIcon(file.type) : <Lock className="h-5 w-5 text-gray-400" />}
            <div className="flex-1 text-left">
              <div className={`font-medium ${hasPurchased ? 'text-gray-900' : 'text-gray-600'}`}>
                {getDisplayFileName(file.name)}
              </div>
              <div className="text-sm text-gray-500">
                {file.type.charAt(0).toUpperCase() + file.type.slice(1)} • {file.format} • {file.size}
                {!hasPurchased && ' • Locked'}
              </div>
            </div>
            {hasPurchased ? (
              <Download className="h-5 w-5 text-gray-400" />
            ) : (
              <Lock className="h-5 w-5 text-gray-400" />
            )}
          </button>
        ))}
      </div>
      {!hasPurchased && files.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            🔒 Purchase this prompt to unlock and download all files
          </p>
        </div>
      )}
    </div>
  );
}