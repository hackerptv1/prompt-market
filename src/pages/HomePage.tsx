import React from 'react';
import { Hero } from '../components/Hero';
import { CategoryList } from '../components/CategoryList';
import { CategoryPrompts } from '../components/home/CategoryPrompts';
import { PopularAIs } from '../components/home/PopularAIs';
import { Testimonials } from '../components/home/Testimonials';
import { InfoSection } from '../components/home/InfoSection';

// Mock data for category prompts
const instagramPrompts = [
  {
    id: '1',
    title: 'Viral Reel Script Generator',
    description: 'Create engaging scripts for Instagram Reels that go viral.',
    requirements: 'Basic understanding of Instagram Reels and content creation',
    price: 19.99,
    category: ['Social Media'],
    rating: 4.9,
    sales: 850,
    thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=400&fit=crop',
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
    createdAt: '2024-03-15',
    aiRunningCost: 0.02,
    estimatedRunTime: '2-3 minutes',
    productType: 'prompt'
  },
  {
    id: '2',
    title: 'Instagram Story Template Pack',
    description: 'Professional story templates that boost engagement.',
    requirements: 'Instagram account and basic design knowledge',
    price: 24.99,
    category: ['Social Media'],
    rating: 4.7,
    sales: 620,
    thumbnail: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&h=400&fit=crop',
    author: {
      id: '98ab1c97-bf7c-4533-b7f6-7dc4d42bbe39',
      name: 'Rasim Mammadov',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    },
    platform: {
      name: 'Midjourney',
      logo: 'https://seeklogo.com/images/M/midjourney-logo-02E160DA6E-seeklogo.com.png',
      type: 'ai' as const,
    },
    createdAt: '2024-03-14',
    aiRunningCost: 0.03,
    estimatedRunTime: '5-7 minutes',
    productType: 'prompt'
  },
  {
    id: '3',
    title: 'Carousel Post Creator',
    description: 'Generate swipeable carousel posts that convert.',
    requirements: 'Instagram business account and content planning skills',
    price: 29.99,
    category: ['Social Media'],
    rating: 4.8,
    sales: 750,
    thumbnail: 'https://images.unsplash.com/photo-1611162618479-ee4d1e0e5d48?w=800&h=400&fit=crop',
    author: {
      id: 'ed8ecb1e-8a1c-4c9f-9443-9fba0f7203b2',
      name: 'testseller',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
    platform: {
      name: 'DALL-E',
      logo: 'https://seeklogo.com/images/D/dall-e-logo-1DD62F0D6C-seeklogo.com.png',
      type: 'ai' as const,
    },
    createdAt: '2024-03-13',
    aiRunningCost: 0.04,
    estimatedRunTime: '3-4 minutes',
    productType: 'prompt'
  }
];

const websitePrompts = [
  {
    id: '4',
    title: 'Landing Page Copy Generator',
    description: 'Generate high-converting landing page copy with AI.',
    requirements: 'Basic understanding of marketing and copywriting',
    price: 39.99,
    category: ['Web Development'],
    rating: 4.8,
    sales: 620,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
    author: {
      id: '98ab1c97-bf7c-4533-b7f6-7dc4d42bbe39',
      name: 'Rasim Mammadov',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    },
    platform: {
      name: 'ChatGPT',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
      type: 'ai' as const,
    },
    createdAt: '2024-03-14',
    aiRunningCost: 0.02,
    estimatedRunTime: '4-5 minutes',
    productType: 'prompt'
  },
  {
    id: '5',
    title: 'Website SEO Optimizer',
    description: 'Optimize your website content for search engines.',
    requirements: 'Basic knowledge of SEO and content management',
    price: 34.99,
    category: ['Web Development'],
    rating: 4.9,
    sales: 480,
    thumbnail: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=400&fit=crop',
    author: {
      id: '15309dce-f734-4df1-b871-cdddb7bb0792',
      name: 'SellerAcc',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    },
    platform: {
      name: 'Claude',
      logo: 'https://seeklogo.com/images/A/anthropic-claude-logo-7ABEA5C5A9-seeklogo.com.png',
      type: 'ai' as const,
    },
    createdAt: '2024-03-12',
    aiRunningCost: 0.03,
    estimatedRunTime: '6-8 minutes',
    productType: 'prompt'
  },
  {
    id: '6',
    title: 'Product Description Writer',
    description: 'Create compelling product descriptions that sell.',
    requirements: 'Understanding of your product and target audience',
    price: 29.99,
    category: ['Web Development'],
    rating: 4.7,
    sales: 890,
    thumbnail: 'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?w=800&h=400&fit=crop',
    author: {
      id: 'ed8ecb1e-8a1c-4c9f-9443-9fba0f7203b2',
      name: 'testseller',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    },
    platform: {
      name: 'GPT-4',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
      type: 'ai' as const,
    },
    createdAt: '2024-03-11',
    aiRunningCost: 0.02,
    estimatedRunTime: '3-4 minutes',
    productType: 'prompt'
  }
];

const artPrompts = [
  {
    id: '7',
    title: 'Digital Art Style Generator',
    description: 'Create unique digital art styles with AI prompts.',
    requirements: 'Basic understanding of digital art concepts',
    price: 29.99,
    category: ['Art'],
    rating: 4.7,
    sales: 450,
    thumbnail: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&h=400&fit=crop',
    author: {
      id: '15309dce-f734-4df1-b871-cdddb7bb0792',
      name: 'SellerAcc',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
    platform: {
      name: 'Midjourney',
      logo: 'https://seeklogo.com/images/M/midjourney-logo-02E160DA6E-seeklogo.com.png',
      type: 'ai' as const,
    },
    createdAt: '2024-03-13',
    aiRunningCost: 0.05,
    estimatedRunTime: '5-7 minutes',
    productType: 'prompt'
  },
  {
    id: '8',
    title: 'Character Design Creator',
    description: 'Generate unique character designs for illustrations.',
    requirements: 'Basic knowledge of character design principles',
    price: 44.99,
    category: ['Art'],
    rating: 4.9,
    sales: 320,
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=400&fit=crop',
    author: {
      id: '98ab1c97-bf7c-4533-b7f6-7dc4d42bbe39',
      name: 'Rasim Mammadov',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
    platform: {
      name: 'DALL-E',
      logo: 'https://seeklogo.com/images/D/dall-e-logo-1DD62F0D6C-seeklogo.com.png',
      type: 'ai' as const,
    },
    createdAt: '2024-03-10',
    aiRunningCost: 0.04,
    estimatedRunTime: '4-6 minutes',
    productType: 'prompt'
  },
  {
    id: '9',
    title: 'Background Scene Generator',
    description: 'Create stunning background scenes for your artwork.',
    requirements: 'Understanding of composition and scene design',
    price: 39.99,
    category: ['Art'],
    rating: 4.8,
    sales: 580,
    thumbnail: 'https://images.unsplash.com/photo-1619410283995-43d9134e7656?w=800&h=400&fit=crop',
    author: {
      name: 'Sophie Wang',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    },
    platform: {
      name: 'Stable Diffusion',
      logo: 'https://seeklogo.com/images/S/stable-diffusion-logo-C2BA8B27AD-seeklogo.com.png',
      type: 'ai' as const,
    },
    createdAt: '2024-03-09',
    aiRunningCost: 0.03,
    estimatedRunTime: '3-5 minutes',
    productType: 'prompt'
  }
];

const marketingPrompts = [
  {
    id: '10',
    title: 'Email Marketing Campaign Generator',
    description: 'Create high-converting email marketing campaigns.',
    requirements: 'Basic understanding of email marketing principles',
    price: 49.99,
    category: ['Marketing'],
    rating: 4.9,
    sales: 720,
    thumbnail: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800&h=400&fit=crop',
    author: {
      name: 'Tom Wilson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    },
    platform: {
      name: 'ChatGPT',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
      type: 'ai' as const,
    },
    createdAt: '2024-03-08',
    aiRunningCost: 0.02,
    estimatedRunTime: '5-7 minutes',
    productType: 'prompt'
  },
  {
    id: '11',
    title: 'Ad Copy Generator',
    description: 'Generate compelling ad copy for various platforms.',
    requirements: 'Understanding of your target audience and marketing goals',
    price: 34.99,
    category: ['Marketing'],
    rating: 4.7,
    sales: 890,
    thumbnail: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=800&h=400&fit=crop',
    author: {
      name: 'Anna Lee',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
    platform: {
      name: 'Claude',
      logo: 'https://seeklogo.com/images/A/anthropic-claude-logo-7ABEA5C5A9-seeklogo.com.png',
      type: 'ai' as const,
    },
    createdAt: '2024-03-07',
    aiRunningCost: 0.03,
    estimatedRunTime: '3-4 minutes',
    productType: 'prompt'
  },
  {
    id: '12',
    title: 'Social Media Strategy Creator',
    description: 'Plan effective social media marketing strategies.',
    requirements: 'Basic knowledge of social media platforms and marketing',
    price: 39.99,
    category: ['Marketing'],
    rating: 4.8,
    sales: 650,
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e228?w=800&h=400&fit=crop',
    author: {
      name: 'Chris Brown',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
    platform: {
      name: 'GPT-4',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
      type: 'ai' as const,
    },
    createdAt: '2024-03-06',
    aiRunningCost: 0.02,
    estimatedRunTime: '4-6 minutes',
    productType: 'prompt'
  }
];

export function HomePage() {
  return (
    <>
      <Hero />
      <CategoryList />
      <CategoryPrompts title="Instagram Reel Creation" prompts={instagramPrompts} />
      <InfoSection variant="features" />
      <CategoryPrompts title="Website Development" prompts={websitePrompts} />
      <InfoSection variant="benefits" />
      <PopularAIs />
      <CategoryPrompts title="Digital Art & Design" prompts={artPrompts} />
      <InfoSection variant="how-it-works" />
      <CategoryPrompts title="Marketing & Advertising" prompts={marketingPrompts} />
      <InfoSection variant="trust" />
      <Testimonials />
    </>
  );
}