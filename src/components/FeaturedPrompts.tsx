import React from 'react';
import type { Prompt } from '../types';
import { PromptCard } from './shared/PromptCard';

export function FeaturedPrompts() {
  const featuredPrompts: Prompt[] = [
    {
      id: '1',
      title: 'SEO-Optimized Blog Post Generator',
      description: 'Generate engaging blog posts optimized for search engines with perfect keyword density.',
      price: 29.99,
      category: 'Marketing',
      rating: 4.8,
      sales: 1250,
      thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
      author: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      },
      createdAt: '2024-03-15',
    },
    {
      id: '2',
      title: 'AI Art Direction Assistant',
      description: 'Perfect prompts for generating stunning AI artwork in various styles.',
      price: 49.99,
      category: 'Art',
      rating: 4.9,
      sales: 850,
      thumbnail: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&h=400&fit=crop',
      author: {
        name: 'Michael Chen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      },
      createdAt: '2024-03-14',
    },
    {
      id: '3',
      title: 'Educational Course Outline Generator',
      description: 'Create comprehensive course outlines for any subject in minutes.',
      price: 39.99,
      category: 'Education',
      rating: 4.7,
      sales: 620,
      thumbnail: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800&h=400&fit=crop',
      author: {
        name: 'Emily Davis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      },
      createdAt: '2024-03-13',
    },
  ];

  return (
    <div className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Prompts</h2>
          <a href="/browse" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all prompts →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </div>
    </div>
  );
}