import React from 'react';
import { Clock, DollarSign } from 'lucide-react';

interface AIInfoProps {
  ai: {
    name: string;
    logo: string;
    website: string;
    costPerRun: number;
    timePerRun: string;
  };
}

export function AIInfo({ ai }: AIInfoProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-4">
        <img src={ai.logo} alt={ai.name} className="h-8 w-8" />
        <div>
          <h3 className="font-medium text-gray-900">{ai.name}</h3>
          <a href={ai.website} target="_blank" rel="noopener noreferrer" 
             className="text-sm text-blue-600 hover:text-blue-700">
            Visit Website ↗
          </a>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-gray-400" />
          <div>
            <div className="text-sm text-gray-600">Cost per Run</div>
            <div className="font-medium">${ai.costPerRun.toFixed(2)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-400" />
          <div>
            <div className="text-sm text-gray-600">Time per Run</div>
            <div className="font-medium">{ai.timePerRun}</div>
          </div>
        </div>
      </div>
    </div>
  );
}