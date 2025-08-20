import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';

interface SaveButtonProps {
  promptId: string;
  className?: string;
}

export function SaveButton({ promptId, className = '' }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent card click event
    setIsSaved(!isSaved);
    // TODO: Implement save functionality
  };

  return (
    <button
      onClick={handleSave}
      className={`p-1.5 rounded-full transition-all ${
        isSaved 
          ? 'bg-blue-100 text-blue-600' 
          : 'bg-gray-50/90 text-gray-600 hover:bg-gray-100/90'
      } ${className}`}
    >
      <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
    </button>
  );
}