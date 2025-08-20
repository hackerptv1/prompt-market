import type { Review } from '../../../types/reviews';

export const mockReviews: Review[] = [
  {
    id: '1',
    user: {
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    },
    rating: 5,
    comment: 'Excellent prompt! Generated amazing results for my marketing campaigns. The templates are perfect for my brand.',
    date: '2 days ago',
  },
  {
    id: '2',
    user: {
      name: 'Sarah Smith',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
    rating: 4,
    comment: 'Very useful prompt, but could use more examples. Overall great value for money.',
    date: '1 week ago',
  },
  {
    id: '3',
    user: {
      name: 'Mike Wilson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    },
    rating: 5,
    comment: 'This prompt has revolutionized my content creation process. The output quality is consistently high.',
    date: '2 weeks ago',
  },
  {
    id: '4',
    user: {
      name: 'Emily Chen',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    },
    rating: 4,
    comment: 'Great value for money. The prompt generates unique and engaging content every time.',
    date: '3 weeks ago',
  },
  {
    id: '5',
    user: {
      name: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
    rating: 5,
    comment: 'Exceeded my expectations. The results are consistently high-quality and require minimal editing.',
    date: '1 month ago',
  },
  {
    id: '6',
    user: {
      name: 'Lisa Wang',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
    rating: 5,
    comment: 'Best investment for my content creation needs. Highly recommend to anyone in marketing.',
    date: '1 month ago',
  },
  {
    id: '7',
    user: {
      name: 'James Wilson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    },
    rating: 4,
    comment: 'Very comprehensive prompt with excellent instructions. Would love to see more industry-specific examples.',
    date: '2 months ago',
  },
  {
    id: '8',
    user: {
      name: 'Sophie Chen',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    },
    rating: 5,
    comment: 'The best prompt I have used so far. Saves me hours of work every week!',
    date: '2 months ago',
  }
];