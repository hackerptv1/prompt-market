import React, { useState } from 'react';
import { MediaStats } from './MediaStats';
import { MediaFilters } from './MediaFilters';
import { MediaTabs } from './MediaTabs';
import { PhotosGrid } from './photos/PhotosGrid';
import { VideosGrid } from './videos/VideosGrid';
import { MediaLinksGrid } from './links/MediaLinksGrid';

export function MediaPage() {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'links'>('photos');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
      </div>
      <MediaStats />
      <MediaFilters />
      <MediaTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'photos' && <PhotosGrid />}
      {activeTab === 'videos' && <VideosGrid />}
      {activeTab === 'links' && <MediaLinksGrid />}
    </div>
  );
}