import React from 'react';
import { Image, Film, Link2 } from 'lucide-react';

interface MediaTabsProps {
  activeTab: 'photos' | 'videos' | 'links';
  onTabChange: (tab: 'photos' | 'videos' | 'links') => void;
}

export function MediaTabs({ activeTab, onTabChange }: MediaTabsProps) {
  const tabs = [
    { id: 'photos', label: 'Photos', icon: <Image className="h-5 w-5" /> },
    { id: 'videos', label: 'Videos', icon: <Film className="h-5 w-5" /> },
    { id: 'links', label: 'Media Links', icon: <Link2 className="h-5 w-5" /> },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as 'photos' | 'videos' | 'links')}
            className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}