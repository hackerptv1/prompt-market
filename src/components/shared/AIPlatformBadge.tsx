import React from 'react';

interface AIPlatformBadge {
  name: string;
  logo: string;
}

export function AIPlatformBadge({ name, logo }: AIPlatformBadge) {
  return (
    <div className="flex items-center gap-1.5 bg-gray-50/90 backdrop-blur-sm px-2 py-1 rounded-md">
      <img
        src={logo}
        alt={name}
        className="h-4 w-4 object-contain"
      />
      <span className="text-xs text-gray-700 font-medium">{name}</span>
    </div>
  );
}