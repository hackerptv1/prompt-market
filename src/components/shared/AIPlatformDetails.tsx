import React from 'react';
import { Clock, DollarSign } from 'lucide-react';

interface AIPlatformDetailsProps {
  cost?: number;
  time?: string;
  platform?: {
    name: string;
    url?: string;
  };
}

export function AIPlatformDetails({ 
  cost = 0.15, 
  time = "2-3 min",
  platform = { name: 'ChatGPT', url: 'https://chat.openai.com' }
}: AIPlatformDetailsProps) {
  return (
    <div className="flex items-center gap-4 text-xs text-gray-600">
      <div className="flex items-center gap-1">
        <DollarSign className="h-3.5 w-3.5" />
        <span>${cost.toFixed(2)}/run</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" />
        <span>{time}</span>
      </div>
      <a 
        href={platform.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="hover:text-blue-600"
      >
        {platform.name}
      </a>
    </div>
  );
}