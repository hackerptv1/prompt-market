import React from 'react';
import { Link } from 'react-router-dom';
import { PromptCard } from '../shared/PromptCard';
import { ExpandableSection } from '../shared/ExpandableSection';
import type { Prompt } from '../../types';

// Mock data for followed sellers' prompts
const followedSellerPrompts = [
    {
      id: '1',
    title: 'Advanced SEO Content Writer',
    description: 'Create SEO-optimized content that ranks high in search engines.',
    requirements: 'Basic understanding of SEO and content writing',
      price: 49.99,
      category: ['Marketing'],
    rating: 4.9,
    sales: 1200,
      thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      author: {
      id: '15309dce-f734-4df1-b871-cdddb7bb0792',
      name: 'SellerAcc',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      },
      platform: {
        name: 'ChatGPT',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
        type: 'ai' as const,
      },
    createdAt: '2024-03-10',
    aiRunningCost: 0.02,
    estimatedRunTime: '3-4 minutes',
    productType: 'prompt' as const,
    },
    {
      id: '2',
    title: 'E-commerce Product Descriptions',
    description: 'Generate compelling product descriptions that increase sales.',
    requirements: 'Understanding of your product and target audience',
    price: 34.99,
    category: ['E-commerce'],
    rating: 4.8,
    sales: 850,
    thumbnail: 'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?w=400&h=300&fit=crop',
      author: {
      id: '98ab1c97-bf7c-4533-b7f6-7dc4d42bbe39',
      name: 'Rasim Mammadov',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      },
      platform: {
      name: 'Claude',
      logo: 'https://seeklogo.com/images/A/anthropic-claude-logo-7ABEA5C5A9-seeklogo.com.png',
        type: 'ai' as const,
      },
    createdAt: '2024-03-12',
    aiRunningCost: 0.03,
    estimatedRunTime: '2-3 minutes',
    productType: 'prompt' as const,
    },
    {
      id: '3',
    title: 'Social Media Content Calendar',
    description: 'Plan and create engaging social media content for the entire month.',
    requirements: 'Basic knowledge of social media platforms and content strategy',
    price: 39.99,
    category: ['Social Media'],
      rating: 4.7,
      sales: 650,
    thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop',
      author: {
      id: 'ed8ecb1e-8a1c-4c9f-9443-9fba0f7203b2',
      name: 'testseller',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      },
      platform: {
        name: 'GPT-4',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
        type: 'ai' as const,
      },
    createdAt: '2024-03-15',
    aiRunningCost: 0.02,
    estimatedRunTime: '5-7 minutes',
    productType: 'prompt' as const,
  },
];

export function FollowedSellerPrompts() {
  const promptItems = followedSellerPrompts.map((prompt) => (
    <PromptCard key={prompt.id} prompt={prompt} />
  ));

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">New from Followed Sellers</h2>
        <Link 
          to="/browse"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          View all
        </Link>
      </div>

      <ExpandableSection 
        initialItems={2} 
        items={promptItems} 
        gridCols="grid-cols-1 md:grid-cols-2"
        gap="gap-6"
      />
    </div>
  );
}