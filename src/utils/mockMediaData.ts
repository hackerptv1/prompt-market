import type { Media, AIInfo, PromptFile } from './mockData';

export const mockMedia: Media[] = [
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
  },
  {
    type: 'video',
    url: 'https://images.unsplash.com/photo-1590859808308-3d2d9c515b1a?w=1200&h=600&fit=crop',
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&h=600&fit=crop',
  },
];

export const mockFiles: PromptFile[] = [
  {
    name: 'prompt_template.txt',
    size: '12 KB',
    type: 'prompt',
    format: 'TXT',
  },
  {
    name: 'instructions_guide.pdf',
    size: '1.2 MB',
    type: 'instructions',
    format: 'PDF',
  },
];