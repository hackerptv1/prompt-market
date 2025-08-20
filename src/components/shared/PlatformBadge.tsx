import React from 'react';

interface PlatformBadgeProps {
  name: string;
  logo: string;
  type: 'ai' | 'automation';
}

export function PlatformBadge({ name, logo, type }: PlatformBadgeProps) {
  const bgColor = type === 'ai' ? 'bg-gray-50/90' : 'bg-blue-50/90';
  const textColor = type === 'ai' ? 'text-gray-700' : 'text-blue-700';

  return (
    <div className={`flex items-center gap-1.5 ${bgColor} backdrop-blur-sm px-2 py-1 rounded-md`}>
      <img
        src={logo}
        alt={name}
        className="h-4 w-4 object-contain"
      />
      <span className={`text-xs ${textColor} font-medium`}>{name}</span>
    </div>
  );
} 