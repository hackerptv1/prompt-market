import type { Prompt } from '../types';

export interface Media {
  type: 'image' | 'video';
  url: string;
}

export interface AIInfo {
  name: string;
  logo: string;
  version?: string;
  apiEndpoint?: string;
}

export interface PromptFile {
  name: string;
  size: string;
  type: 'prompt' | 'instructions';
  format: string;
}

export const mockPrompt: Prompt = {
  id: '1',
  title: 'SEO-Optimized Blog Post Generator',
  description: 'Generate engaging blog posts optimized for search engines with perfect keyword density. This advanced prompt helps you create content that ranks well in search results while maintaining natural readability and engaging your audience.',
  requirements: 'Basic understanding of SEO principles recommended',
  price: 29.99,
  category: ['Marketing'],
  rating: 4.8,
  sales: 1250,
  thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
  media_urls: [],
  media_links: [],
  author: {
    id: '15309dce-f734-4df1-b871-cdddb7bb0792',
    name: 'SellerAcc',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 4.8,
    total_reviews: 125,
  },
  platform: {
    name: 'ChatGPT',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    type: 'ai'
  },
  createdAt: '2024-03-15',
  aiRunningCost: 0.05,
  estimatedRunTime: '~30 seconds',
  productType: 'prompt',
};

export const mockRelatedPrompts: Prompt[] = [
  {
    id: '2',
    title: 'Social Media Content Generator',
    description: 'Create engaging social media posts optimized for different platforms.',
    requirements: 'No special requirements',
    price: 24.99,
    category: ['Marketing'],
    rating: 4.7,
    sales: 980,
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=400&fit=crop',
    media_urls: [],
    media_links: [],
    author: {
      id: '98ab1c97-bf7c-4533-b7f6-7dc4d42bbe39',
      name: 'Rasim Mammadov',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      rating: 4.7,
      total_reviews: 98,
    },
    platform: {
      name: 'Claude',
      logo: 'https://seeklogo.com/images/A/anthropic-claude-logo-7ABEA5C5A9-seeklogo.com.png',
      type: 'ai'
    },
    createdAt: '2024-03-14',
    aiRunningCost: 0.03,
    estimatedRunTime: '~25 seconds',
    productType: 'prompt',
  },
  {
    id: '3',
    title: 'Email Marketing Template Generator',
    description: 'Generate high-converting email marketing templates and sequences.',
    requirements: 'Basic email marketing knowledge helpful',
    price: 34.99,
    category: ['Marketing'],
    rating: 4.9,
    sales: 750,
    thumbnail: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800&h=400&fit=crop',
    media_urls: [],
    media_links: [],
    author: {
      id: 'ed8ecb1e-8a1c-4c9f-9443-9fba0f7203b2',
      name: 'testseller',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      rating: 4.9,
      total_reviews: 75,
    },
    platform: {
      name: 'GPT-4',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
      type: 'ai'
    },
    createdAt: '2024-03-13',
    aiRunningCost: 0.08,
    estimatedRunTime: '~40 seconds',
    productType: 'prompt',
  },
];