// Text display limits
export const CARD_TITLE_MAX_LENGTH = 15;
export const CARD_DESCRIPTION_MAX_LENGTH = 32;

// File size limits in bytes
export const MAX_MEDIA_FILE_SIZE = 50 * 1024 * 1024; // 50MB for videos
export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5MB for images
export const MAX_PROMPT_FILE_SIZE = 10 * 1024 * 1024; // 10MB for documents

// Default placeholder images
export const DEFAULT_PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop';

// Allowed file types
export const ALLOWED_MEDIA_TYPES = [
  'image/jpeg', 
  'image/png', 
  'image/gif', 
  'video/mp4', 
  'video/webm',
  'video/quicktime', // .mov files
  'video/x-msvideo', // .avi files
  'video/mpeg',      // .mpeg files
  'video/ogg'        // .ogv files
];
export const ALLOWED_PROMPT_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

// Helper functions
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
} 